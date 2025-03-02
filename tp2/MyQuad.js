import { CGFobject } from '../lib/CGF.js';

/**
 * MyQuad
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyQuad extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -0.5, -0.5, 0,  
             0.5, -0.5, 0,  
            -0.5,  0.5, 0,  
             0.5,  0.5, 0   
        ];

        this.indices = [
            0, 1, 2,  
            1, 3, 2   
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}
