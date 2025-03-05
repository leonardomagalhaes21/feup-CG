import { CGFobject, CGFappearance } from '../lib/CGF.js';
import { MyDiamond } from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
import { MyTriangleBig } from "./MyTriangleBig.js";

/**
 * MyTangram
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

        this.initMaterials(scene);
    }

    initMaterials(scene) {
        // Green Diamond
        this.greenMaterial = new CGFappearance(scene);
        this.greenMaterial.setAmbient(0, 1, 0, 1.0);
        this.greenMaterial.setDiffuse(0, 1, 0, 1.0);
        this.greenMaterial.setSpecular(1, 1, 1, 1.0);
        this.greenMaterial.setShininess(100.0);

        // Pink Triangle
        this.pinkMaterial = new CGFappearance(scene);
        this.pinkMaterial.setAmbient(1, 155 / 255, 207 / 255, 1.0);
        this.pinkMaterial.setDiffuse(1, 155 / 255, 207 / 255, 1.0);
        this.pinkMaterial.setSpecular(1, 1, 1, 1.0);
        this.pinkMaterial.setShininess(100.0);

        // Orange Triangle
        this.orangeMaterial = new CGFappearance(scene);
        this.orangeMaterial.setAmbient(1, 155 / 255, 0, 1.0);
        this.orangeMaterial.setDiffuse(1, 155 / 255, 0, 1.0);
        this.orangeMaterial.setSpecular(1, 1, 1, 1.0);
        this.orangeMaterial.setShininess(100.0);

        // Yellow Parallelogram
        this.yellowMaterial = new CGFappearance(scene);
        this.yellowMaterial.setAmbient(1, 1, 0, 1.0);
        this.yellowMaterial.setDiffuse(1, 1, 0, 1.0);
        this.yellowMaterial.setSpecular(1, 1, 1, 1.0);
        this.yellowMaterial.setShininess(100.0);

        // Blue Triangle
        this.blueMaterial = new CGFappearance(scene);
        this.blueMaterial.setAmbient(0, 155 / 255, 1, 1.0);
        this.blueMaterial.setDiffuse(0, 155 / 255, 1, 1.0);
        this.blueMaterial.setSpecular(1, 1, 1, 1.0);
        this.blueMaterial.setShininess(100.0);

        // Red Triangle
        this.redMaterial = new CGFappearance(scene);
        this.redMaterial.setAmbient(1, 27 / 255, 27 / 255, 1.0);
        this.redMaterial.setDiffuse(1, 27 / 255, 27 / 255, 1.0);
        this.redMaterial.setSpecular(1, 1, 1, 1.0);
        this.redMaterial.setShininess(100.0);

        // Purple Triangle
        this.purpleMaterial = new CGFappearance(scene);
        this.purpleMaterial.setAmbient(0.5, 0, 0.5, 1.0);
        this.purpleMaterial.setDiffuse(0.5, 0, 0.5, 1.0);
        this.purpleMaterial.setSpecular(1, 1, 1, 1.0);
        this.purpleMaterial.setShininess(100.0);

        // Custom Material
        this.customMaterial = scene.customMaterial;
    }

    display() {
        // green diamond with custom material
        this.scene.pushMatrix();
        let translation_matrix =
            [1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             2, 2, 0, 1];
        this.scene.multMatrix(translation_matrix);
        this.scene.translate(-1.5, 1.6, 0);
        this.customMaterial.apply();
        this.diamond.display();
        this.scene.popMatrix();

        // pink triangle
        this.scene.pushMatrix();
        this.scene.translate(-0.95, 0, 0);
        this.pinkMaterial.apply();
        this.triangleSmall.display();
        this.scene.popMatrix();

        // orange triangle
        this.scene.pushMatrix();
        this.scene.translate(0, 1.5, 0);
        this.scene.rotate(-Math.PI/4, 0, 0, 1);
        this.orangeMaterial.apply();
        this.triangle.display();
        this.scene.popMatrix();

        // yellow parallelogram
        this.scene.pushMatrix();
        this.scene.scale(0.8, -0.8, 1);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.translate(-1, -1, 0);
        this.yellowMaterial.apply();
        this.parallelogram.display();
        this.scene.popMatrix();

        // blue triangle
        this.scene.pushMatrix();
        this.scene.scale(0.7, -0.7, 1);
        this.scene.translate(1.4, -3, 0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.blueMaterial.apply();
        this.triangleBig.display();
        this.scene.popMatrix();

        // red triangle
        this.scene.pushMatrix();
        this.scene.scale(0.8, 0.8, 1);
        this.scene.translate(-2.5, 0, 0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.redMaterial.apply();
        this.triangleSmall.display();
        this.scene.popMatrix();

        // purple triangle
        this.scene.pushMatrix();
        this.scene.rotate(3*Math.PI/4, 0, 0, 1);
        this.scene.translate(-1.8, 0, 0);
        this.purpleMaterial.apply();
        this.triangleSmall.display();
        this.scene.popMatrix();
    }
}