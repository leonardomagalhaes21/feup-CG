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
            verticalFactor: 0.7,
            windDirection: 1.0,  
            windStrength: 0.6
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
        
        // Parâmetros do vento
        this.windDirection = 1.0;
        this.windStrength = 0.6;
        this.windCycleTime = 5000;  
        this.windVariation = 0.2;    
        
        this.initFlames();
        this.initMaterials();
        this.initShaders();
    }
    
   /**
     * Inicializa as chamas com posições e parâmetros aleatórios
     */
   initFlames() {
    const consistentWindStrength = 0.5 + Math.random() * 0.2; 
    
    
    const minHeightFactor = 0.7;  
    const maxHeightFactor = 1.1;  
    const heightRange = maxHeightFactor - minHeightFactor;
    
    for (let i = 0; i < this.numFlames; i++) {
        const radius = Math.random() * this.baseRadius * 0.9;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const y = 0.05;
        
        const height = this.height * (minHeightFactor + Math.random() * heightRange);
        
        // Larguras também mais uniformes
        const minWidthFactor = 0.4; 
        const maxWidthFactor = 0.9; 
        const width = this.width * 0.1 * (minWidthFactor + Math.random() * (maxWidthFactor - minWidthFactor));
        
        // Resto do código permanece igual
        const individualWindDirection = Math.random() * 2 - 1;
        const individualWindStrength = consistentWindStrength * (0.95 + Math.random() * 0.1);
        const windCycleTime = 4000 + Math.random() * 3000;
        const windVariation = 0.15 + Math.random() * 0.1;
        
        // Fase e frequências com pequenas variações
        const phase = Math.random() * Math.PI * 2;
        const swayMagnitude = 0.4 + Math.random() * 0.1; 
        const frequency = 4.0 + Math.random() * 2.0; 
        
        const horizontalFactor = 0.9 + Math.random() * 0.2;
        const verticalFactor = 0.3 + Math.random() * 0.1;
        
        const windPhase = Math.random() * Math.PI * 2;
        
        this.flames.push({
            x: x,
            y: y,
            z: z,
            height: height,
            width: width,
            rotationY: 0,
            rotationSpeed: 0,
            phase: phase,
            frequency: frequency,
            swayMagnitude: swayMagnitude,
            colorVariation: 0.9 + Math.random() * 0.2,
            horizontalFactor: horizontalFactor,
            verticalFactor: verticalFactor,
            pulseFrequency: 0.6 + Math.random() * 0.2,
            pulseAmplitude: 0.12 + Math.random() * 0.06,
            
            individualWindDirection: individualWindDirection,
            individualWindStrength: individualWindStrength,
            windCycleTime: windCycleTime,
            windVariation: windVariation,
            windPhase: windPhase,
            lastWindUpdate: 0
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
     * Atualiza os parâmetros do vento com base no tempo
     * @param {Number} t - Tempo atual em milissegundos
     */
    updateWind(t) {
        const windCycle = (t % this.windCycleTime) / this.windCycleTime;
        
        this.windDirection = Math.sin(windCycle * Math.PI * 2);
        
        const windVariation = Math.sin(t * 0.0002) * this.windVariation;
        this.windStrength = 0.9 + windVariation;
        
        this.flameShader.setUniformsValues({
            windDirection: this.windDirection,
            windStrength: this.windStrength
        });
    }
    
   /**
     * Atualiza a animação das chamas
     * @param {Number} t - Tempo atual em milissegundos
     */
   update(t) {
    this.lastTime = t;
    

    
    this.flameShader.setUniformsValues({
        timeFactor: t * 1.2
    });
    
    if (!this.lastUpdate || t - this.lastUpdate > 8) { 
        this.lastUpdate = t;
        
        if (this.active) {
            for (const flame of this.flames) {

                
                flame.rotationY = 0;
                
                if (!flame.originalHeight) {
                    flame.originalHeight = flame.height;
                }
                if (!flame.originalWidth) {
                    flame.originalWidth = flame.width;
                }
                

                const windCycle = (t % flame.windCycleTime) / flame.windCycleTime;
                

                flame.currentWindDirection = flame.individualWindDirection * 
                    Math.sin(windCycle * Math.PI * 2 + flame.windPhase);
                
                const windTimeOffset = t * 0.0002 + flame.phase;
                const windVariation = Math.sin(windTimeOffset) * flame.windVariation;
                flame.currentWindStrength = flame.individualWindStrength * (0.8 + windVariation);
                
                
                if (flame.windGust && flame.windGustStart) {
                    const elapsed = t - flame.windGustStart;
                    if (elapsed < flame.windGustDuration) {
                        const progress = elapsed / flame.windGustDuration;
                        const gustFactor = Math.sin(progress * Math.PI);
                        flame.currentWindStrength += flame.windGust * gustFactor;
                    } else {
                        flame.windGust = null;
                        flame.windGustStart = null;
                    }
                }
                

                const windHeightFactor = 1.0 - Math.abs(flame.currentWindDirection) * 0.1 * flame.currentWindStrength;
                const heightVariation = 0.97 * windHeightFactor + Math.sin(t * 0.001 + flame.phase) * 0.03;
                flame.height = flame.originalHeight * heightVariation;
                
                const windWidthFactor = 1.0 + Math.abs(flame.currentWindDirection) * 0.05 * flame.currentWindStrength;
                const widthVariation = 0.97 * windWidthFactor + Math.sin(t * 0.0015 + flame.phase * 1.2) * 0.03;
                flame.width = flame.originalWidth * widthVariation;
                
                flame.phase += 0.0003;
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
        
        this.baseMaterial.setTexture(this.baseTexture);
        this.baseMaterial.apply();
        this.basePlane.display();
        
        this.scene.popMatrix();
    }
    
    drawFlame(flame) {
        this.scene.pushMatrix();
        
        this.scene.translate(flame.x, flame.y, flame.z);
        
        const maxDistanceToEdge = this.baseRadius;
        
        const flameDistanceFromCenter = Math.sqrt(flame.x * flame.x + flame.z * flame.z);
        

        const availableSpace = Math.max(0, (maxDistanceToEdge - flameDistanceFromCenter) / maxDistanceToEdge);
        

        const tiltScaleFactor = 0.25 * (0.5 + 0.5 * availableSpace);
        
        const maxTiltAngle = Math.atan2(availableSpace * maxDistanceToEdge, flame.height);
        const baseMaxTilt = Math.min(Math.PI / 6, maxTiltAngle);
        
        const rawWindTilt = flame.currentWindDirection * tiltScaleFactor;
        const windTilt = Math.sign(rawWindTilt) * Math.min(Math.abs(rawWindTilt), baseMaxTilt);
        
        // Aplicar inclinação
        this.scene.rotate(windTilt, 0, 0, 1); 
        
        this.flameShader.setUniformsValues({
            flamePhase: flame.phase,
            swayMagnitude: flame.swayMagnitude,
            frequency: flame.frequency * 30.0, 
            colorVariation: flame.colorVariation,
            horizontalFactor: flame.horizontalFactor * 3.0,
            verticalFactor: flame.verticalFactor * 3.0,
            windDirection: flame.currentWindDirection, 
            windStrength: 0.5 
        });
        
        this.scene.scale(flame.width, flame.height, 1);
        
        this.flameShape.display();
        
        this.scene.popMatrix();
    }


    drawSmoke() {
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.smokeMaterial.apply();
        
        // Direção do fumo também é afetada pelo vento
        const smokeWindOffset = this.windDirection * this.windStrength * 0.5;
        
        for (let i = 0; i < this.numFlames / 3; i++) {
            this.scene.pushMatrix();
            
            const radius = Math.random() * this.baseRadius * 0.5;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius + smokeWindOffset;  // Deslocamento com o vento
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
        // Deixei o código da base comentado conforme solicitado
        // this.drawBase();
        
        if (this.active) {
            this.scene.gl.enable(this.scene.gl.BLEND);
            this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
            
            this.flameMaterial.apply();
            this.scene.setActiveShader(this.flameShader);
            
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