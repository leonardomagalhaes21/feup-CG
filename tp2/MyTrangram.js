import {CGFobject} from '../lib/CGF.js';
import { MyDiamond } from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig } from "./MyTriangleBig.js";

/**
 * MyTrangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTrangram extends CGFobject {
    constructor(scene) {
        super(scene);
        this.diamond = new MyDiamond(scene);
        this.triangle = new MyTriangle(scene);
        this.triangleBig = new MyTriangleBig(scene);
        this.triangleSmall = new MyTriangleSmall(scene);
        this.parallelogram = new MyParallelogram(scene);
    }
    
    display() {
        // green diamond
        this.scene.pushMatrix();

        let translation_matrix =
            [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             2, 2, 0, 1];
    
        this.scene.multMatrix(translation_matrix);
        this.scene.translate(-1.5, 1.6, 0);
        this.scene.setDiffuse(0, 1, 0, 0)
        this.diamond.display();
        this.scene.popMatrix();


        // pink triangle
        this.scene.pushMatrix();
        this.scene.translate(-0.95, 0, 0);
        this.scene.setDiffuse(1, 155 / 255, 207 / 255, 1)
        this.triangleSmall.display();
        this.scene.popMatrix();


        // orange triangle
        this.scene.pushMatrix();
        this.scene.translate(0, 1.5, 0);
        this.scene.rotate(-Math.PI/4, 0, 0, 1);
        this.scene.setDiffuse(1, 155 / 255, 0, 1)
        this.triangle.display();
        this.scene.popMatrix();

        // yellow parallelogram
        this.scene.pushMatrix();
        this.scene.scale(0.8, -0.8, 1);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.translate(-1, -1, 0);
        this.scene.setDiffuse(1, 1, 0, 1)
        this.parallelogram.display();
        this.scene.popMatrix();

        // blue triangle
        this.scene.pushMatrix();
        this.scene.scale(0.7, -0.7, 1);
        this.scene.translate(1.4, -3, 0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.setDiffuse(0, 155/255, 1, 1)
        this.triangleBig.display();
        this.scene.popMatrix();

        // red triangle
        this.scene.pushMatrix();
        this.scene.scale(0.8, 0.8, 1);
        this.scene.translate(-2.5, 0, 0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.setDiffuse(1, 27/255, 27/255, 1)
        this.triangleSmall.display();
        this.scene.popMatrix();

        // purple triangle
        this.scene.pushMatrix();
        this.scene.rotate(3*Math.PI/4, 0, 0, 1);
        this.scene.translate(-1.8, 0, 0);
        this.scene.setDiffuse(0.5, 0, 0.5, 1)
        this.triangleSmall.display();
        this.scene.popMatrix();
    }
}

