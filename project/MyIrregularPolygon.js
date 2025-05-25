import { CGFobject } from '../lib/CGF.js';

export class MyIrregularPolygon extends CGFobject {
    constructor(scene, numVertices = 10, averageRadius = 0.5, irregularity = 0.4) {
        super(scene);
        this.numVertices = numVertices;
        this.averageRadius = averageRadius;
        this.irregularity = irregularity; // 0 for regular, >0 for irregular shape

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Center vertex for triangle fan
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5, 0.5); // Center of the texture

        // Outer vertices
        for (let i = 0; i < this.numVertices; i++) {
            const baseAngle = (i / this.numVertices) * 2 * Math.PI;
            
            // Add irregularity to radius
            const randomFactorRadius = 1 - this.irregularity + Math.random() * this.irregularity * 2;
            const currentRadius = this.averageRadius * randomFactorRadius;
            
            // Add irregularity to angle
            const angleOffsetFactor = (Math.random() - 0.5) * 2; // Random value between -1 and 1

            // Max angular offset is a fraction of the angle slice, controlled by irregularity
            const angleOffset = ( (2 * Math.PI / this.numVertices) * this.irregularity * angleOffsetFactor ) / 2; 
            const currentAngle = baseAngle + angleOffset;

            const x = currentRadius * Math.cos(currentAngle);
            const y = currentRadius * Math.sin(currentAngle);
            
            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, 1);

            const s = (x / (2 * this.averageRadius)) + 0.5;
            const t = (y / (2 * this.averageRadius)) + 0.5; 
            this.texCoords.push(s, t);
        }

        for (let i = 0; i < this.numVertices; i++) {
            this.indices.push(0); // Center vertex
            this.indices.push(i + 1); // Current outer vertex
            this.indices.push(((i + 1) % this.numVertices) + 1); // Next outer vertex
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
