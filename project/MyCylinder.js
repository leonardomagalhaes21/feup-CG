import { CGFobject } from "../lib/CGF.js";

export class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = Math.max(4, slices);
        this.stacks = Math.max(1, stacks);
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
                
                // Vértice
                this.vertices.push(x, y, h);
                
                // Normal
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
        
  
        const bottomCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, -1);
        this.texCoords.push(0.5, 0.5);
        
        // Gerar vértices para as bases
        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = slice * angleStep;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push((x + 1) / 2, (y + 1) / 2);
        }
        
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(
                bottomCenterIndex,
                bottomCenterIndex + slice + 1,
                bottomCenterIndex + slice + 2
            );
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
}