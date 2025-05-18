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

    this.cameraMode = 'static';
    this.cameraDistance = 30;
    this.cameraHeight = 15;
    this.cameraSmoothness = 0.1; 
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
    this.helicopter.state = 'landed';
    this.helicopter.bucketDeployed = true;
    this.helicopter.bladeSpeed = 0;
    
    this.speedFactor = 1.0;

    this.waterTexture = new CGFtexture(this, 'textures/water.jpg');
    this.fireTexture = new CGFtexture(this, 'textures/fire.jpg');
    this.burntGroundTexture = new CGFtexture(this, 'textures/burnt_ground.jpg');
    
    // Criar lago na cena
    this.lake = new MyLake(this, 70, 60, 'textures/water.jpg');
    this.lake.x = -280;
    this.lake.y = -29.75; 
    this.lake.z = -230;
    
    // Criar fogo na floresta
    this.fire = new MyFire(this, 15, 8, 20);
    this.fire.x = -220;
    this.fire.y = -29;
    this.fire.z = -160;
    
    // Adicionar referências ao helicóptero
    this.helicopter.lake = this.lake;
    this.helicopter.fire = this.fire;
    this.helicopter.fireStation = this.fireStation;
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
      vec3.fromValues(-150, -25, -200),
      vec3.fromValues(-150, -25, -250)
    );
    
    this.staticCameraPosition = vec3.clone(this.camera.position);
    this.staticCameraTarget = vec3.clone(this.camera.target);
  }


  /**
   * Alterna entre modo de câmera estática e câmera que segue o helicóptero
   */
  toggleCameraMode() {
    if (this.cameraMode === 'static') {
      // Mudar para câmera que segue o helicóptero
      this.cameraMode = 'follow';
    } else {
      // Voltar para câmera estática
      this.cameraMode = 'static';
      
      // Restaurar posição e alvo originais da câmera
      vec3.copy(this.camera.position, this.staticCameraPosition);
      vec3.copy(this.camera.target, this.staticCameraTarget);
      
    }
  }

  /**
   * Atualiza a posição da câmera para seguir o helicóptero
   */
  updateCameraPosition() {
    if (this.cameraMode !== 'follow') return;

    // Calcular nova posição da câmera atrás do helicóptero
    const dx = -Math.sin(this.helicopter.orientation) * this.cameraDistance;
    const dz = -Math.cos(this.helicopter.orientation) * this.cameraDistance;
    
    // Posição desejada da câmera
    const targetPosition = [
      this.helicopter.x + dx,
      this.helicopter.y + this.cameraHeight,
      this.helicopter.z + dz
    ];
    
    // Alvo da câmera (posição do helicóptero com ligeira compensação para a altura)
    const targetLookAt = [
      this.helicopter.x,
      this.helicopter.y + this.cameraHeight * 0.3,
      this.helicopter.z
    ];
    
    // Suavizar a transição
    this.camera.position[0] = this.camera.position[0] * (1 - this.cameraSmoothness) + targetPosition[0] * this.cameraSmoothness;
    this.camera.position[1] = this.camera.position[1] * (1 - this.cameraSmoothness) + targetPosition[1] * this.cameraSmoothness;
    this.camera.position[2] = this.camera.position[2] * (1 - this.cameraSmoothness) + targetPosition[2] * this.cameraSmoothness;
    
    this.camera.target[0] = this.camera.target[0] * (1 - this.cameraSmoothness) + targetLookAt[0] * this.cameraSmoothness;
    this.camera.target[1] = this.camera.target[1] * (1 - this.cameraSmoothness) + targetLookAt[1] * this.cameraSmoothness;
    this.camera.target[2] = this.camera.target[2] * (1 - this.cameraSmoothness) + targetLookAt[2] * this.cameraSmoothness;
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
      keysPressed = true;
    }
    
    if (this.gui.isKeyPressed("KeyP")) {
        this.helicopter.takeOff();
    }
    
    if (this.gui.isKeyPressed("KeyO")) {
        this.helicopter.dropWater();
    }
    
    if (this.gui.isKeyPressed("KeyC")) {
      if (!this.cKeyPressed) {
        this.toggleCameraMode();
        this.cKeyPressed = true;
        keysPressed = true;
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
    
    // Atualizar posição da câmera se estiver no modo 'follow'
    if (this.cameraMode === 'follow') {
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
