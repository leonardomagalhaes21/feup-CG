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
    this.sampleTree1 = new MyTree(this, 5, 'X', 0.5, 5, [0.2, 0.7, 0.2], this.trunkTexture, this.crownTexture); 
    this.sampleTree2 = new MyTree(this, -8, 'Z', 0.4, 4, [0.1, 0.6, 0.1], this.trunkTexture, this.crownTexture);
    this.sampleTree3 = new MyTree(this, 0, 'X', 0.6, 6, [0.15, 0.55, 0.15], this.trunkTexture, this.crownTexture);
    
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
    this.helicopter.y = 20;    
    this.helicopter.z = -150; 
    
    
    this.speedFactor = 1.0;
  }
  initLights() {
    // Luz direcional geral (ilumina de todos os lados)
    this.lights[0].setPosition(0, 100, 0, 1);
    this.lights[0].setDiffuse(0.9, 0.9, 0.9, 1.0);
    this.lights[0].setAmbient(0.5, 0.5, 0.5, 1.0); 
    this.lights[0].setSpecular(0.1, 0.1, 0.1, 1.0);
    this.lights[0].enable();
    
    // Luz adicional da direção oposta (ilumina o "lado de fora")
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
    }
    
    if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(-0.05 * this.speedFactor);
    }
    
    if (this.gui.isKeyPressed("KeyR")) {
        this.helicopter.reset();
    }
    
    if (this.gui.isKeyPressed("KeyP")) {
        this.helicopter.takeOff();
    }
    
    if (this.gui.isKeyPressed("KeyL")) {
        this.helicopter.land();
    }
  }

  update(t) {
    // Calcular delta time de forma mais robusta
    if (!this.lastT) {
        this.lastT = t;
        return; // Pula o primeiro frame para evitar delta time muito grande
    }
    
    // Limitar delta time para evitar saltos grandes em caso de lag
    const maxDelta = 100; // ms
    const deltaT = Math.min(t - this.lastT, maxDelta);
    this.lastT = t;
    
    this.checkKeys();
    this.time = t;
    
    this.helicopter.update(t, deltaT);
    
    
    

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

    // Draw axis
    //this.axis.display();
    this.helicopter.display();
    this.setDefaultAppearance();
    this.panorama.display();

    
  
    
    this.pushMatrix();
    this.translate(-150, 0, -150);
    
    
    this.fireStation.display();
    this.popMatrix();
    
    // Display sample trees
    this.pushMatrix();
    this.translate(-120, 0, -140);
    this.sampleTree1.display();
    this.popMatrix();
    
    this.pushMatrix();
    this.translate(-130, 0, -145);
    this.sampleTree2.display();
    this.popMatrix();
    
    this.pushMatrix();
    this.translate(-125, 0, -155);
    this.sampleTree3.display();
    this.popMatrix();
    
    // Display forest
    this.pushMatrix();
    this.translate(-200, 0, -180);
    this.forest.display();
    this.popMatrix();
  }
}
