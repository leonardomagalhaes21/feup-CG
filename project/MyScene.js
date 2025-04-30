import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance} from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyTree } from "./MyTree.js";
import { MyForest } from "./MyForest.js";
import { MyHeli } from "./MyHeli.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    this.time = 0;
  }
  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.setUpdatePeriod(50);

    // Grass texture and material
    this.grassTexture = new CGFtexture(this, 'textures/grass.jpg');
    this.grassMaterial = new CGFappearance(this);
    this.grassMaterial.setAmbient(0.3, 0.6, 0.3, 1.0);
    this.grassMaterial.setDiffuse(0.5, 0.8, 0.5, 1.0);
    this.grassMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
    this.grassMaterial.setShininess(10.0);
    this.grassMaterial.setTexture(this.grassTexture);
    this.grassMaterial.setTextureWrap('REPEAT', 'REPEAT');


    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.plane = new MyPlane(this, 64);

    this.earthSphere = new MySphere(this, 32, 16); 

    this.earthTexture = new CGFtexture(this, 'textures/earth.jpg');
    
    // Configurar o material para a Terra
    this.earthMaterial = new CGFappearance(this);
    this.earthMaterial.setAmbient(0.2, 0.2, 0.2, 1);
    this.earthMaterial.setDiffuse(0.8, 0.8, 0.8, 1);
    this.earthMaterial.setSpecular(0.2, 0.2, 0.2, 1);
    this.earthMaterial.setShininess(30.0);
    this.earthMaterial.setTexture(this.earthTexture);
    this.earthMaterial.setTextureWrap('REPEAT', 'CLAMP_TO_EDGE');
    
    // Carregar a textura do panorama e criar o objeto MyPanorama
    this.panoramaTexture = new CGFtexture(this, 'textures/panorama.jpg');
    this.panorama = new MyPanorama(this, this.panoramaTexture);
    this.heliportTexture = new CGFtexture(this, 'textures/heliport.jpeg');
    this.bombeirosTexture = new CGFtexture(this, 'textures/bombeiros.jpeg');

    this.windowTexture = new CGFtexture(this, 'textures/window.jpg');
    this.fireStation = new MyBuilding(
      this,
      40,
      3,
      3,
      this.windowTexture,
      this.heliportTexture,
      this.bombeirosTexture,
      [1.0, 1.0, 1.0]
    );
    
    // Load tree textures
    this.trunkTexture = new CGFtexture(this, 'textures/trunk.jpg');
    this.crownTexture = new CGFtexture(this, 'textures/leaves.jpg');
    
    // Create example trees with different parameters and textures
    
    // Create a forest with rows and columns
    this.forest = new MyForest(this, 5, 4, 80, 60, this.trunkTexture, this.crownTexture);
  

    this.heliCabinTexture = new CGFtexture(this, 'textures/heli_body.jpg');
    this.heliTailTexture = new CGFtexture(this, 'textures/heli_tail.jpg');
    this.heliBladeTexture = new CGFtexture(this, 'textures/heli_blade.jpg');
    this.heliBucketTexture = new CGFtexture(this, 'textures/heli_bucket.jpg');
    
    this.helicopter = new MyHeli(
        this, 
        this.heliCabinTexture, 
        this.heliTailTexture, 
        this.heliBladeTexture, 
        this.heliBucketTexture
    );
    
    
    this.helicopter.x = -150; 
    this.helicopter.y = -13;    
    this.helicopter.z = -250; 
    this.helicopter.state = 'flying';
    this.helicopter.bucketDeployed = true;
    this.helicopter.bladeSpeed = this.helicopter.maxBladeSpeed*0.1;
    
    this.speedFactor = 1.0;
  }
  initLights() {
    // Luz direcional geral 
    this.lights[0].setPosition(0, 100, 0, 1);
    this.lights[0].setDiffuse(0.9, 0.9, 0.9, 1.0);
    this.lights[0].setAmbient(0.5, 0.5, 0.5, 1.0); 
    this.lights[0].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[0].enable();
    
    // Luz adicional da direção oposta 
    this.lights[1].setPosition(-200, 200, -200, 1);
    this.lights[1].setDiffuse(0.8, 0.8, 0.8, 1.0);
    this.lights[1].setAmbient(0.3, 0.3, 0.3, 1.0);
    this.lights[1].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[1].enable();
    
    this.lights[0].update();
    this.lights[1].update();
}
  initCameras() {
    this.camera = new CGFcamera(
      0.8,
      0.1,
      1000,
      vec3.fromValues(-100, 20, -100), 
      vec3.fromValues(-150, 10, -150)  
    );
    this.cameraMode = 'follow'; // 'follow' or 'static'
    this.cameraDistance = 20;   // Distance behind helicopter
    this.cameraHeight = 8;      // Height above helicopter
    this.cameraSmoothness = 0.1;
  }
  checkKeys() {
    var text = "Keys pressed: ";
    var keysPressed = false;

    if (this.gui.isKeyPressed("KeyW")) {
      this.helicopter.accelerate(0.01 * this.speedFactor);
    }
    
    if (this.gui.isKeyPressed("KeyS")) {
        this.helicopter.accelerate(-0.01 * this.speedFactor);
    }
    
    if (this.gui.isKeyPressed("KeyA")) {
        this.helicopter.turn(0.05 * this.speedFactor);
        keysPressed = true;
    }
    
    if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(-0.05 * this.speedFactor);
        keysPressed = true;
    }
    
    // desaparece
    if (this.gui.isKeyPressed("KeyR")) {
        this.helicopter.reset();
    }

    //take off
    if (this.gui.isKeyPressed("KeyP")) {
        this.helicopter.takeOff();
    }
    
    //landing
    if (this.gui.isKeyPressed("KeyL")) {
        this.helicopter.land();
        keysPressed = true;
    }

    // Camera lock
    if (this.gui.isKeyPressed("KeyC")) {
      if (!this.cKeyPressed) {
          this.toggleCameraMode();
          this.cKeyPressed = true;
      }
    } else {
        this.cKeyPressed = false;
    }

    // Reset lights if no keys are pressed
    if (!keysPressed) {
        this.helicopter.redLightActive = false;
        this.helicopter.greenLightActive = false;
    }
  }

  update(t) {
    // Calcular delta time de forma mais robusta
    if (!this.lastT) {
        this.lastT = t;
        return; 
    }
    
    const maxDelta = 100;
    const deltaT = Math.min(t - this.lastT, maxDelta);
    this.lastT = t;
    
    this.checkKeys();
    this.time = t;
    
    this.helicopter.update(t, deltaT);
    
    // Update camera to follow helicopter if in follow mode
    if (this.cameraMode === 'follow') {
      this.updateCameraPosition();
    }
  }
  updateCameraPosition() {
    // Calculate position behind helicopter based on orientation
    const dx = -Math.sin(this.helicopter.orientation) * this.cameraDistance;
    const dz = -Math.cos(this.helicopter.orientation) * this.cameraDistance;
    
    // Calculate target camera position
    const targetX = this.helicopter.x + dx;
    const targetY = this.helicopter.y + this.cameraHeight;
    const targetZ = this.helicopter.z + dz;
    
    // Get current camera position
    const currentPos = this.camera.position;
    
    // Smoothly interpolate between current and target positions
    const newX = currentPos[0] * (1 - this.cameraSmoothness) + targetX * this.cameraSmoothness;
    const newY = currentPos[1] * (1 - this.cameraSmoothness) + targetY * this.cameraSmoothness;
    const newZ = currentPos[2] * (1 - this.cameraSmoothness) + targetZ * this.cameraSmoothness;
    
    // Update camera position
    this.camera.position = vec3.fromValues(newX, newY, newZ);
    
    // Set target to helicopter position
    this.camera.target = vec3.fromValues(this.helicopter.x, this.helicopter.y, this.helicopter.z);
  }
  toggleCameraMode() {
    if (this.cameraMode === 'follow') {
      this.cameraMode = 'static';
      // Reset to original static camera position
      this.camera.position = vec3.fromValues(-150, -25, -200);
      this.camera.target = vec3.fromValues(-150, -25, -250);
    } else {
      this.cameraMode = 'follow';
      this.updateCameraPosition();
    }
  }

  

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }
  display() {

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();

    this.lights[0].update();
    this.lights[1].update();
    this.lights[2].update();
    this.lights[3].update();
    this.lights[4].update();
    this.lights[5].update();
    this.lights[6].update();
    this.lights[7].update();

    // Draw axis
    // this.axis.display();
    this.helicopter.display();
    this.setDefaultAppearance();
    this.panorama.display();

    // Draw the ground
    this.pushMatrix();
    this.translate(-150, -30, -150); // Move the ground to the front of the building
    this.rotate(-Math.PI / 2, 1, 0, 0); // Rotate to align with the XZ plane
    this.scale(400, 400, 1); // Scale to 400x400
    this.grassMaterial.apply(); // Apply grass material
    this.plane.display();
    this.popMatrix();

    // Position the building at an edge of the ground
    this.pushMatrix();
    this.translate(-150, -30, -250);
    
    
    this.fireStation.display();
    this.popMatrix();

    // Display forest
    this.pushMatrix();
    this.translate(-200, -30, -180);
    this.forest.display();
    this.popMatrix();
}

}
