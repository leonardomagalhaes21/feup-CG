import { CGFobject } from "../lib/CGF.js";

/**
 * MySphere - Implementation of a 3D sphere
 * @constructor
 * @param {CGFscene} scene - Reference to MyScene object
 * @param {Integer} slices - Number of divisions around Y axis
 * @param {Integer} stacks - Number of layers in each hemisphere (from equator to pole)
 * @param {Number} radius - Sphere radius (default: 1)
 * @param {Boolean} inside - Whether to see the sphere from inside (default: false)
 */
export class MySphere extends CGFobject {
  constructor(scene, slices, stacks, radius = 1, inside = false) {
    super(scene);
    this.slices = slices;
    this.stacks = stacks;
    this.radius = radius;
    this.inside = inside;
    
    this.initBuffers();
  }

  /**
   * @method initBuffers
   * Initializes the sphere buffers using angular divisions
   */
  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const alphaInc = Math.PI / (2 * this.stacks);
    const betaInc = (2 * Math.PI) / this.slices;
    
    const verticesPerParallel = this.slices + 1;
    
    // Starting from the south pole (-90°) to the north pole (+90°)
    for (let stackIdx = 0; stackIdx <= 2 * this.stacks; stackIdx++) {
      const alpha = -Math.PI/2 + stackIdx * alphaInc;
      const sinAlpha = Math.sin(alpha);
      const cosAlpha = Math.cos(alpha);
      
      const y = this.radius * sinAlpha;
      
      const parallelRadius = this.radius * cosAlpha;
      
      for (let sliceIdx = 0; sliceIdx <= this.slices; sliceIdx++) {
        const beta = sliceIdx * betaInc;
        const sinBeta = Math.sin(beta);
        const cosBeta = Math.cos(beta);
        
        // Calculate the cartesian coordinates
        const x = parallelRadius * cosBeta;
        const z = parallelRadius * sinBeta;
        
        this.vertices.push(x, y, z);
        
        // Calculate normal (points from center to surface or vice versa if inside)
        const length = Math.sqrt(x*x + y*y + z*z);
        const normalDirection = this.inside ? -1 : 1;
        this.normals.push(normalDirection * x/length, normalDirection * y/length, normalDirection * z/length);
        
        // Calculate texture coordinates (inverted)
        // s: longitude (0 to 1 around the sphere)
        // t: latitude (0 at north pole, 0.5 at equator, 1 at south pole)
        const s = 1 - (sliceIdx / this.slices);
        const t = 1 - (stackIdx / (2 * this.stacks));
        this.texCoords.push(s, t);
      }
    }
    
    // Generate indices for triangulation
    for (let stackIdx = 0; stackIdx < 2 * this.stacks; stackIdx++) {
      for (let sliceIdx = 0; sliceIdx < this.slices; sliceIdx++) {
        const topLeft = stackIdx * verticesPerParallel + sliceIdx;
        const topRight = topLeft + 1;
        const bottomLeft = (stackIdx + 1) * verticesPerParallel + sliceIdx;
        const bottomRight = bottomLeft + 1;
        
        // Create two triangles for each quad section
        // If inside is true, invert the winding order to see from inside
        if (this.inside) {
          this.indices.push(topRight, bottomLeft, topLeft);
          this.indices.push(topRight, bottomRight, bottomLeft);
        } else {
          this.indices.push(topLeft, bottomLeft, topRight);
          this.indices.push(bottomLeft, bottomRight, topRight);
        }
      }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  /**
   * @method updateTexCoords
   * Updates the texture coordinates
   * @param {Array} coords - Array of texture coordinates
   */
  updateTexCoords(coords) {
    this.texCoords = [...coords];
    this.updateTexCoordsGLBuffers();
  }
}