import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyPyramid } from "./MyPyramid.js";
import { MyObliqueCone } from "./MyObliqueCone.js";

/**
 * MyTree - Implementation of a parametrizable tree
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {Number} tiltAngle - Tree tilt angle in degrees (0 is vertical)
 * @param {String} tiltAxis - Axis of rotation ('X' or 'Z')
 * @param {Number} trunkRadius - Radius of the tree trunk base
 * @param {Number} treeHeight - Total height of the tree
 * @param {Array} crownColor - RGB color of the crown [r, g, b], between 0 and 1
 * @param {CGFtexture} trunkTexture - Optional texture for the trunk
 * @param {CGFtexture} crownTexture - Optional texture for the crown
 */
export class MyTree extends CGFobject {
    constructor(scene, tiltAngle = 0, tiltAxis = 'X', trunkRadius = 0.5, treeHeight = 10,
        crownColor = [0.133, 0.545, 0.133], trunkTexture = null, crownTexture = null) {
    super(scene);
    this.scene = scene;

    // Tree parameters
    this.tiltAngle = tiltAngle * Math.PI / 180; 
    this.tiltAxis = tiltAxis.toUpperCase();
    this.trunkRadius = trunkRadius;
    this.crownColor = crownColor;

    // Textures
    this.trunkTexture = trunkTexture;
    this.crownTexture = crownTexture;

    // Derived parameters
    this.trunkHeight = treeHeight * 0.2;
    this.crownHeight = treeHeight * 0.85;

    this.numLayers = Math.max(5, Math.round(this.crownHeight / 1.2));

    const layerHeightForCalc = this.crownHeight / this.numLayers;
    const pyramidHeightForCalc = layerHeightForCalc * 1.5;
    const yBaseOfLastPyramid = this.trunkHeight + ((this.numLayers - 1) * layerHeightForCalc * 0.6);
    this.actualTreeTopY = yBaseOfLastPyramid + pyramidHeightForCalc - 1;

    // Store the calculated apex offsets for the main cone (entire tree height)
    this.coneApexOffsetX = 0;
    this.coneApexOffsetZ = 0;
    if (this.tiltAngle !== 0) {
        if (this.tiltAxis === 'X') {
            this.coneApexOffsetZ = -this.actualTreeTopY * Math.tan(this.tiltAngle);
        } else if (this.tiltAxis === 'Z') {
            this.coneApexOffsetX = this.actualTreeTopY * Math.tan(this.tiltAngle);
        }
    }

    this.initMaterials();
    }
    
    initMaterials() {
        // Trunk material (brown)
        this.trunkMaterial = new CGFappearance(this.scene);
        this.trunkMaterial.setAmbient(0.35, 0.20, 0.05, 1.0);
        this.trunkMaterial.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.trunkMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.trunkMaterial.setShininess(10.0);
        if (this.trunkTexture) {
            this.trunkMaterial.setTexture(this.trunkTexture);
            this.trunkMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        // Crown material (configurable green)
        this.crownMaterial = new CGFappearance(this.scene);
        this.crownMaterial.setAmbient(this.crownColor[0]*0.3, this.crownColor[1]*0.3, this.crownColor[2]*0.3, 1.0);
        this.crownMaterial.setDiffuse(this.crownColor[0], this.crownColor[1], this.crownColor[2], 1.0);
        this.crownMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.crownMaterial.setShininess(5.0);
        if (this.crownTexture) {
            this.crownMaterial.setTexture(this.crownTexture);
            this.crownMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }

        this.trunk = new MyObliqueCone(this.scene, 12, this.trunkRadius, this.actualTreeTopY, this.coneApexOffsetX, this.coneApexOffsetZ);
        this.pyramid = new MyPyramid(this.scene, 4, 1); 
    }
    
    /**
     * Helper method to draw a truncated cone
     * @param {Number} baseRadius - Radius of the base
     * @param {Number} topRadius - Radius of the top
     * @param {Number} height - Height of the trunk
     * @param {Number} slices - Number of slices (around the cone)
     * @param {Number} stacks - Number of stacks (along the cone height)
     */
    drawTruncatedCone(baseRadius, topRadius, height, slices, stacks) {
        const stackHeight = height / stacks;
        const radiusStep = (topRadius - baseRadius) / stacks;
        
        for (let stack = 0; stack < stacks; stack++) {
            const z0 = stack * stackHeight;
            const z1 = (stack + 1) * stackHeight;
            
            const r0 = baseRadius + stack * radiusStep;
            const r1 = baseRadius + (stack + 1) * radiusStep;
            
            this.scene.pushMatrix();
            this.scene.translate(0, 0, z0);
            
            this.scene.gl.begin(this.scene.gl.TRIANGLE_STRIP);
            
            for (let slice = 0; slice <= slices; slice++) {
                const theta = slice * 2 * Math.PI / slices;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                
                const nx0 = cosTheta;
                const ny0 = sinTheta;
                const nz0 = (baseRadius - topRadius) / height;
                
                const len0 = Math.sqrt(nx0*nx0 + ny0*ny0 + nz0*nz0);
                
                const s = slice / slices;
                const t1 = stack / stacks;
                const t2 = (stack + 1) / stacks;
                
                if (this.trunkTexture) {
                    this.scene.gl.texCoord2f(s, t2);
                }
                this.scene.gl.normal3f(nx0/len0, ny0/len0, nz0/len0);
                this.scene.gl.vertex3f(r1 * cosTheta, r1 * sinTheta, z1 - z0);
                
                if (this.trunkTexture) {
                    this.scene.gl.texCoord2f(s, t1);
                }
                this.scene.gl.normal3f(nx0/len0, ny0/len0, nz0/len0);
                this.scene.gl.vertex3f(r0 * cosTheta, r0 * sinTheta, 0);
            }
            
            this.scene.gl.end();
            this.scene.popMatrix();
        }
    }
    
    /**
     * Helper method to draw a pyramid with texture support
     * @param {Number} baseSize - Size of the pyramid base
     * @param {Number} height - Height of the pyramid
     */
    drawPyramid(baseSize, height) {
        const halfBase = baseSize / 2;
        
        // Vertices (base corners and top)
        const vertices = [
            [-halfBase, -halfBase, 0],
            [halfBase, -halfBase, 0],
            [halfBase, halfBase, 0],
            [-halfBase, halfBase, 0],
            [0, 0, height]
        ];
        
        const texCoords = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0.5, 0.5]  
        ];
        
        this.scene.gl.begin(this.scene.gl.TRIANGLES);
        this.scene.gl.normal3f(0, 0, -1);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[0][0], texCoords[0][1]);
        }
        this.scene.gl.vertex3f(vertices[0][0], vertices[0][1], vertices[0][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[2][0], texCoords[2][1]);
        }
        this.scene.gl.vertex3f(vertices[2][0], vertices[2][1], vertices[2][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[1][0], texCoords[1][1]);
        }
        this.scene.gl.vertex3f(vertices[1][0], vertices[1][1], vertices[1][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[0][0], texCoords[0][1]);
        }
        this.scene.gl.vertex3f(vertices[0][0], vertices[0][1], vertices[0][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[3][0], texCoords[3][1]);
        }
        this.scene.gl.vertex3f(vertices[3][0], vertices[3][1], vertices[3][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[2][0], texCoords[2][1]);
        }
        this.scene.gl.vertex3f(vertices[2][0], vertices[2][1], vertices[2][2]);
        
        this.scene.gl.end();
        
        this.scene.gl.begin(this.scene.gl.TRIANGLES);
        
        // Front face
        const norm1 = this.calculateNormal(vertices[0], vertices[1], vertices[4]);
        this.scene.gl.normal3f(norm1[0], norm1[1], norm1[2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[0][0], texCoords[0][1]);
        }
        this.scene.gl.vertex3f(vertices[0][0], vertices[0][1], vertices[0][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[1][0], texCoords[1][1]);
        }
        this.scene.gl.vertex3f(vertices[1][0], vertices[1][1], vertices[1][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[4][0], texCoords[4][1]);
        }
        this.scene.gl.vertex3f(vertices[4][0], vertices[4][1], vertices[4][2]);
        
        // Right face
        const norm2 = this.calculateNormal(vertices[1], vertices[2], vertices[4]);
        this.scene.gl.normal3f(norm2[0], norm2[1], norm2[2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[1][0], texCoords[1][1]);
        }
        this.scene.gl.vertex3f(vertices[1][0], vertices[1][1], vertices[1][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[2][0], texCoords[2][1]);
        }
        this.scene.gl.vertex3f(vertices[2][0], vertices[2][1], vertices[2][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[4][0], texCoords[4][1]);
        }
        this.scene.gl.vertex3f(vertices[4][0], vertices[4][1], vertices[4][2]);
        
        // Back face
        const norm3 = this.calculateNormal(vertices[2], vertices[3], vertices[4]);
        this.scene.gl.normal3f(norm3[0], norm3[1], norm3[2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[2][0], texCoords[2][1]);
        }
        this.scene.gl.vertex3f(vertices[2][0], vertices[2][1], vertices[2][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[3][0], texCoords[3][1]);
        }
        this.scene.gl.vertex3f(vertices[3][0], vertices[3][1], vertices[3][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[4][0], texCoords[4][1]);
        }
        this.scene.gl.vertex3f(vertices[4][0], vertices[4][1], vertices[4][2]);
        
        // Left face
        const norm4 = this.calculateNormal(vertices[3], vertices[0], vertices[4]);
        this.scene.gl.normal3f(norm4[0], norm4[1], norm4[2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[3][0], texCoords[3][1]);
        }
        this.scene.gl.vertex3f(vertices[3][0], vertices[3][1], vertices[3][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[0][0], texCoords[0][1]);
        }
        this.scene.gl.vertex3f(vertices[0][0], vertices[0][1], vertices[0][2]);
        
        if (this.crownTexture) {
            this.scene.gl.texCoord2f(texCoords[4][0], texCoords[4][1]);
        }
        this.scene.gl.vertex3f(vertices[4][0], vertices[4][1], vertices[4][2]);
        
        this.scene.gl.end();
    }
    
    /**
     * Calculate normal vector for a triangle
     */
    calculateNormal(v1, v2, v3) {
        const vec1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        const vec2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
        
        // Cross product
        const normal = [
            vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
        ];
        
        // Normalize
        const length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
        return [normal[0]/length, normal[1]/length, normal[2]/length];
    }
    
    display() {
        this.scene.pushMatrix();
    
        // Draw Trunk
        this.trunkMaterial.apply();
        this.trunk.display(); 
    
        // Draw Crown
        this.scene.pushMatrix(); // Start crown transformations

        this.crownMaterial.apply();
        
        const layerHeight = this.crownHeight / this.numLayers;
        let currentRadius = this.trunkRadius * 3;
        let currentLayerYBase = this.trunkHeight;

        for (let layer = 0; layer < this.numLayers; layer++) {
            let fractionOfHeight = 0;
            if (this.actualTreeTopY > 0) {
                fractionOfHeight = currentLayerYBase / this.actualTreeTopY;
            }
            const layerCenterX = this.coneApexOffsetX * fractionOfHeight;
            const layerCenterZ = this.coneApexOffsetZ * fractionOfHeight;

            const layerFactor = 0.8 - (layer / this.numLayers) * 0.5;
            const pyramidBaseSize = currentRadius * 1.5 * layerFactor;
            const pyramidHeight = layerHeight * 1.5;
    
            this.scene.pushMatrix();
            this.scene.translate(layerCenterX, currentLayerYBase, layerCenterZ);
            
            if (this.tiltAngle !== 0) {
                if (this.tiltAxis === 'X') {
                    this.scene.rotate(this.tiltAngle, 1, 0, 0);
                } else if (this.tiltAxis === 'Z') {
                    this.scene.rotate(this.tiltAngle, 0, 0, 1);
                }
            }
            
            this.scene.rotate((layer % 2) * Math.PI / 6, 0, 1, 0); 
            
            this.scene.pushMatrix();
            this.scene.scale(pyramidBaseSize, pyramidHeight, pyramidBaseSize);
            this.pyramid.display();
            this.scene.popMatrix();
            
            this.scene.popMatrix(); // End this layer's transformations
    
            currentLayerYBase += layerHeight * 0.6; // Move up for the next layer's base (as before)
            currentRadius *= 0.88; // Decrease radius for next layer (as before)
        }
    
        this.scene.popMatrix(); // End crown transformations
        this.scene.popMatrix(); // End overall tree matrix
    }
}
