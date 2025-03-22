import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangleBig
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTriangleBig extends CGFobject {
    constructor(scene, coords){
        super(scene);
        this.texCoords=coords;
        this.initBuffers();
    }
    
    initBuffers() {
        this.vertices = [
            -2, 0, 0,	//0
            2, 0, 0,	//1
            0, 2, 0,    //2
            -2, 0, 0,	//3
            2, 0, 0,	//4
            0, 2, 0,    //5
        ];

        this.indices = [
            0, 1, 2,
            5, 4, 3
        ];

        this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
            0, 0, -1,
			0, 0, -1,
			0, 0, -1
		]
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}

