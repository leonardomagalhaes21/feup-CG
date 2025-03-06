import { CGFobject } from '../lib/CGF.js';

/**
 * MyPrism
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - Number of sides around the Z axis
 * @param stacks - Number of divisions along the Z axis
 */
export class MyPrism extends CGFobject {
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

        const deltaTheta = (2 * Math.PI) / this.slices; // Ângulo entre os lados
        const deltaZ = 1.0 / this.stacks; // Altura de cada stack

        for (let stack = 0; stack < this.stacks; stack++) {
            const zBottom = stack * deltaZ;
            const zTop = (stack + 1) * deltaZ;

            for (let slice = 0; slice < this.slices; slice++) {
                const theta = slice * deltaTheta;
                const nextTheta = (slice + 1) * deltaTheta;

                // Coordenadas dos vértices da face
                const x1 = Math.cos(theta);
                const y1 = Math.sin(theta);
                const x2 = Math.cos(nextTheta);
                const y2 = Math.sin(nextTheta);

                // Vértices da face inferior
                this.vertices.push(x1, y1, zBottom);
                this.vertices.push(x2, y2, zBottom);

                // Vértices da face superior
                this.vertices.push(x1, y1, zTop);
                this.vertices.push(x2, y2, zTop);

                // Normais: perpendiculares às faces laterais
                const normalX = Math.cos(theta + deltaTheta / 2);
                const normalY = Math.sin(theta + deltaTheta / 2);

                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);
                this.normals.push(normalX, normalY, 0);

                // Índices para os triângulos da face lateral
                const base = stack * this.slices * 4 + slice * 4;
                this.indices.push(base, base + 1, base + 2);
                this.indices.push(base + 1, base + 3, base + 2);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
