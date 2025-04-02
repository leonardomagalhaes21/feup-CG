import { CGFobject, CGFappearance } from "../lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MyWindow } from "./MyWindow.js";

/**
 * MyBuilding - Implementation of a fire station building
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {Number} totalWidth - Total width of the building (all three modules)
 * @param {Number} floors - Number of floors in the side modules
 * @param {Number} windowsPerFloor - Number of windows per floor
 * @param {CGFtexture} windowTexture - Texture for the windows
 * @param {Array} buildingColor - RGB color of the building [r, g, b]
 */
export class MyBuilding extends CGFobject {
    constructor(scene, totalWidth, floors, windowsPerFloor, windowTexture, buildingColor) {
        super(scene);
        this.scene = scene;
        
        // Building parameters
        this.totalWidth = totalWidth;
        this.floors = floors;
        this.windowsPerFloor = 2; // Fixed 2 windows per floor
        // White building color, regardless of input
        this.buildingColor = [1.0, 1.0, 1.0]; 
        
        // Calculate dimensions
        this.centerModuleWidth = this.totalWidth * 0.5;
        this.sideModuleWidth = this.totalWidth * 0.25;
        this.floorHeight = 3;
        this.centerModuleFloors = this.floors + 1; // Center module has one more floor
        this.buildingDepth = this.centerModuleWidth * 0.8;
        
        // Calculate heights
        this.sideModuleHeight = this.floors * this.floorHeight;
        this.centerModuleHeight = this.centerModuleFloors * this.floorHeight;
        
        // Window dimensions
        this.windowWidth = this.sideModuleWidth / 3.5; // Adjusted for 2 windows per floor
        this.windowHeight = this.floorHeight * 0.6;
        
        // Door dimensions
        this.doorWidth = this.centerModuleWidth * 0.4;
        this.doorHeight = this.floorHeight * 0.8;
        
        // Create window object
        this.window = new MyWindow(this.scene, windowTexture);
        
        // Create materials
        this.createMaterials();
        
        // Create building surfaces
        this.wall = new MyPlane(this.scene, 20);
    }
    
    /**
     * Creates materials for the building
     */
    createMaterials() {
        // Building material (white walls)
        this.buildingMaterial = new CGFappearance(this.scene);
        this.buildingMaterial.setAmbient(0.9, 0.9, 0.9, 1.0);
        this.buildingMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.buildingMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.buildingMaterial.setShininess(5.0);
        
        // Door material (brown)
        this.doorMaterial = new CGFappearance(this.scene);
        this.doorMaterial.setAmbient(0.3, 0.2, 0.1, 1.0);
        this.doorMaterial.setDiffuse(0.5, 0.3, 0.1, 1.0);
        this.doorMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.doorMaterial.setShininess(10.0);
        
        // Sign material (red)
        this.signMaterial = new CGFappearance(this.scene);
        this.signMaterial.setAmbient(0.8, 0.0, 0.0, 1.0); // Changed to red
        this.signMaterial.setDiffuse(1.0, 0.0, 0.0, 1.0);
        this.signMaterial.setSpecular(0.3, 0.3, 0.3, 1.0);
        this.signMaterial.setShininess(20.0);
        
        // Heliport material (dark gray with brighter specular)
        this.heliportMaterial = new CGFappearance(this.scene);
        this.heliportMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.heliportMaterial.setDiffuse(0.4, 0.4, 0.4, 1.0);
        this.heliportMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.heliportMaterial.setShininess(30.0);
    }
    
    /**
     * Draws a building module with windows
     * @param {Number} width - Width of the module
     * @param {Number} height - Height of the module
     * @param {Number} depth - Depth of the module
     * @param {Number} floors - Number of floors in this module
     * @param {Boolean} isCenter - Whether this is the center module
     */
    drawModule(width, height, depth, floors, isCenter) {
        // Front face
        this.scene.pushMatrix();
        this.scene.translate(0, height/2, depth/2);
        this.scene.scale(width, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Back face
        this.scene.pushMatrix();
        this.scene.translate(0, height/2, -depth/2);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(width, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Left face
        this.scene.pushMatrix();
        this.scene.translate(-width/2, height/2, 0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(depth, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Right face
        this.scene.pushMatrix();
        this.scene.translate(width/2, height/2, 0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.scene.scale(depth, height, 1);
        this.buildingMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
        
        // Draw windows on front face
        if (isCenter) {
            // For center module, draw door and sign on ground floor
            this.drawDoor();
            this.drawSign();
            
            // Draw windows on upper floors only for center module
            for (let floor = 1; floor < floors; floor++) {
                this.drawWindowRow(width, depth/2, floor, true);
            }
        } else {
            // For side modules, draw exactly 2 windows per floor
            for (let floor = 0; floor < floors; floor++) {
                this.drawSideModuleWindows(width, depth/2, floor);
            }
        }
        
        // Draw roof
        this.scene.pushMatrix();
        this.scene.translate(0, height, 0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.scale(width, depth, 1);
        
        if (isCenter) {
            // Center module has heliport on roof
            this.heliportMaterial.apply();
            this.wall.display();
            
            // Draw "H" on heliport
            this.drawHeliportH(width, depth);
        } else {
            // Side modules have plain roof
            this.buildingMaterial.apply();
            this.wall.display();
        }
        
        this.scene.popMatrix();
    }



    /**
     * Draws a simple "H" on the heliport using rectangles
     */
    drawHeliportH(width, depth) {
        // Reduced size for the H parts
        const thickness = Math.min(width, depth) * 0.03;
        const hWidth = width * 0.2;  
        const hHeight = depth * 0.2; 
        
        // White material for the "H"
        const whiteMaterial = new CGFappearance(this.scene);
        whiteMaterial.setAmbient(0.9, 0.9, 0.9, 1.0);
        whiteMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        whiteMaterial.setSpecular(0.1, 0.1, 0.1, 1.0);
        whiteMaterial.setShininess(10.0);
        whiteMaterial.apply();
        
        // Draw the "H" shape using rectangles
        // Left vertical bar
        this.scene.pushMatrix();
        this.scene.translate(-hWidth/2, 0, 0.01);
        this.scene.scale(thickness, hHeight, 1);
        this.wall.display();
        this.scene.popMatrix();
        
        // Right vertical bar
        this.scene.pushMatrix();
        this.scene.translate(hWidth/2, 0, 0.01);
        this.scene.scale(thickness, hHeight, 1);
        this.wall.display();
        this.scene.popMatrix();
        
        // Horizontal bar
        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.01);
        this.scene.scale(hWidth, thickness, 1);
        this.wall.display();
        this.scene.popMatrix();
    }

    /**
     * Draws a row of windows on a given floor (used for center module)
     * @param {Number} moduleWidth - Width of the building module
     * @param {Number} z - Z position (depth) of the windows
     * @param {Number} floor - Floor number (0-based)
     * @param {Boolean} isCenter - Whether this is for the center module
     */
    drawWindowRow(moduleWidth, z, floor, isCenter) {
        // Always 2 windows per floor, regardless of module type
        const windowCount = 2;
        const windowWidth = moduleWidth / (windowCount + 2); // More space around windows
        const spacing = moduleWidth / 3; // Consistent with side modules
        
        // First window (left)
        this.scene.pushMatrix();
        this.scene.translate(-spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01);
        this.window.display(windowWidth, this.windowHeight);
        this.scene.popMatrix();
        
        // Second window (right)
        this.scene.pushMatrix();
        this.scene.translate(spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01);
        this.window.display(windowWidth, this.windowHeight);
        this.scene.popMatrix();
    }
    
    
    
    /**
     * Draws exactly 2 windows per floor on a side module
     * @param {Number} moduleWidth - Width of the building module
     * @param {Number} z - Z position (depth) of the windows
     * @param {Number} floor - Floor number (0-based)
     */
    drawSideModuleWindows(moduleWidth, z, floor) {
        // Fixed 2 windows per floor, evenly spaced
        const spacing = moduleWidth / 3;
        
        // First window (left)
        this.scene.pushMatrix();
        this.scene.translate(-spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01);
        this.window.display(this.windowWidth, this.windowHeight);
        this.scene.popMatrix();
        
        // Second window (right)
        this.scene.pushMatrix();
        this.scene.translate(spacing, floor * this.floorHeight + this.floorHeight/2, z + 0.01);
        this.window.display(this.windowWidth, this.windowHeight);
        this.scene.popMatrix();
    }
    
    
    
    /**
     * Draws the main door for the center module
     */
    drawDoor() {
        this.scene.pushMatrix();
        this.scene.translate(0, this.doorHeight/2, this.buildingDepth/2 + 0.01);
        this.scene.scale(this.doorWidth, this.doorHeight, 1);
        this.doorMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
    }
    
    /**
     * Draws the "BOMBEIROS" sign above the door
     */
    drawSign() {
        const signWidth = this.doorWidth * 1.2;
        const signHeight = this.floorHeight * 0.15;
        const signY = this.doorHeight + signHeight/2;
        
        this.scene.pushMatrix();
        this.scene.translate(0, signY, this.buildingDepth/2 + 0.01);
        this.scene.scale(signWidth, signHeight, 1);
        this.signMaterial.apply();
        this.wall.display();
        this.scene.popMatrix();
    }
    
    /**
     * Display the complete fire station building
     */
    display() {
        this.scene.pushMatrix();
        
        // Draw left module
        this.scene.pushMatrix();
        this.scene.translate(-this.centerModuleWidth/2 - this.sideModuleWidth/2, 0, 0);
        this.drawModule(
            this.sideModuleWidth, 
            this.sideModuleHeight, 
            this.buildingDepth, 
            this.floors, 
            false
        );
        this.scene.popMatrix();
        
        // Draw center module
        this.scene.pushMatrix();
        this.drawModule(
            this.centerModuleWidth, 
            this.centerModuleHeight, 
            this.buildingDepth, 
            this.centerModuleFloors, 
            true
        );
        this.scene.popMatrix();
        
        // Draw right module
        this.scene.pushMatrix();
        this.scene.translate(this.centerModuleWidth/2 + this.sideModuleWidth/2, 0, 0);
        this.drawModule(
            this.sideModuleWidth, 
            this.sideModuleHeight, 
            this.buildingDepth, 
            this.floors, 
            false
        );
        this.scene.popMatrix();
        
        this.scene.popMatrix();
    }
}