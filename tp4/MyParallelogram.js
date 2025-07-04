import { CGFobject } from '../lib/CGF.js';
/**
 * MyDiamond
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyParallelogram extends CGFobject {
	constructor(scene) {
		super(scene);
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			0, 0, 0, 	//0
			2, 0, 0,	//1
			3, 1, 0,	//2
			1, 1, 0,	//3
			0, 0, 0, 	//4
			2, 0, 0,	//5
			3, 1, 0,	//6
			1, 1, 0		//7
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			2, 3, 0,
			6, 5, 4,
			7, 6, 4
		];

		this.normals = [
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
		]

		this.texCoords = [
			1, 1,
			0.5, 1,
			0.25, 0.75,
			0.75, 0.75,
			1, 1,
			0.5, 1,
			0.25, 0.75,
			0.75, 0.75,
		]

		this.primitiveType = this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	}
}