import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MySphere } from "./MySphere.js";

/**
 * MyPanorama - Creates a panoramic environment using an inverted sphere with a texture
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {CGFtexture} texture - Texture to be applied to the panorama
 */
export class MyPanorama extends CGFobject {
  constructor(scene, texture) {
    super(scene);
    this.scene = scene;
    this.texture = texture;
    
    // Create an inverted sphere with a high number of divisions for smooth appearance
    // Parameters: scene, slices, stacks, radius=1, inside=true
    this.sphere = new MySphere(this.scene, 50, 200, 1, true);
    
    // Create material with only emissive component for full brightness
    this.material = new CGFappearance(this.scene);
    this.material.setAmbient(0, 0, 0, 1);
    this.material.setDiffuse(0, 0, 0, 1);
    this.material.setSpecular(0, 0, 0, 1);
    this.material.setEmission(1, 1, 1, 1); 
    this.material.setTexture(this.texture);
    this.material.setTextureWrap('REPEAT', 'CLAMP_TO_EDGE');
  }
  
  /**
   * Display the panorama centered at the camera position
   * This creates the illusion that the spherical surface is infinitely far away
   */
  display() {
    this.scene.pushMatrix();
    
    // Center the panorama at the camera's position
    if (this.scene.camera && this.scene.camera.position) {
      this.scene.translate(
        this.scene.camera.position[0],
        this.scene.camera.position[1],
        this.scene.camera.position[2]
      );
    }
    
    // Scale the sphere to the required radius (200 units)
    this.scene.scale(200, 200, 200);
    
    // Apply the material with emissive component and panoramic texture
    this.material.apply();
    
    // Display the inverted sphere
    this.sphere.display();
    
    this.scene.popMatrix();
  }
}