import { CGFobject } from "../lib/CGF.js";

export class MyPyramid extends CGFobject {
    constructor(scene, slices, height) {
        super(scene);
        this.slices = slices;
        this.height = height;
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        const angleDelta = 2 * Math.PI / this.slices;
        
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.0);
        
        for (let slice = 0; slice < this.slices; slice++) {
            const angle = slice * angleDelta;
            const nextAngle = (slice + 1) * angleDelta;
            
            const x = Math.cos(angle);
            const z = -Math.sin(angle);
            
            // Vértice na base
            this.vertices.push(x, 0, z);
            this.normals.push(0, -1, 0);
            
            this.texCoords.push(
                (x + 1) / 2,
                (z + 1) / 2 
            );
            
            // Índices para a base (triângulos)
            if (slice >= 2) {
                this.indices.push(1, slice, slice + 1);
            }
        }
        

        for (let slice = 0; slice < this.slices; slice++) {
            const angle = slice * angleDelta;
            const nextAngle = (slice + 1) * angleDelta;
            
            const x1 = Math.cos(angle);
            const z1 = -Math.sin(angle);
            
            const x2 = Math.cos(nextAngle);
            const z2 = -Math.sin(nextAngle);
            
            const v1 = [x1, 0, z1];
            const v2 = [x2, 0, z2];
            const v3 = [0, this.height, 0];
            
            // Vetores da face
            const vA = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
            const vB = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
            
            // Produto vetorial para normal
            const nx = vA[1] * vB[2] - vA[2] * vB[1];
            const ny = vA[2] * vB[0] - vA[0] * vB[2];
            const nz = vA[0] * vB[1] - vA[1] * vB[0];
            
            // Normalizar
            const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
            const normalX = nx/length;
            const normalY = ny/length;
            const normalZ = nz/length;
            
            this.vertices.push(x1, 0, z1);
            this.normals.push(normalX, normalY, normalZ);
            this.texCoords.push(0, 1);  
            
            this.vertices.push(x2, 0, z2);
            this.normals.push(normalX, normalY, normalZ);
            this.texCoords.push(1, 1);  
            
            // Use o vértice do topo específico para esta face
            this.vertices.push(0, this.height, 0);
            this.normals.push(normalX, normalY, normalZ);
            this.texCoords.push(0.5, 0); 

            // Índices para esta face lateral
            const baseIndex = 1 + this.slices + slice * 3;
            this.indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}