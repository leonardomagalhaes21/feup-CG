import { CGFobject } from "../lib/CGF.js";

export class MyObliqueCone extends CGFobject {
    constructor(scene, slices, radius, height, apexOffsetX, apexOffsetZ) {
        super(scene);
        this.slices = Math.max(3, slices); // Minimum 3 slices for a cone
        this.radius = radius;
        this.height = height;
        this.apexX = apexOffsetX;
        this.apexZ = apexOffsetZ;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const angleStep = (2 * Math.PI) / this.slices;

        // --- Vertices ---

        // 1. Apex Vertex
        this.vertices.push(this.apexX, this.height, this.apexZ);
        this.normals.push(0, 0, 0);
        this.texCoords.push(0.5, 1.0);
        const apexVertexGlIndex = 0;

        // 2. Base Disc Vertices (on XZ plane, y=0)
        // 2a. Base Center Vertex
        this.vertices.push(0, 0, 0);
        this.normals.push(0, -1, 0);
        this.texCoords.push(0.5, 0.5);
        const baseCenterGlIndex = 1;

        // 2b. Base Perimeter Vertices (for the flat base disc on XZ plane)
        const baseDiscPerimeterStartGlIndex = 2;
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.radius * Math.cos(angle);
            const z = this.radius * Math.sin(angle);
            this.vertices.push(x, 0, z);
            this.normals.push(0, -1, 0);
            this.texCoords.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle));
        }

        // 3. Side Surface Base Vertices (coincident with 2b, but for side normals/texCoords)
        const sideBaseStartGlIndex = baseDiscPerimeterStartGlIndex + (this.slices + 1);
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.radius * Math.cos(angle);
            const z = this.radius * Math.sin(angle);
            this.vertices.push(x, 0, z);
            this.normals.push(0, 0, 0);
            this.texCoords.push(i / this.slices, 0.0);
        }

        // --- Indices ---

        // Indices for the Base Disc (XZ plane, normal 0,-1,0)
        for (let i = 0; i < this.slices; i++) {
            const p1 = baseCenterGlIndex;
            const p2 = baseDiscPerimeterStartGlIndex + i;
            const p3 = baseDiscPerimeterStartGlIndex + i + 1;
            this.indices.push(p1, p3, p2); 
        }

        // --- Normals Calculation for Sides ---
        const faceNormalsForApex = [];
        // Stores array of face normals for each side base vertex
        const faceNormalsForSideBase = new Array(this.slices + 1).fill(null).map(() => []);

        // Indices for the Side Surface & accumulate face normals
        for (let i = 0; i < this.slices; i++) {
            const vApex = apexVertexGlIndex;
            const vBase1 = sideBaseStartGlIndex + i;
            const vBase2 = sideBaseStartGlIndex + i + 1;

            this.indices.push(vApex, vBase1, vBase2);

            const P_apex = [this.vertices[vApex * 3], this.vertices[vApex * 3 + 1], this.vertices[vApex * 3 + 2]];
            const P_base1 = [this.vertices[vBase1 * 3], this.vertices[vBase1 * 3 + 1], this.vertices[vBase1 * 3 + 2]];
            const P_base2 = [this.vertices[vBase2 * 3], this.vertices[vBase2 * 3 + 1], this.vertices[vBase2 * 3 + 2]];

            const vec_A_B1 = [P_base1[0] - P_apex[0], P_base1[1] - P_apex[1], P_base1[2] - P_apex[2]];
            const vec_A_B2 = [P_base2[0] - P_apex[0], P_base2[1] - P_apex[1], P_base2[2] - P_apex[2]];
            
            let nX = vec_A_B1[1] * vec_A_B2[2] - vec_A_B1[2] * vec_A_B2[1];
            let nY = vec_A_B1[2] * vec_A_B2[0] - vec_A_B1[0] * vec_A_B2[2];
            let nZ = vec_A_B1[0] * vec_A_B2[1] - vec_A_B1[1] * vec_A_B2[0];

            const len = Math.sqrt(nX * nX + nY * nY + nZ * nZ);
            if (len > 0) {
                nX /= len; nY /= len; nZ /= len;
            }
            const faceNormal = [nX, nY, nZ];

            faceNormalsForApex.push(faceNormal);
            faceNormalsForSideBase[i].push(faceNormal);
            faceNormalsForSideBase[i + 1].push(faceNormal);
        }

        // Calculate and Set Apex Normal
        let avgApexNX = 0, avgApexNY = 0, avgApexNZ = 0;
        for (const fn of faceNormalsForApex) {
            avgApexNX += fn[0]; avgApexNY += fn[1]; avgApexNZ += fn[2];
        }
        const apexNormLen = Math.sqrt(avgApexNX * avgApexNX + avgApexNY * avgApexNY + avgApexNZ * avgApexNZ);
        if (apexNormLen > 0) {
            this.normals[apexVertexGlIndex * 3 + 0] = avgApexNX / apexNormLen;
            this.normals[apexVertexGlIndex * 3 + 1] = avgApexNY / apexNormLen;
            this.normals[apexVertexGlIndex * 3 + 2] = avgApexNZ / apexNormLen;
        } else {
            this.normals[apexVertexGlIndex * 3 + 1] = 1; // Default up along Y
        }

        // Calculate and Set Side Base Vertex Normals
        for (let i = 0; i <= this.slices; i++) {
            let avgSideNX = 0, avgSideNY = 0, avgSideNZ = 0;
            const normalsToAvg = faceNormalsForSideBase[i];
            for (const fn of normalsToAvg) {
                avgSideNX += fn[0]; avgSideNY += fn[1]; avgSideNZ += fn[2];
            }
            
            // Average before normalizing
            const numFaces = normalsToAvg.length;
            if (numFaces > 0) {
                 avgSideNX /= numFaces; avgSideNY /= numFaces; avgSideNZ /= numFaces;
            }

            const sideNormLen = Math.sqrt(avgSideNX * avgSideNX + avgSideNY * avgSideNY + avgSideNZ * avgSideNZ);
            const currentVIndex = sideBaseStartGlIndex + i;
            if (sideNormLen > 0) {
                this.normals[currentVIndex * 3 + 0] = avgSideNX / sideNormLen;
                this.normals[currentVIndex * 3 + 1] = avgSideNY / sideNormLen;
                this.normals[currentVIndex * 3 + 2] = avgSideNZ / sideNormLen;
            } else {
                 // Fallback, e.g. if apex is directly above the vertex.
                const vertX = this.vertices[currentVIndex * 3 + 0];
                const vertZ = this.vertices[currentVIndex * 3 + 2];
                const fallbackNX = vertX - this.apexX;
                const fallbackNY = 0 - this.height;
                const fallbackNZ = vertZ - this.apexZ;
                
                const fallbackLen = Math.sqrt(fallbackNX*fallbackNX + fallbackNY*fallbackNY + fallbackNZ*fallbackNZ);
                if (fallbackLen > 0) {
                    this.normals[currentVIndex * 3 + 0] = fallbackNX/fallbackLen;
                    this.normals[currentVIndex * 3 + 1] = fallbackNY/fallbackLen;
                    this.normals[currentVIndex * 3 + 2] = fallbackNZ/fallbackLen;
                } else {
                    this.normals[currentVIndex * 3 + 1] = 1;
                }
            }
        }
        
        // Ensure smooth seam for side base vertices
        const n0_x = this.normals[(sideBaseStartGlIndex + 0) * 3 + 0];
        const n0_y = this.normals[(sideBaseStartGlIndex + 0) * 3 + 1];
        const n0_z = this.normals[(sideBaseStartGlIndex + 0) * 3 + 2];
        const ns_x = this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 0];
        const ns_y = this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 1];
        const ns_z = this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 2];

        const avgSeamX = (n0_x + ns_x) / 2.0;
        const avgSeamY = (n0_y + ns_y) / 2.0;
        const avgSeamZ = (n0_z + ns_z) / 2.0;
        const seamLen = Math.sqrt(avgSeamX * avgSeamX + avgSeamY * avgSeamY + avgSeamZ * avgSeamZ);

        if (seamLen > 0) {
            const finalSeamNX = avgSeamX / seamLen;
            const finalSeamNY = avgSeamY / seamLen;
            const finalSeamNZ = avgSeamZ / seamLen;
            this.normals[(sideBaseStartGlIndex + 0) * 3 + 0] = finalSeamNX;
            this.normals[(sideBaseStartGlIndex + 0) * 3 + 1] = finalSeamNY;
            this.normals[(sideBaseStartGlIndex + 0) * 3 + 2] = finalSeamNZ;
            this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 0] = finalSeamNX;
            this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 1] = finalSeamNY;
            this.normals[(sideBaseStartGlIndex + this.slices) * 3 + 2] = finalSeamNZ;
        }


        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
