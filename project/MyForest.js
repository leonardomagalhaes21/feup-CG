import { CGFobject } from "../lib/CGF.js";
import { MyTree } from "./MyTree.js";

/**
 * MyForest - Implementation of a forest with multiple trees in a grid arrangement
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {Number} rows - Number of rows in the forest grid
 * @param {Number} columns - Number of columns in the forest grid
 * @param {Number} width - Total width of the forest area
 * @param {Number} depth - Total depth of the forest area
 * @param {CGFtexture} trunkTexture - Texture for tree trunks
 * @param {CGFtexture} crownTexture - Texture for tree crowns
 */
export class MyForest extends CGFobject {
    constructor(scene, rows = 5, columns = 4, width = 100, depth = 80, trunkTexture = null, crownTexture = null) {
        super(scene);
        this.scene = scene;
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.depth = depth;
        this.trunkTexture = trunkTexture;
        this.crownTexture = crownTexture;
        
        this.trees = [];
        this.initTrees();
    }
    
    /**
     * Create a grid of trees with random parameters within reasonable bounds and random position offsets
     */
    initTrees() {
        const cellWidth = this.width / this.columns;
        const cellDepth = this.depth / this.rows;
        
        const maxOffsetPercent = 0.3;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const baseX = -this.width/2 + (col + 0.5) * cellWidth;
                const baseZ = -this.depth/2 + (row + 0.5) * cellDepth;
                
                const offsetX = (Math.random() * 2 - 1) * maxOffsetPercent * cellWidth;
                const offsetZ = (Math.random() * 2 - 1) * maxOffsetPercent * cellDepth;
                
                const x = baseX + offsetX;
                const z = baseZ + offsetZ;
                
                const tiltAngle = Math.random() * 15 - 7.5; 
                const tiltAxis = Math.random() > 0.5 ? 'X' : 'Z';
                const trunkRadius = 0.3 + Math.random() * 0.4;
                const treeHeight = 7 + Math.random() * 3;
                

                const r_component = 0.05 + Math.random() * 0.20;  // R: 0.05 to 0.25
                const g_component = 0.40 + Math.random() * 0.50;  // G: 0.40 to 0.90
                const b_component = 0.05 + Math.random() * 0.20;  // B: 0.05 to 0.25

                const crownColor = [r_component, g_component, b_component];
                
                const tree = new MyTree(
                    this.scene, 
                    tiltAngle, 
                    tiltAxis, 
                    trunkRadius, 
                    treeHeight, 
                    crownColor,
                    this.trunkTexture,
                    this.crownTexture
                );
                
                this.trees.push({
                    position: [x, 0, z],
                    tree: tree
                });
            }
        }
    }
    
    display() {
        for (const treeObj of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(treeObj.position[0], treeObj.position[1], treeObj.position[2]);
            treeObj.tree.display();
            this.scene.popMatrix();
        }
    }

    
}
