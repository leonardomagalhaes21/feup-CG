import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";

/**
 * MyWindow - Implementation of a textured window
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {CGFtexture} texture - Window texture
 */
export class MyWindow extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.scene = scene;
        this.texture = texture;
        
        // Create a plane for the window (with high division for better texture mapping)
        this.window = new MyPlane(this.scene, 10);
        
        // Create appearance for the window
        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.6, 0.6, 0.6, 1.0);
        this.material.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.material.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.material.setShininess(10.0);
        this.material.setTexture(this.texture);
        this.material.setTextureWrap('REPEAT', 'REPEAT');
    }
    
    /**
     * Display method for the window
     * @param {Number} width - Width of the window
     * @param {Number} height - Height of the window
     */
    display(width = 1, height = 1) {
        this.scene.pushMatrix();
        
        // Center and scale the window
        this.scene.translate(0, 0, 0.01); // Small offset to avoid z-fighting
        this.scene.scale(width, height, 1);
        
        // Apply material and display window
        this.material.apply();
        this.window.display();
        
        this.scene.popMatrix();
    }
}