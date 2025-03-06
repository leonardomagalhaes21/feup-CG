import { CGFobject } from '../lib/CGF.js';

/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of sides around the Z axis
 * @param stacks - Number of divisions along the Z axis
 */
export class MyCilinder extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];

        const deltaTheta = (2 * Math.PI) / this.slices;
        const deltaZ = 1.0 / this.stacks;

        // Cria vértices e normais
        for (let stack = 0; stack <= this.stacks; stack++) {
            const z = stack * deltaZ;
            for (let slice = 0; slice < this.slices; slice++) {
                const theta = slice * deltaTheta;
                const x = Math.cos(theta);
                const y = Math.sin(theta);
                this.vertices.push(x, y, z);
                this.normals.push(x, y, 0);
            }
        }

        // Cria os índices para cada face da superfície lateral
        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const A = stack * this.slices + slice;
                const nextSlice = (slice + 1) % this.slices;
                const D = stack * this.slices + nextSlice;
                const B = (stack + 1) * this.slices + slice;
                const C = (stack + 1) * this.slices + nextSlice;
                

                this.indices.push(A, C, B);
                this.indices.push(A, D, C);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
