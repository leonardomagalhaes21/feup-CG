import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyCylinder } from './MyCylinder.js';

export class MyHeli extends CGFobject {
    constructor(scene, 
                cabinTexture, 
                tailTexture, 
                bladeTexture,
                bucketTexture) {
        super(scene);
        this.scene = scene;
        
        // Texturas
        this.cabinTexture = cabinTexture;
        this.tailTexture = tailTexture;
        this.bladeTexture = bladeTexture;
        this.bucketTexture = bucketTexture;
        
        // Posição e orientação
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.orientation = 0;
        
        // Vetor velocidade
        this.velocity = [0, 0, 0];
        
        // Estado do helicóptero
        this.state = 'landed'; // 'landed', 'taking_off', 'flying', 'landing', 'filling_bucket'
        this.bladeRotation = 0;
        this.bladeSpeed = 0;
        this.maxBladeSpeed = Math.PI * 0.5;
        
        // Inclinação
        this.pitchAngle = 0;
        this.maxPitchAngle = Math.PI/12;
        
        // Parâmetros de movimento
        this.cruisingAltitude = 15;
        this.currentAltitude = 0;
        this.verticalSpeed = 0;
        this.maxVerticalSpeed = 0.1;
        
        // Balde
        this.bucketDeployed = true;
        this.bucketFilled = false;
        this.bucketPosition = [0, -2, 0];
        
        this.initComponents();
        this.createMaterials();
    }
    
    initComponents() {
        this.cabin = new MySphere(this.scene, 16, 8, 1, false, 3.0);
        
        this.tail = new MyCylinder(this.scene, 8, 1);

        this.cockpit = new MySphere(this.scene, 16, 16, 1);
        
        this.mainBlade = new MyCylinder(this.scene, 8, 1);
        this.tailBlade = new MyCylinder(this.scene, 8, 1);
        
        
        this.landingGear = new MyCylinder(this.scene, 8, 1);
        
        // Balde de água
        this.bucketBase = new MyCylinder(this.scene, 16, 1); 
        this.bucketRim = new MyCylinder(this.scene, 16, 1);
        this.bucketHandle = new MyCylinder(this.scene, 8, 1); 
    }
    
    createMaterials() {
        // Material da cabine
        this.cabinMaterial = new CGFappearance(this.scene);
        this.cabinMaterial.setAmbient(0.6, 0.6, 0.6, 1.0);
        this.cabinMaterial.setDiffuse(0.8, 0.8, 0.8, 1.0);
        this.cabinMaterial.setSpecular(0.8, 0.8, 0.8, 1.0);
        this.cabinMaterial.setShininess(100);
        if (this.cabinTexture) {
            this.cabinMaterial.setTexture(this.cabinTexture);
            this.cabinMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
            
        // Material para o vidro fumado do cockpit
        this.cockpitGlass = new CGFappearance(this.scene);
        this.cockpitGlass.setAmbient(0.1, 0.1, 0.1, 0.8);
        this.cockpitGlass.setDiffuse(0.1, 0.1, 0.1, 0.5);
        this.cockpitGlass.setSpecular(0.9, 0.9, 0.9, 0.9);
        this.cockpitGlass.setShininess(200); 

        // Material da cauda
        this.tailMaterial = new CGFappearance(this.scene);
        this.tailMaterial.setAmbient(0.5, 0.5, 0.5, 1.0);
        this.tailMaterial.setDiffuse(0.7, 0.7, 0.7, 1.0);
        this.tailMaterial.setSpecular(0.7, 0.7, 0.7, 1.0);
        this.tailMaterial.setShininess(50);
        if (this.tailTexture) {
            this.tailMaterial.setTexture(this.tailTexture);
            this.tailMaterial.setTextureWrap('REPEAT', 'CLAMP_TO_EDGE');
        }
        
        // Material das hélices
        this.bladeMaterial = new CGFappearance(this.scene);
        this.bladeMaterial.setAmbient(0.3, 0.3, 0.3, 1.0);
        this.bladeMaterial.setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.bladeMaterial.setSpecular(0.9, 0.9, 0.9, 1.0);
        this.bladeMaterial.setShininess(120);
        if (this.bladeTexture) {
            this.bladeMaterial.setTexture(this.bladeTexture);
            this.bladeMaterial.setTextureWrap('REPEAT', 'REPEAT');
        }
        
        // Material do pouso
        this.gearMaterial = new CGFappearance(this.scene);
        this.gearMaterial.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.gearMaterial.setDiffuse(0.3, 0.3, 0.3, 1.0);
        this.gearMaterial.setSpecular(0.5, 0.5, 0.5, 1.0);
        this.gearMaterial.setShininess(30);
        
        // Material do balde
        this.bucketMaterial = new CGFappearance(this.scene);
        this.bucketMaterial.setAmbient(0.1, 0.1, 0.1, 1.0);
        this.bucketMaterial.setDiffuse(0.3, 0.3, 0.3, 1.0);
        this.bucketMaterial.setSpecular(0.4, 0.4, 0.4, 1.0);
        this.bucketMaterial.setShininess(30);
        if (this.bucketTexture) {
            this.bucketMaterial.setTexture(this.bucketTexture);
        }
        
        // Material para água no balde
        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setAmbient(0.0, 0.2, 0.4, 0.9);
        this.waterMaterial.setDiffuse(0.0, 0.4, 0.8, 0.9);
        this.waterMaterial.setSpecular(0.2, 0.6, 1.0, 0.9);
        this.waterMaterial.setShininess(120);
    }
    
    update(t, deltaT) {
        this.bladeRotation = (this.bladeRotation + this.bladeSpeed * deltaT / 50) % (2 * Math.PI);
        
        if (this.state === 'flying') {
            this.x += this.velocity[0] * deltaT / 50;
            this.z += this.velocity[2] * deltaT / 50;
            
            const targetPitch = -this.maxPitchAngle * (this.velocity[2] / 0.3);
            
            this.pitchAngle = this.pitchAngle * 0.9 + targetPitch * 0.1;
        } 
        // Transições de estado
        else if (this.state === 'taking_off') {
            if (this.bladeSpeed < this.maxBladeSpeed) {
                this.bladeSpeed += 0.05;
            } else {
                this.verticalSpeed = this.maxVerticalSpeed;
                this.y += this.verticalSpeed * deltaT / 50;
                
                if (this.y > this.cruisingAltitude * 0.3 && !this.bucketDeployed) {
                    this.bucketDeployed = true;
                }
                
                if (this.y >= this.cruisingAltitude) {
                    this.y = this.cruisingAltitude;
                    this.state = 'flying';
                    this.verticalSpeed = 0;
                }
            }
        }
        else if (this.state === 'landing') {
            if (this.y > 0) {
                this.verticalSpeed = -this.maxVerticalSpeed;
                this.y += this.verticalSpeed * deltaT / 50;
                

                if (this.y < this.cruisingAltitude * 0.3 && this.bucketDeployed) {
                    this.bucketDeployed = false;
                }
                
                if (this.y <= 0) {
                    this.y = 0;
                    this.verticalSpeed = 0;
                }
            } else {
                if (this.bladeSpeed > 0) {
                    this.bladeSpeed -= 0.02;
                } else {
                    this.bladeSpeed = 0;
                    this.state = 'landed';
                    
                    this.pitchAngle = 0;
                }
            }
        }
        else if (this.state === 'filling_bucket') {

            if (this.y > 2) {
                this.verticalSpeed = -this.maxVerticalSpeed / 2;
                this.y += this.verticalSpeed * deltaT / 50;
            } else {

                if (!this.bucketFilled) {
                    if (!this.fillStartTime) {
                        this.fillStartTime = t;
                    }
                    
                    if (t - this.fillStartTime > 3000) {
                        this.bucketFilled = true;
                        this.fillStartTime = null;
                        
                        this.state = 'taking_off';
                    }
                }
            }
        }
    }
    
    turn(v) {
        if (this.state === 'flying') {
            // Atualizar a orientação
            this.orientation += v;
            
            this.orientation = this.orientation % (2 * Math.PI);
            
            const speed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            this.velocity[0] = Math.sin(this.orientation) * speed;
            this.velocity[2] = Math.cos(this.orientation) * speed;
        }
    }
    
    accelerate(v) {
        if (this.state === 'flying') {
            let currentSpeed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            let newSpeed = currentSpeed + v;
            
            const maxSpeed = 0.3;
            newSpeed = Math.max(-maxSpeed, Math.min(maxSpeed, newSpeed));
            
            if (currentSpeed === 0 && newSpeed !== 0) {
                this.velocity[0] = Math.sin(this.orientation) * newSpeed;
                this.velocity[2] = Math.cos(this.orientation) * newSpeed;
            } 
            else if (currentSpeed !== 0) {
                const factor = newSpeed / currentSpeed;
                this.velocity[0] *= factor;
                this.velocity[2] *= factor;
            }
        }
    }
    
    takeOff() {
        if (this.state === 'landed') {
            this.state = 'taking_off';
        } else if (this.state === 'filling_bucket' && this.bucketFilled) {
            this.state = 'taking_off';
        }
    }
    
    land() {
        if (this.state === 'flying') {
            const distanceToHeliport = Math.sqrt(
                Math.pow(this.x - (-150), 2) + 
                Math.pow(this.z - (-150), 2)
            );
            
            const isOverHeliport = distanceToHeliport < 20;
            
            if (isOverHeliport) {
                this.state = 'landing';
                this.velocity = [0, 0, 0]; 
                return;
            }
            
            // Verifica se está sobre uma região específica com limites em X e Z
            const minX = -220;
            const maxX = -180;
            const minZ = -120;
            const maxZ = -80;
            const minHeight = 16;
            
            const isInLakeRegion = (
                this.x >= minX && 
                this.x <= maxX && 
                this.z >= minZ && 
                this.z <= maxZ && 
                this.y >= minHeight
            );
            
            if (isInLakeRegion && !this.bucketFilled) {
                console.log("Descendo para encher o balde na área do lago");
                this.state = 'filling_bucket';
                this.velocity = [0, 0, 0];
                return;
            }
            
        }
    }
    
    reset() {
        this.x = -150;  
        this.y = 0;
        this.z = -150;  
        this.orientation = 0;
        this.velocity = [0, 0, 0];
        this.state = 'landed';
        this.bladeRotation = 0;
        this.bladeSpeed = 0;
        this.pitchAngle = 0;
        this.bucketDeployed = false;
        this.bucketFilled = false;
        this.fillStartTime = null;
        
    }
    
    display() {
        this.scene.pushMatrix();
        
        // Posicionar o helicóptero na cena
        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(this.pitchAngle, 1, 0, 0);
        
        // Cabine principal
        this.scene.pushMatrix();
        this.scene.scale(2, 1.5, 3); 
        this.cabinMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();
        
        // Cockpit de vidro fumado
        this.scene.pushMatrix();
        this.scene.translate(0, 0.4, 2.2); 
        this.scene.scale(1.2, 1.0, 1.2); 
        this.scene.rotate(-Math.PI/5, 3, 0, 0); 
        
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        
        // Aplicar material de vidro fumado
        this.cockpitGlass.apply();
        
        this.scene.pushMatrix();
        this.scene.scale(1, 1, 0.5); 
        this.scene.rotate(Math.PI, 0, 1, 0); 
        this.cockpit.display();
        this.scene.popMatrix();
        
        this.scene.gl.disable(this.scene.gl.BLEND);
        
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(1.9, 0, 1.0); 

        // Material para luz vermelha
        const redLight = new CGFappearance(this.scene);
        redLight.setAmbient(0.8, 0.0, 0.0, 1.0);
        redLight.setDiffuse(1.0, 0.0, 0.0, 1.0);
        redLight.setSpecular(1.0, 0.2, 0.2, 1.0);
        redLight.setShininess(200);
        redLight.apply();

        this.scene.scale(0.1, 0.1, 0.1);
        this.cabin.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1.9, 0, 1.0);

        // Material para luz verde
        const greenLight = new CGFappearance(this.scene);
        greenLight.setAmbient(0.0, 0.8, 0.0, 1.0);
        greenLight.setDiffuse(0.0, 1.0, 0.0, 1.0);
        greenLight.setSpecular(0.2, 1.0, 0.2, 1.0);
        greenLight.setShininess(200);
        greenLight.apply();

        this.scene.scale(0.1, 0.1, 0.1);
        this.cabin.display();
        this.scene.popMatrix();

        // Cauda
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -4);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.scene.scale(0.3, 4, 0.3);
        this.tailMaterial.apply();
        this.tail.display();
        this.scene.popMatrix();
        
        // Estabilizador vertical da cauda
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -6); 
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(1, 1, 0.1);
        this.tailMaterial.apply();
        this.cabin.display(); 
        this.scene.popMatrix();
        
        // Hélice principal
        this.scene.pushMatrix();
        this.scene.translate(0, 2, 0);
        this.scene.rotate(this.bladeRotation, 0, 1, 0);
        
        // Pá 1
        this.scene.pushMatrix();
        this.scene.scale(0.2, 0.1, 5);
        this.bladeMaterial.apply();
        this.mainBlade.display();
        this.scene.popMatrix();
        
        // Pá 2 (oposta à Pá 1)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(0.2, 0.1, 5);
        this.bladeMaterial.apply();
        this.mainBlade.display();
        this.scene.popMatrix();
        
        // Pá 3 (perpendicular às Pás 1 e 2)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.2, 0.1, 5);
        this.bladeMaterial.apply();
        this.mainBlade.display();
        this.scene.popMatrix();
        
        // Pá 4 (oposta à Pá 3)
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.scene.scale(0.2, 0.1, 5);
        this.bladeMaterial.apply();
        this.mainBlade.display();
        this.scene.popMatrix();
        
        // Centro da hélice (hub)
        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.3, 0.5);
        this.cabinMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
        
        // Hélice da cauda 
        this.scene.pushMatrix();
        this.scene.translate(0, 1, -7);
        this.scene.rotate(this.bladeRotation * 1.5, 0, 0, 1);
        
        // Pá 1
        this.scene.pushMatrix();
        this.scene.scale(1, 0.1, 0.1);
        this.bladeMaterial.apply();
        this.tailBlade.display();
        this.scene.popMatrix();
        
        // Pá 2 (oposta)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.scene.scale(1, 0.1, 0.1);
        this.bladeMaterial.apply();
        this.tailBlade.display();
        this.scene.popMatrix();
        
        // Pá 3 (perpendicular)
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        this.scene.scale(1, 0.1, 0.1);
        this.bladeMaterial.apply();
        this.tailBlade.display();
        this.scene.popMatrix();
        
        // Pá 4 (oposta à Pá 3)
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0, 0, 1);
        this.scene.scale(1, 0.1, 0.1);
        this.bladeMaterial.apply();
        this.tailBlade.display();
        this.scene.popMatrix();
        
        // Centro da hélice da cauda
        this.scene.pushMatrix();
        this.scene.scale(0.3, 0.3, 0.3);
        this.cabinMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();
        
        this.scene.popMatrix();
        
        

        // Sistema pouso
        this.scene.pushMatrix();
        this.scene.translate(1, -1.8, -2);
        this.scene.rotate(Math.PI/2, 0, 0, 1); 
        this.scene.scale(0.15, 0.15, 3.5);     
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1, -1.8, -2);
        this.scene.rotate(Math.PI/2, 0, 0, 1);
        this.scene.scale(0.15, 0.15, 3.5);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        // Conexões transversais entre as barras principais (frontal)
        this.scene.pushMatrix();
        this.scene.translate(-1, -1.8, 1.2);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 2.05);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        // Conexões transversais entre as barras principais (traseira)
        this.scene.pushMatrix();
        this.scene.translate(-1, -1.8, -1.2);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.scale(0.1, 0.1, 2.05);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        
        // Pés de apoio nas quatro pontas
        this.scene.pushMatrix();
        this.scene.translate(1, -2.0, 1.4);
        this.scene.scale(0.2, 0.1, 0.2);
        this.gearMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1, -2.0, 1.4);
        this.scene.scale(0.2, 0.1, 0.2);
        this.gearMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(1, -2.0, -1.4);
        this.scene.scale(0.2, 0.1, 0.2);
        this.gearMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1, -2.0, -1.4);
        this.scene.scale(0.2, 0.1, 0.2);
        this.gearMaterial.apply();
        this.cabin.display();
        this.scene.popMatrix();

        // Barras diagonais de reforço dianteiras
        this.scene.pushMatrix();
        this.scene.translate(0.6, -1.2, 1.0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.scale(0.08, 1.0, 0.08);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.6, -1.2, 1.0);
        this.scene.rotate(-Math.PI/4, 0, 0, 1); 
        this.scene.scale(0.08, 1.0, 0.08);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        // Barras diagonais de reforço traseiras
        this.scene.pushMatrix();
        this.scene.translate(0.6, -1.2, -1.0);
        this.scene.rotate(Math.PI/4, 0, 0, 1);
        this.scene.scale(0.08, 1.0, 0.08);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-0.6, -1.2, -1.0);
        this.scene.rotate(-Math.PI/4, 0, 0, 1);
        this.scene.scale(0.08, 1.0, 0.08);
        this.gearMaterial.apply();
        this.landingGear.display();
        this.scene.popMatrix();
        
        if (this.bucketDeployed) {
            this.scene.pushMatrix();
            
            // Cabo principal que liga o helicóptero ao balde
            this.scene.pushMatrix();
            this.scene.translate(0, -1.5, 0);
            this.scene.scale(0.08, 2.5, 0.08);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            this.gearMaterial.apply();
            this.landingGear.display();
            this.scene.popMatrix();
            
            // Posicionar o balde na extremidade do cabo
            this.scene.pushMatrix();
            this.scene.translate(0, -4.5, 0);
            
            // Balde - corpo principal
            this.scene.pushMatrix();
            this.scene.scale(0.8, 1.2, 0.8);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            
            if (this.bucketFilled) {
                this.waterMaterial.apply();
            } else {
                // Balde vazio - cor vermelha de bombeiro
                const bucketColor = new CGFappearance(this.scene);
                bucketColor.setAmbient(0.7, 0.2, 0.2, 1.0);
                bucketColor.setDiffuse(0.8, 0.2, 0.2, 1.0);
                bucketColor.setSpecular(0.4, 0.3, 0.3, 1.0);
                bucketColor.setShininess(50);
                
                if (this.bucketTexture) {
                    bucketColor.setTexture(this.bucketTexture);
                }
                
                bucketColor.apply();
            }
            
            this.bucketBase.display();
            this.scene.popMatrix();
            
            // Borda superior do balde
            this.scene.pushMatrix();
            this.scene.translate(0, 0.6, 0);
            this.scene.scale(0.82, 0.1, 0.82);
            this.scene.rotate(Math.PI/2, 1, 0, 0);
            
            // Material para a borda
            const rimColor = new CGFappearance(this.scene);
            rimColor.setAmbient(0.3, 0.1, 0.1, 1.0);
            rimColor.setDiffuse(0.5, 0.15, 0.15, 1.0);
            rimColor.setSpecular(0.2, 0.1, 0.1, 1.0);
            rimColor.setShininess(30);
            rimColor.apply();
            
            this.bucketRim.display();
            this.scene.popMatrix();
            
            // Alças do balde (duas laterais)
            this.scene.pushMatrix();
            
            // Alça 1
            this.scene.pushMatrix();
            this.scene.translate(0.8, 0.4, 0);
            this.scene.rotate(Math.PI/2, 0, 1, 0);
            this.scene.rotate(Math.PI/4, 1, 0, 0);
            this.scene.scale(0.05, 0.6, 0.05);
            
            // Material para as alças
            const handleColor = new CGFappearance(this.scene);
            handleColor.setAmbient(0.4, 0.4, 0.4, 1.0);
            handleColor.setDiffuse(0.6, 0.6, 0.6, 1.0);
            handleColor.setSpecular(0.8, 0.8, 0.8, 1.0);
            handleColor.setShininess(120);
            handleColor.apply();
            
            this.bucketHandle.display();
            this.scene.popMatrix();
            
            // Alça 2
            this.scene.pushMatrix();
            this.scene.translate(-0.8, 0.4, 0);
            this.scene.rotate(-Math.PI/2, 0, 1, 0);
            this.scene.rotate(Math.PI/4, 1, 0, 0);
            this.scene.scale(0.05, 0.6, 0.05);
            handleColor.apply();
            this.bucketHandle.display();
            this.scene.popMatrix();
            
            // Barra horizontal a conectar as alças
            this.scene.pushMatrix();
            this.scene.translate(-1.2, 0.7, 0);
            this.scene.rotate(Math.PI/2, 0, 1, 0);
            this.scene.scale(0.05, 0.05, 2.4);
            handleColor.apply();
            this.bucketHandle.display();
            this.scene.popMatrix();
            
            this.scene.popMatrix();
            
            // Se o balde estiver cheio, desenhar a "água" dentro do balde
            if (this.bucketFilled) {
                this.scene.pushMatrix();
                this.scene.translate(0, 0.4, 0); 
                this.scene.scale(0.75, 0.1, 0.75);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                
                // Material para a água
                const waterSurface = new CGFappearance(this.scene);
                waterSurface.setAmbient(0.0, 0.4, 0.8, 0.8);
                waterSurface.setDiffuse(0.0, 0.5, 0.9, 0.8);
                waterSurface.setSpecular(0.2, 0.7, 1.0, 0.9);
                waterSurface.setShininess(150);
                waterSurface.apply();
                
                this.bucketBase.display();
                this.scene.popMatrix();
            }
            
            this.scene.popMatrix(); 
            
            this.scene.popMatrix(); 
        }
        this.scene.popMatrix();
    }
}