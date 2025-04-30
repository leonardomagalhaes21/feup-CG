import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyPlane } from './MyPlane.js';
import { MyPyramid } from './MyPyramid.js';

export class MyFire extends CGFobject {
    constructor(scene, width = 10, height = 5, numFlames = 15) {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.numFlames = numFlames;
        
        // Posição do fogo
        this.x = 0;
        this.y = 0;
        this.z = 0;
        
        this.active = true;
        
        this.baseRadius = width / 2;
        
        this.basePlane = new MyPlane(this.scene, 20);
        this.flamePyramid = new MyPyramid(this.scene, 4, 1);
        this.smokeObj = new MySphere(this.scene, 8, 8);
        
        this.lastTime = 0;
        
        this.flames = [];
        
        this.initFlames();
        
        this.initMaterials();
    }
    
    /**
     * Inicializa as chamas com posições e parâmetros aleatórios
     */
    initFlames() {
        for (let i = 0; i < this.numFlames; i++) {
            // Posição radial aleatória dentro da área do fogo
            const radius = Math.random() * this.baseRadius * 0.8;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const height = this.height * (0.5 + Math.random() * 0.5);
            const width = this.width * 0.1 * (0.5 + Math.random() * 0.5);
            
            // Rotação base e velocidade de rotação aleatórias
            const rotationY = Math.random() * Math.PI * 2;
            const rotationSpeed = 0.2 + Math.random() * 0.3;
            
            const phase = Math.random() * Math.PI * 2;
            
            this.flames.push({
                x: x,
                z: z,
                height: height,
                width: width,
                rotationY: rotationY,
                rotationSpeed: rotationSpeed,
                phase: phase
            });
        }
    }
    
    /**
     * Inicializa materiais e texturas para o fogo
     */
    initMaterials() {
        // Material para as chamas (laranja avermelhado com emissão)
        this.flameMaterial = new CGFappearance(this.scene);
        this.flameMaterial.setAmbient(0.8, 0.3, 0.1, 1.0);
        this.flameMaterial.setDiffuse(0.9, 0.4, 0.1, 1.0);
        this.flameMaterial.setSpecular(1.0, 0.6, 0.2, 1.0);
        this.flameMaterial.setEmission(0.8, 0.3, 0.1, 1.0);
        this.flameMaterial.setShininess(100);
        
        // Textura para as chamas (se disponível)
        try {
            this.flameTexture = new CGFtexture(this.scene, 'textures/fire.jpg');
            this.flameMaterial.setTexture(this.flameTexture);
            this.flameMaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (e) {
            console.warn('Textura de fogo não encontrada. Usando apenas cor.');
        }
        
        // Material para a base queimada
        this.baseMaterial = new CGFappearance(this.scene);
        this.baseMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
        this.baseMaterial.setDiffuse(0.2, 0.2, 0.2, 1.0);
        this.baseMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.baseMaterial.setShininess(5);
        
        // Textura para área queimada (se disponível)
        try {
            this.baseTexture = new CGFtexture(this.scene, 'textures/burnt_ground.jpg');
            this.baseMaterial.setTexture(this.baseTexture);
            this.baseMaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (e) {
            console.warn('Textura de solo queimado não encontrada. Usando apenas cor.');
        }
        
        // Material para o fogo apagado (fumaça)
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
        if (!this.lastTime) {
            this.lastTime = t;
            return;
        }
        
        if (!this.active) return;
        
        const elapsed = t - this.lastTime;
        this.lastTime = t;
        
        for (const flame of this.flames) {
            flame.rotationY += flame.rotationSpeed * elapsed / 1000;
            
            flame.currentHeight = flame.height * (0.7 + 0.3 * Math.sin(t/1000 + flame.phase));
        }
    }
    
    /**
     * Apaga o fogo (quando água é derramada sobre ele)
     */
    extinguish() {
        this.active = false;
        
        for (const flame of this.flames) {
            flame.height *= 0.2;
        }
        
        console.log("Fogo apagado!");
    }
    
    
    drawBase() {
        this.scene.pushMatrix();
        
        this.scene.translate(0, 0.01, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(this.baseRadius, this.baseRadius, 1);
        
        this.baseMaterial.apply();
        this.basePlane.display();
        
        this.scene.popMatrix();
    }
    
    drawFlame(flame) {
        this.scene.pushMatrix();
        
        // Posicionar a chama
        this.scene.translate(flame.x, 0, flame.z);
        this.scene.rotate(flame.rotationY, 0, 1, 0);
        
        const height = flame.currentHeight || flame.height;
        
        this.scene.pushMatrix();
        this.scene.scale(flame.width, height, flame.width/2);
        this.flameMaterial.apply();
        this.flamePyramid.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
    
    drawSmoke() {
        // Configuração para transparência
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
            
            for (const flame of this.flames) {
                this.drawFlame(flame);
            }
            
            this.scene.gl.disable(this.scene.gl.BLEND);
        } else {
            this.drawSmoke();
        }
    }
}