import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';

/**
 * MyBorder - Classe auxiliar para a borda do lago
 */
class MyBorder extends CGFobject {
    constructor(scene, vertices, indices, normals, texCoords) {
        super(scene);
        this.scene = scene;
        
        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.texCoords = texCoords;
        
        this.initGLBuffers();
    }
}

/**
 * MyLake - Implementação de um lago com formato irregular e borda simples
 */
export class MyLake extends CGFobject {
    constructor(scene, width = 50, depth = 45, waterTexturePath = 'textures/water.jpg') {
        super(scene);
        this.scene = scene;
        this.width = width;
        this.depth = depth;
        
        // Posição do lago
        this.x = 0;
        this.y = 0.01; // Ligeiramente acima do plano para evitar z-fighting
        this.z = 0;
        
        // Borda
        this.borderWidth = 0.8; // Largura da borda em unidades
        
        // Inicializar materiais
        this.initMaterials(waterTexturePath);
        
        // Criar o formato do lago
        this.generateLakeShape();
        
        // Para compatibilidade
        this.lastTime = 0;
    }
    
    /**
     * Gera a forma irregular do lago usando vértices
     */
    generateLakeShape() {
        // Número de pontos na borda
        const numPoints = 36;
        
        // Array para armazenar os pontos do contorno
        this.lakePoints = [];
        
        // Criar pontos base do contorno
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            
            // Variação entre 75% e 100% do raio
            const variation = 0.75 + Math.random() * 0.25;
            
            const x = Math.cos(angle) * (this.width/2) * variation;
            const z = Math.sin(angle) * (this.depth/2) * variation;
            
            this.lakePoints.push([x, z]);
        }
        
        // Gerar pontos adicionais entre pontos muito distantes
        const extraPoints = [];
        for (let i = 0; i < this.lakePoints.length; i++) {
            const current = this.lakePoints[i];
            const next = this.lakePoints[(i + 1) % this.lakePoints.length];
            
            const dx = next[0] - current[0];
            const dz = next[1] - current[1];
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist > this.width * 0.05) {
                const midX = (current[0] + next[0]) / 2;
                const midZ = (current[1] + next[1]) / 2;
                
                extraPoints.push({
                    index: i + 1,
                    point: [midX, midZ]
                });
            }
        }
        
        // Adicionar os pontos extras
        extraPoints.sort((a, b) => b.index - a.index);
        for (const {index, point} of extraPoints) {
            this.lakePoints.splice(index, 0, point);
        }
        
        // Calcular centro e raio para detecção
        this.calculateCenterAndRadius();
        
        // Inicializar os buffers para água
        this.initWaterBuffers();
        
        // Inicializar pontos para a borda e criar objeto de borda
        this.prepareBorderPoints();
        this.createBorderObject();
    }
    
    /**
     * Calcula o centro e raio aproximado do lago para detecção de colisões
     */
    calculateCenterAndRadius() {
        let sumX = 0, sumZ = 0;
        let maxDist = 0;
        
        // Calcular o centro do lago
        for (const point of this.lakePoints) {
            sumX += point[0];
            sumZ += point[1];
        }
        
        this.centerX = sumX / this.lakePoints.length;
        this.centerZ = sumZ / this.lakePoints.length;
        
        // Calcular o raio máximo
        for (const point of this.lakePoints) {
            const dx = point[0] - this.centerX;
            const dz = point[1] - this.centerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist > maxDist) {
                maxDist = dist;
            }
        }
        
        this.radius = maxDist;
    }
    
    /**
     * Inicializa os buffers da superfície de água
     */
    initWaterBuffers() {
        // Vértices para o lago (começando com o centro)
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        // Vértice central
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);
        
        // Adicionar pontos do contorno
        for (let i = 0; i < this.lakePoints.length; i++) {
            const point = this.lakePoints[i];
            
            // Para cada ponto no contorno, adicionar vértice no plano XZ
            this.vertices.push(point[0], 0, point[1]);
            this.normals.push(0, 1, 0);
            
            // Coordenadas de textura normalizadas
            const tx = (point[0] / this.width) * 0.5 + 0.5;
            const ty = (point[1] / this.depth) * 0.5 + 0.5;
            this.texCoords.push(tx, ty);
            
            // Criar triângulo do centro ao ponto atual e próximo (triangle fan)
            if (i < this.lakePoints.length - 1) {
                this.indices.push(0, i + 1, i + 2);
            } else {
                // Fechar o polígono
                this.indices.push(0, i + 1, 1);
            }
        }
        
        // Inicializar os buffers GL para a água
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
    /**
     * Prepara os pontos para a borda do lago
     */
    prepareBorderPoints() {
        // Para cada ponto do contorno do lago, criar um ponto externo para a borda
        this.borderPoints = [];
        for (const point of this.lakePoints) {
            // Calcular direção do centro para o ponto (normalizado)
            const dx = point[0] - this.centerX;
            const dz = point[1] - this.centerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            let dirX = 0, dirZ = 0;
            if (dist > 0.001) {
                dirX = dx / dist;
                dirZ = dz / dist;
            }
            
            // Ponto externo da borda - aumentar o raio pela largura da borda
            const borderX = point[0] + dirX * this.borderWidth;
            const borderZ = point[1] + dirZ * this.borderWidth;
            
            this.borderPoints.push([borderX, borderZ]);
        }
    }
    
    /**
     * Cria o objeto de borda
     */
    createBorderObject() {
        const borderVertices = [];
        const borderIndices = [];
        const borderNormals = [];
        const borderTexCoords = [];
        
        // Criar triângulos para a borda
        for (let i = 0; i < this.lakePoints.length; i++) {
            const lakePoint = this.lakePoints[i];
            const borderPoint = this.borderPoints[i];
            const nextIndex = (i + 1) % this.lakePoints.length;
            const nextLakePoint = this.lakePoints[nextIndex];
            const nextBorderPoint = this.borderPoints[nextIndex];
            
            // Vértices para formar o quadrilátero da borda
            const baseIdx = borderVertices.length / 3;
            
            // Ponto interno (lago) atual
            borderVertices.push(lakePoint[0], 0, lakePoint[1]);
            borderNormals.push(0, 1, 0);
            borderTexCoords.push(0, 0);
            
            // Ponto externo (borda) atual
            borderVertices.push(borderPoint[0], 0, borderPoint[1]);
            borderNormals.push(0, 1, 0);
            borderTexCoords.push(1, 0);
            
            // Ponto interno (lago) próximo
            borderVertices.push(nextLakePoint[0], 0, nextLakePoint[1]);
            borderNormals.push(0, 1, 0);
            borderTexCoords.push(0, 1);
            
            // Ponto externo (borda) próximo
            borderVertices.push(nextBorderPoint[0], 0, nextBorderPoint[1]);
            borderNormals.push(0, 1, 0);
            borderTexCoords.push(1, 1);
            
            // Dois triângulos formando um quad
            borderIndices.push(
                baseIdx, baseIdx + 2, baseIdx + 1,
                baseIdx + 1, baseIdx + 2, baseIdx + 3
            );
        }
        
        // Criar o objeto da borda
        this.borderObject = new MyBorder(
            this.scene, 
            borderVertices, 
            borderIndices, 
            borderNormals,
            borderTexCoords
        );
    }
    
    /**
     * Inicializa os materiais e texturas do lago
     */
    initMaterials(waterTexturePath) {
        // Material para a água - tom azul intenso
        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.0, 0.3, 0.7, 0.8);
        this.waterMaterial.setDiffuse(0.0, 0.5, 1.0, 0.8);
        this.waterMaterial.setSpecular(0.5, 0.8, 1.0, 0.9);
        this.waterMaterial.setEmission(0.0, 0.1, 0.3, 0.2);
        this.waterMaterial.setShininess(300);
        
        // Carregar textura da água
        try {
            this.waterTexture = new CGFtexture(this.scene, waterTexturePath);
            this.waterMaterial.setTexture(this.waterTexture);
            this.waterMaterial.setTextureWrap('REPEAT', 'REPEAT');
        } catch (e) {
            console.warn('Textura de água não encontrada. Usando apenas cor.');
        }
        
        // Material para a borda - marrom terroso
        this.borderMaterial = new CGFappearance(this.scene);
        this.borderMaterial.setAmbient(0.2, 0.15, 0.1, 1.0);
        this.borderMaterial.setDiffuse(0.35, 0.25, 0.15, 1.0);
        this.borderMaterial.setSpecular(0.05, 0.05, 0.05, 1.0);
        this.borderMaterial.setEmission(0.0, 0.0, 0.0, 1.0);
        this.borderMaterial.setShininess(10);
    }
    
    /**
     * Atualiza a animação de ondas da água (vazio para compatibilidade)
     */
    update(t) {
        // Vazio - nenhuma animação
        this.lastTime = t;
    }
    
    /**
     * Verificação rápida se um ponto está próximo do lago
     */
    isNearLake(x, z) {
        const dx = x - (this.x + this.centerX);
        const dz = z - (this.z + this.centerZ);
        const distance = Math.sqrt(dx*dx + dz*dz);
        
        return distance <= this.radius * 1.2;
    }
    
    /**
     * Verifica se um ponto está dentro do polígono do lago
     */
    isPointInPolygon(x, z) {
        let inside = false;
        
        // Ajustar para a posição do lago
        x -= this.x;
        z -= this.z;
        
        // Algoritmo ray casting
        for (let i = 0, j = this.lakePoints.length - 1; i < this.lakePoints.length; j = i++) {
            const xi = this.lakePoints[i][0];
            const zi = this.lakePoints[i][1];
            const xj = this.lakePoints[j][0];
            const zj = this.lakePoints[j][1];
            
            const intersect = ((zi > z) !== (zj > z)) && 
                             (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Verifica se as coordenadas estão sobre o lago
     */
    isOverLake(x, z) {
        if (!this.isNearLake(x, z)) {
            return false;
        }
        
        return this.isPointInPolygon(x, z);
    }
    
    /**
     * Renderiza o lago na cena
     */
    display() {
        this.scene.pushMatrix();
        
        // Posicionar o lago
        this.scene.translate(this.x, this.y, this.z);
        
        // 1. Primeiro desenhar a borda
        this.borderMaterial.apply();
        this.borderObject.display();
        
        // 2. Depois desenhar a água com transparência
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        this.scene.gl.depthMask(false);
        
        this.waterMaterial.apply();
        super.display();
        
        this.scene.gl.depthMask(true);
        this.scene.gl.disable(this.scene.gl.BLEND);
        
        this.scene.popMatrix();
    }
}