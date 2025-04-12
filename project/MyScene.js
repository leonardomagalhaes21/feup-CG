import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance} from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MySphere } from "./MySphere.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js";



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
      

  }
  initLights() {
    // Luz direcional geral (ilumina de todos os lados)
    this.lights[0].setPosition(0, 100, 0, 1);
    this.lights[0].setDiffuse(0.9, 0.9, 0.9, 1.0);
    this.lights[0].setAmbient(0.5, 0.5, 0.5, 1.0); // Aumentar luz ambiente
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

    // Check for key codes e.g. in https://keycode.info/
    if (this.gui.isKeyPressed("KeyW")) {
      text += " W ";
      keysPressed = true;
    }

    if (this.gui.isKeyPressed("KeyS")) {
      text += " S ";
      keysPressed = true;
    }
    if (keysPressed)
      console.log(text);
  }

  update(t) {
    this.checkKeys();
    this.time = t;
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }
  display() {

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis
    //this.axis.display();

    this.setDefaultAppearance();
    this.panorama.display();

    
  
    
    this.pushMatrix();
    this.translate(-150, 0, -150);
    
    
    this.fireStation.display();
    this.popMatrix();
    
  }
}
