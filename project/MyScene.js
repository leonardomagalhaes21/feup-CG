import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance} from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js";
import { MyTree } from "./MyTree.js";
import { MyForest } from "./MyForest.js";
import { MyHeli } from "./MyHeli.js";
import {MyLake} from "./MyLake.js";
import {MyFire} from "./MyFire.js";

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
    this.helicopter.y = -12;    
    this.helicopter.z = -250; 
    this.helicopter.state = 'flying';
    this.helicopter.bucketDeployed = true;
    this.helicopter.bladeSpeed = this.helicopter.maxBladeSpeed*0.1;
    
    this.speedFactor = 1.0;

    this.waterTexture = new CGFtexture(this, 'textures/water.jpg');
    this.fireTexture = new CGFtexture(this, 'textures/fire.jpg');
    this.burntGroundTexture = new CGFtexture(this, 'textures/burnt_ground.jpg');
    
    // Criar lago na cena
    this.lake = new MyLake(this, 40, 35, 'textures/water.jpg');
    this.lake.x = -280;
    this.lake.y = -29.5; 
    this.lake.z = -230;
    
    // Criar fogo na floresta
    this.fire = new MyFire(this, 15, 8, 20);
    this.fire.x = -220;
    this.fire.y = -29;
    this.fire.z = -160;
    
    // Adicionar referências ao helicóptero
    this.helicopter.lake = this.lake;
    this.helicopter.fire = this.fire;
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
    // Câmera estática única
    this.camera = new CGFcamera(
      0.8,
      0.1,
      1000,
      vec3.fromValues(-150, -25, -200), // position
      vec3.fromValues(-150, -25, -250)  // target
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
        keysPressed = true;
    }
    
    if (this.gui.isKeyPressed("KeyD")) {
        this.helicopter.turn(-0.05 * this.speedFactor);
        keysPressed = true;
    }
    
    if (this.gui.isKeyPressed("KeyR")) {
        this.helicopter.reset();
    }

    if (this.gui.isKeyPressed("KeyL")) {
      this.helicopter.land();
    }
    
    if (this.gui.isKeyPressed("KeyP")) {
        this.helicopter.takeOff();
    }
    
    if (this.gui.isKeyPressed("KeyO")) {
        if (!this.oKeyPressed) {
            this.helicopter.dropWater();
            this.oKeyPressed = true;
        }
      }
    //landing
    if (this.gui.isKeyPressed("KeyL")) {
        this.helicopter.land();
        keysPressed = true;
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
    this.lake.update(t);
    this.fire.update(t);
    
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

    // Renderizar o lago
    this.pushMatrix();
    this.lake.display();
    this.popMatrix();
    
    // Renderizar o fogo na floresta
    this.pushMatrix();
    this.translate(this.fire.x, this.fire.y, this.fire.z);
    this.fire.display();
    this.popMatrix();
    
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