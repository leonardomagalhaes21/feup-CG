import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

/**
 * MyLake - Implementation of a water body
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {Number} width - Width of the lake
 * @param {Number} depth - Depth of the lake
 * @param {String} waterTexturePath - Path to the water texture
 */
export class MyLake extends CGFobject {
    constructor(scene, width = 30, depth = 25, waterTexturePath = 'textures/water.jpg') {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.depth = depth;
        
        this.x = 0;
        this.y = 0;
        this.z = 0;
        
        this.surface = new MyPlane(this.scene, 20);
        
        this.initMaterials(waterTexturePath);
        
        this.lastTime = 0;
        this.wavePhase = 0;
    }
    
    /**
     * Inicializa os materiais e texturas do lago
     * @param {String} waterTexturePath - Caminho para a textura da água
     */
    initMaterials(waterTexturePath) {
        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.2, 0.3, 0.4, 0.8);
        this.waterMaterial.setDiffuse(0.3, 0.5, 0.7, 0.9);
        this.waterMaterial.setSpecular(0.6, 0.8, 1.0, 1.0);
        this.waterMaterial.setShininess(150);
        
        this.waterTexture = new CGFtexture(this.scene, waterTexturePath);
        this.waterMaterial.setTexture(this.waterTexture);
        this.waterMaterial.setTextureWrap('REPEAT', 'REPEAT');
    }
    
    /**
     * Atualiza a animação da água
     * @param {Number} t - Tempo atual em milissegundos
     */
    update(t) {
        if (!this.lastTime) {
            this.lastTime = t;
            return;
        }
        
        const elapsed = t - this.lastTime;
        this.wavePhase += elapsed * 0.0001;
        this.lastTime = t;
    }
    
    /**
     * Verifica se as coordenadas X,Z estão sobre o lago
     * @param {Number} x - Coordenada X para verificar
     * @param {Number} z - Coordenada Z para verificar
     * @returns {Boolean} - true se (x,z) está sobre o lago
     */
    isOverLake(x, z) {
        const halfWidth = this.width / 2;
        const halfDepth = this.depth / 2;
        
        return (
            x >= this.x - halfWidth &&
            x <= this.x + halfWidth &&
            z >= this.z - halfDepth &&
            z <= this.z + halfDepth
        );
    }
    
    /**
     * Renderiza o lago
     */
    display() {
        this.scene.pushMatrix();
        
        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        
        this.scene.scale(this.width, this.depth, 1);
        
        this.scene.pushMatrix();
        this.scene.translate(0, 0, Math.sin(this.wavePhase) * 0.01); 
        
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        this.waterMaterial.apply();
        this.surface.display();
        
        this.scene.gl.disable(this.scene.gl.BLEND);
        
        this.scene.popMatrix();
        this.scene.popMatrix();
    }
}