import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyIrregularPolygon } from './MyIrregularPolygon.js';
import { MyFlameTriangle } from './MyFlameTriangle.js';

export class MyFire extends CGFobject {

    initShaders() {
        this.flameShader = new CGFshader(this.scene.gl, "shaders/flame.vert", "shaders/flame.frag");
        this.flameShader.setUniformsValues({ 
            timeFactor: 0,
            flamePhase: 0,
            swayMagnitude: 0.5,
            frequency: 1.0,
            colorVariation: 1.0,
            horizontalFactor: 0.7,
            verticalFactor: 0.7
        });
    }

    constructor(scene, width = 10, height = 5, numFlames = 12) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.numFlames = numFlames;
        
        
        this.x = 0;
        this.y = 0;
        this.z = 0;
        
        this.active = true;
        
        this.baseRadius = width / 2;
        
        this.extinguishedTime = null; 
        this.showSmoke = false;

        this.smokeTime = 4000;

        this.basePlane = new MyIrregularPolygon(this.scene, 12, 0.5, 0.35); 
        this.flameShape = new MyFlameTriangle(this.scene);
        this.smokeObj = new MySphere(this.scene, 8, 8);
        
        this.lastTime = 0;
        
        this.flames = [];
        
        this.initFlames();
        
        this.initMaterials();
        this.initShaders();

    }
    
   /**
 * Inicializa as chamas com posições e parâmetros aleatórios
 */
initFlames() {
    for (let i = 0; i < this.numFlames; i++) {
        const radius = Math.random() * this.baseRadius * 0.9;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // MODIFICADO: Todas as chamas agora começam no nível do chão
        // Pequena variação na altura para evitar z-fighting
        const y = 0.05 + Math.random() * 0.15; 
        
        // Maior variação na altura e largura iniciais
        const height = this.height * (0.3 + Math.random() * 0.8);
        const width = this.width * 0.1 * (0.3 + Math.random() * 0.8);
        
        const rotationY = Math.random() * Math.PI * 2;
        const rotationSpeed = 0.1 + Math.random() * 0.4;
        
        const phase = Math.random() * Math.PI * 6; 
        
        const frequency = 0.4 + Math.random() * 0.6;
        
        const swayMagnitude = 0.2 + Math.random() * 0.6; 
        
        const colorVariation = 0.7 + Math.random() * 0.6;
        
        let horizontalFactor, verticalFactor;
        
        const movementType = Math.random();
        
        if (movementType < 0.4) {
            horizontalFactor = 0.7 + Math.random() * 0.6;
            verticalFactor = 0.1 + Math.random() * 0.4;
        } 
        else if (movementType < 0.8) {
            horizontalFactor = 0.1 + Math.random() * 0.4;
            verticalFactor = 0.7 + Math.random() * 0.6;
        }
        else {
            horizontalFactor = 0.3 + Math.random() * 0.6; 
            verticalFactor = 0.3 + Math.random() * 0.6;    
        }
        
        this.flames.push({
            x: x,
            y: y,
            z: z,
            height: height,
            width: width,
            rotationY: rotationY,
            rotationSpeed: rotationSpeed,
            phase: phase,
            frequency: frequency,
            swayMagnitude: swayMagnitude,
            colorVariation: colorVariation,
            horizontalFactor: horizontalFactor,
            verticalFactor: verticalFactor,
            // Propriedades para pulsação aleatória
            pulseFrequency: 0.5 + Math.random() * 1.0,
            pulseAmplitude: 0.1 + Math.random() * 0.2
        });
    }
}
    /**
     * Inicializa materiais e texturas para o fogo
     */
    initMaterials() {
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setAmbient(0.8, 0.3, 0.1, 1.0);
        this.flameMaterial.setDiffuse(0.9, 0.4, 0.1, 1.0);
        this.flameMaterial.setSpecular(1.0, 0.6, 0.2, 1.0);
        this.flameMaterial.setEmission(0.8, 0.3, 0.1, 1.0);
        this.flameMaterial.setShininess(100);
        
        try {
            this.flameTexture = new CGFtexture(this.scene, 'textures/fire.jpg');
            this.flameMaterial.setTexture(this.flameTexture);
            this.flameMaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (e) {
            console.warn('Textura de fogo não encontrada. Usando apenas cor.');
        }
        
        this.baseMaterial = new CGFappearance(this.scene);
        this.baseMaterial.setAmbient(0.4, 0.4, 0.4, 1.0);
        this.baseMaterial.setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.baseMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.baseMaterial.setShininess(5);
        
        try {
            this.baseTexture = new CGFtexture(this.scene, 'textures/burnt_ground.jpg');
            this.baseMaterial.setTexture(this.baseTexture);
            this.baseMaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (e) {
            console.warn('Textura de solo queimado não encontrada. Usando apenas cor.');
        }
        
        this.smokeMaterial = new CGFappearance(this.scene);
        this.smokeMaterial.setAmbient(0.7, 0.7, 0.7, 0.6);
        this.smokeMaterial.setDiffuse(0.8, 0.8, 0.8, 0.5);
        this.smokeMaterial.setSpecular(0.9, 0.9, 0.9, 0.4);
        this.smokeMaterial.setShininess(5);
    }
    
   /**
     * Atualiza a animação das chamas
     * @param {Number} t - Tempo atual em milissegundos
     */
    update(t) {
        this.lastTime = t;
        
        this.flameShader.setUniformsValues({
            timeFactor: t
        });
        
        if (!this.lastUpdate || t - this.lastUpdate > 100) {
            this.lastUpdate = t;
            
            if (this.active) {
                for (const flame of this.flames) {
                    flame.rotationY += 0.005;
                    
                    flame.currentSwayMagnitude = flame.swayMagnitude * (0.8 + Math.sin(t * 0.0002 + flame.phase) * 0.2);
                    
                    if (!flame.originalHeight) {
                        flame.originalHeight = flame.height;
                    }
                    
                    const heightVariation = 0.9 + Math.sin(t * 0.0006 + flame.phase * 2.0) * 0.1 + Math.random() * 0.05;
                    flame.height = flame.originalHeight * heightVariation;
                    
                    if (!flame.originalWidth) {
                        flame.originalWidth = flame.width;
                    }
                    
                    const widthVariation = 0.95 + Math.sin(t * 0.0009 + flame.phase * 1.5) * 0.05 + Math.random() * 0.03;
                    flame.width = flame.originalWidth * widthVariation;
                }
            }
        }
        
        if (!this.active && this.showSmoke) {
            if (this.extinguishedTime && (t - this.extinguishedTime > this.smokeTime)) {
                this.showSmoke = false;
            }
        }
    }
    
    /**
     * Apaga o fogo (quando água é derramada sobre ele)
     */
    extinguish() {
        this.active = false;
        this.showSmoke = true;
        this.extinguishedTime = this.lastTime; 
        
        for (const flame of this.flames) {
            flame.height *= 0.2;
        }
        
    }
    
    
    drawBase() {
        this.scene.pushMatrix();
        
        this.scene.translate(0, 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(this.baseRadius, this.baseRadius, 1);
        
        if (!this.active && this.baseTexture) {
            this.baseMaterial.setTexture(this.baseTexture);
            this.baseMaterial.apply();
            this.basePlane.display();
        }
        
        this.scene.popMatrix();
    }
    
    drawFlame(flame) {
        this.scene.pushMatrix();
        
        this.scene.translate(flame.x, flame.y, flame.z);
        this.scene.rotate(flame.rotationY, 0, 1, 0);
        
        const currentSway = flame.currentSwayMagnitude || flame.swayMagnitude;
        
        this.flameShader.setUniformsValues({
            flamePhase: flame.phase,
            swayMagnitude: currentSway * 1.5,
            frequency: flame.frequency,
            colorVariation: flame.colorVariation,
            horizontalFactor: flame.horizontalFactor,
            verticalFactor: flame.verticalFactor
        });
        
        this.scene.scale(flame.width, flame.height, 1);
        
        this.flameShape.display();
        
        this.scene.popMatrix();
    }
    drawSmoke() {
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.smokeMaterial.apply();
        
        for (let i = 0; i < this.numFlames / 3; i++) {
            this.scene.pushMatrix();
            
            const radius = Math.random() * this.baseRadius * 0.5;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            this.scene.translate(x, 0.5 + Math.random() * 0.5, z);
            this.scene.scale(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5);
            
            this.smokeObj.display();
            
            this.scene.popMatrix();
        }
        
        this.scene.gl.disable(this.scene.gl.BLEND);
    }
    
    /**
     * Renderiza o fogo (chamas ou fumaça, dependendo do estado)
     */
    display() {
        this.drawBase();
        
        if (this.active) {
            this.scene.gl.enable(this.scene.gl.BLEND);
            this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
            
            this.flameMaterial.apply();
            this.scene.setActiveShader(this.flameShader);
            
            // Configurar o tempo atual no shader 
            this.flameShader.setUniformsValues({
                timeFactor: this.lastTime
            });
            
            for (const flame of this.flames) {
                this.drawFlame(flame);
            }
            
            this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.gl.disable(this.scene.gl.BLEND);
        } else if (this.showSmoke) {
            this.drawSmoke();
        }
    }
}