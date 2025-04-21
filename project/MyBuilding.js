import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MyWindow } from "./MyWindow.js";

export class MyBuilding extends CGFobject {
    constructor(scene, totalWidth, floors, windowsPerFloor, windowTexture, roofTexture, bombeirosTexture, buildingColor) {
        super(scene);
        this.scene = scene;
        
        // Parâmetros principais
        this.totalWidth = totalWidth;
        this.floors = floors;
        this.windowsPerFloor = windowsPerFloor || 2;
        this.buildingColor = buildingColor || [1.0, 1.0, 1.0];
        
        // Texturas
        this.windowTexture = windowTexture;
        this.roofTexture = roofTexture;
        this.bombeirosTexture = bombeirosTexture;
        
        // Dimensões calculadas
        this.centerModuleWidth = this.totalWidth * 0.3;
        this.sideModuleWidth = this.totalWidth * 0.25;
        this.floorHeight = 3;
        this.centerModuleFloors = this.floors + 1;
        this.buildingDepth = this.centerModuleWidth * 0.8;
        
        this.sideModuleHeight = this.floors * this.floorHeight;
        this.centerModuleHeight = this.centerModuleFloors * this.floorHeight;
        
        this.windowWidth = this.sideModuleWidth / 3.5;
        this.windowHeight = this.floorHeight * 0.6;
        
        this.doorWidth = this.centerModuleWidth * 0.2;
        this.doorHeight = this.floorHeight * 0.8;
        
        this.window = new MyWindow(this.scene, windowTexture);
        this.createMaterials();
        this.wall = new MyPlane(this.scene, 20);
    }
    
    createMaterials() {
        // Edifício principal (branco)
        this.buildingMaterial = new CGFappearance(this.scene);
        this.buildingMaterial.setAmbient(0.7, 0.7, 0.7, 1.0);
        this.buildingMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.buildingMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.buildingMaterial.setShininess(5.0);
        
        // Base/fundação (cinza)
        this.foundationMaterial = new CGFappearance(this.scene);
        this.foundationMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.foundationMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.foundationMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.foundationMaterial.setShininess(10.0);

        
        
        // Placa "BOMBEIROS"
        this.bombeirosSignMaterial = new CGFappearance(this.scene);
        this.bombeirosSignMaterial.setAmbient(0.9, 0.9, 0.9, 1.0);
        this.bombeirosSignMaterial.setDiffuse(0.9, 0.9, 0.9, 1.0);
        this.bombeirosSignMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.bombeirosSignMaterial.setShininess(10.0);
        
        if (this.bombeirosTexture && typeof this.bombeirosTexture.bind === 'function') {
            this.bombeirosSignMaterial.setTexture(this.bombeirosTexture);
            this.bombeirosSignMaterial.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
        }
        
        // Telhado
        this.roofMaterial = new CGFappearance(this.scene);
        this.roofMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.roofMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.roofMaterial.setSpecular(0.2, 0.2, 0.2, 1.0);
        this.roofMaterial.setShininess(10.0);
        
        if (this.roofTexture && typeof this.roofTexture.bind === 'function') {
            this.roofMaterial.setTexture(this.roofTexture);
            this.roofMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
    }

    drawModule(width, height, depth, floors, isCenter, isLeft = null) {
        // Base
        this.scene.pushMatrix();
        this.scene.translate(0, -0.1, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(width * 1.05, depth * 1.05, 1);
        this.foundationMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Face inferior
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(width, depth, 1);
        this.foundationMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();

        // Face frontal
        this.scene.pushMatrix();
        this.scene.translate(0, height/2, depth/2);
        this.scene.scale(width, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Face traseira
        this.scene.pushMatrix();
        this.scene.translate(0, height/2, -depth/2);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(width, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();

        if (isCenter) {
            // Face esquerda do módulo central
            this.scene.pushMatrix();
            this.scene.translate(-width/2, height/2, 0);
            this.scene.rotate(Math.PI/2, 0, 1, 0);
            this.scene.scale(depth, height, 1);
            this.buildingMaterial.apply();
            this.wall.display();
            this.scene.popMatrix();
            
            // Face direita do módulo central
            this.scene.pushMatrix();
            this.scene.translate(width/2, height/2, 0);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.scale(depth, height, 1);
            this.buildingMaterial.apply();
            this.wall.display();
            this.scene.popMatrix();
        } else {
            // Faces laterais dos módulos laterais
            if (isLeft === true) {
                // Face externa esquerda
                this.scene.pushMatrix();
                this.scene.translate(-width/2, height/2, 0);
                this.scene.rotate(Math.PI/2, 0, 1, 0);
                this.scene.scale(depth, height, 1);
                this.buildingMaterial.apply();
                this.wall.display();
                this.scene.popMatrix();
                
                // Face interna direita
                this.scene.pushMatrix();
                this.scene.translate(width/2, height/2, 0);
                this.scene.rotate(-Math.PI/2, 0, 1, 0);
                this.scene.scale(depth, height, 1);
                this.buildingMaterial.apply();
                this.wall.display();
                this.scene.popMatrix();
            } else {
                // Face externa direita
                this.scene.pushMatrix();
                this.scene.translate(width/2, height/2, 0);
                this.scene.rotate(-Math.PI/2, 0, 1, 0);
                this.scene.scale(depth, height, 1);
                this.buildingMaterial.apply();
                this.wall.display();
                this.scene.popMatrix();
                
                // Face interna esquerda
                this.scene.pushMatrix();
                this.scene.translate(-width/2, height/2, 0);
                this.scene.rotate(Math.PI/2, 0, 1, 0);
                this.scene.scale(depth, height, 1);
                this.buildingMaterial.apply();
                this.wall.display();
                this.scene.popMatrix();
            }
        }
        
        if (isCenter) {
            this.drawDoor();
            this.drawSign();
            
            for (let floor = 1; floor < floors; floor++) {
                this.drawWindows(width, depth/2, floor);
                this.drawWindows(width, -depth/2, floor);
            }
        } else {
            for (let floor = 0; floor < floors; floor++) {
                this.drawWindows(width, depth/2, floor);
                this.drawWindows(width, -depth/2, floor);
            }
        }
        
        // Telhado
        this.scene.pushMatrix();
        this.scene.translate(0, height, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(width, depth, 1);
        
        if (isCenter && this.roofTexture && typeof this.roofTexture.bind === 'function') {
            this.roofMaterial.apply();
        } else {
            this.buildingMaterial.apply();
        }
        
        this.wall.display();
        this.scene.popMatrix();
    }

    /**
     * Desenha janelas com bordas azuis
     */
    drawWindows(moduleWidth, z, floor) {
        const spacing = moduleWidth / 3;
        const borderSize = 0.05; 
        const borderColor = [0.0, 0.1, 0.5, 1.0]; 
        
        // Material para a borda
        const borderMaterial = new CGFappearance(this.scene);
        borderMaterial.setAmbient(borderColor[0], borderColor[1], borderColor[2], borderColor[3]);
        borderMaterial.setDiffuse(borderColor[0], borderColor[1], borderColor[2], borderColor[3]);
        borderMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        borderMaterial.setShininess(10.0);
        
        // Posições das janelas
        const positions = [
            [-spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01],
            [spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01]
        ];
        
        // Desenhar cada janela
        for (const pos of positions) {
            this.scene.pushMatrix();
            this.scene.translate(pos[0], pos[1], pos[2]);
            this.scene.scale(this.windowWidth + borderSize*2, this.windowHeight + borderSize*2, 1);
            borderMaterial.apply();
            this.wall.display();
            this.scene.popMatrix();
            
            this.scene.pushMatrix();
            this.scene.translate(pos[0], pos[1], pos[2] + 0.01);
            
            this.window.display(this.windowWidth, this.windowHeight);
            this.scene.popMatrix();
        }
    }
        
    drawDoor() {
        const doorWidth = this.doorWidth * 0.6; 
        const doorHeight = this.doorHeight;
        const borderSize = 0.08; 
        const borderColor = [0.0, 0.1, 0.5, 1.0]; 
        
        // Material para a borda
        const borderMaterial = new CGFappearance(this.scene);
        borderMaterial.setAmbient(borderColor[0], borderColor[1], borderColor[2], borderColor[3]);
        borderMaterial.setDiffuse(borderColor[0], borderColor[1], borderColor[2], borderColor[3]);
        borderMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        borderMaterial.setShininess(10.0);
        
        this.scene.pushMatrix();
        this.scene.translate(0, doorHeight/2, this.buildingDepth/2 + 0.01);
        this.scene.scale(doorWidth + borderSize*2, doorHeight + borderSize*2, 1);
        borderMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        this.scene.pushMatrix();
        this.scene.translate(0, doorHeight/2, this.buildingDepth/2 + 0.02); 
        
        this.window.display(doorWidth, doorHeight);
        
        this.scene.popMatrix();
    }
    
    drawSign() {
        const signWidth = this.doorWidth * 1.2;
        const signHeight = this.floorHeight * 0.25;
        const signY = this.doorHeight + signHeight/2;
        
        this.scene.pushMatrix();
        this.scene.translate(0, signY, this.buildingDepth/2 + 0.01);
        this.scene.scale(signWidth, signHeight, 1);
        
        if (this.bombeirosTexture && typeof this.bombeirosTexture.bind === 'function') {
            this.bombeirosSignMaterial.apply();
        } else {
            this.bombeirosSignMaterial.apply();
        }
        
        this.wall.display();
        this.scene.popMatrix();
    }
    
    display() {
        // Módulo esquerdo
        this.scene.pushMatrix();
        this.scene.translate(-this.centerModuleWidth/2 - this.sideModuleWidth/2, 0, 0);
        this.drawModule(
            this.sideModuleWidth, 
            this.sideModuleHeight, 
            this.buildingDepth, 
            this.floors, 
            false,
            true
        );
        this.scene.popMatrix();
        
        // Módulo central
        this.scene.pushMatrix();
        this.drawModule(
            this.centerModuleWidth, 
            this.centerModuleHeight, 
            this.buildingDepth, 
            this.centerModuleFloors, 
            true
        );
        this.scene.popMatrix();
        
        // Módulo direito
        this.scene.pushMatrix();
        this.scene.translate(this.centerModuleWidth/2 + this.sideModuleWidth/2, 0, 0);
        this.drawModule(
            this.sideModuleWidth, 
            this.sideModuleHeight, 
            this.buildingDepth, 
            this.floors, 
            false,
            false
        );
        this.scene.popMatrix();
    }
}