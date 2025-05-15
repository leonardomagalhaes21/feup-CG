import { CGFobject, CGFappearance } from "../lib/CGF.js";

export class MyBucket extends CGFobject {
    constructor(scene, slices, stacks, showWater = false) {
        super(scene);
        this.slices = Math.max(4, slices);
        this.stacks = Math.max(1, stacks);
        
        this.showWater = showWater;
        
        // Create water material
        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.0, 0.4, 0.8, 0.8);
        this.waterMaterial.setDiffuse(0.0, 0.5, 0.9, 0.8);
        this.waterMaterial.setSpecular(0.2, 0.7, 1.0, 0.9);
        this.waterMaterial.setShininess(150);
        
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        const angleStep = 2 * Math.PI / this.slices;
        const stackHeight = 1 / this.stacks;
        
        // Gerar vértices, normais e coordenadas de textura
        for (let stack = 0; stack <= this.stacks; stack++) {
            const h = stack * stackHeight;
            
            for (let slice = 0; slice <= this.slices; slice++) {
                const angle = slice * angleStep;
                const x = Math.cos(angle);
                const y = Math.sin(angle);
                
                this.vertices.push(x, y, h);
                
                this.normals.push(x, y, 0);
                
                this.texCoords.push(slice / this.slices, h);
            }
        }
        
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;
                
                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }
        
        const topCenterIndex = this.vertices.length / 3;
        
        this.vertices.push(0, 0, 1);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5);
        
        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = slice * angleStep;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            
            this.vertices.push(x, y, 1);
            this.normals.push(0, 0, 1);
            this.texCoords.push((x + 1) / 2, (y + 1) / 2);
        }
        
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(
                topCenterIndex,
                topCenterIndex + slice + 2,
                topCenterIndex + slice + 1
            );
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }      
    
    display() {
        this.scene.gl.enable(this.scene.gl.CULL_FACE);
        
        const sidesIndicesCount = this.slices * this.stacks * 6;
        const topIndicesStart = sidesIndicesCount;
        const topIndicesCount = this.indices.length - topIndicesStart;
        
        this.scene.gl.cullFace(this.scene.gl.BACK);
        this.drawElements(this.primitiveType, sidesIndicesCount, 0);
        
        this.scene.gl.cullFace(this.scene.gl.FRONT);
        this.drawElements(this.primitiveType, sidesIndicesCount, 0);
        
        this.scene.gl.cullFace(this.scene.gl.BACK);
        this.drawElements(this.primitiveType, topIndicesCount, topIndicesStart);
        
        if (this.showWater) {
            this.displayWater();
        }
        
        this.scene.gl.disable(this.scene.gl.CULL_FACE);
    }
    
    displayWater() {
        this.scene.pushMatrix();
        
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.waterMaterial.apply();
        
        const waterRadius = 0.9;
        const waterHeight = 0.7;
        
        this.scene.scale(waterRadius, waterRadius, waterHeight);
        
        this.drawElements(this.primitiveType, this.indices.length, 0);
        this.scene.gl.disable(this.scene.gl.BLEND);
        
        this.scene.popMatrix();
    }
    
    setShowWater(show) {
        this.showWater = show;
    }
    
    toggleWater() {
        this.showWater = !this.showWater;
    }
}
