import { CGFobject } from '../lib/CGF.js';

export class MyFlameTriangle extends CGFobject {
    constructor(scene) {
        super(scene);
        this.originalVertices = [
            -0.5, 0, 0, // V0 (bottom-left)
             0.5, 0, 0, // V1 (bottom-right)
             0, 1, 0    // V2 (top-middle)
        ];
        
        this.vertices = [...this.originalVertices];
        
        this.indices = [
            0, 1, 2
        ];

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        this.texCoords = [
            0, 0,   // V0
            1, 0,   // V1
            0.5, 1  // V2
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers(); 
    }

    updateVertices(newVertices) {
        this.vertices = newVertices;
        
        if (this.vertexBuffer) {
            this.scene.gl.bindBuffer(this.scene.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.scene.gl.bufferData(this.scene.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.scene.gl.DYNAMIC_DRAW);
        }
    }
}
