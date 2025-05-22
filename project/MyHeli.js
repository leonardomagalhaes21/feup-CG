import { CGFobject, CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MySphere } from './MySphere.js';
import { MyCylinder } from './MyCylinder.js';
import { MyBucket } from './MyBucket.js';

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
        this.maxBladeSpeed = Math.PI * 0.2;
        this.lastSpeedFactor = 1.0; // Track speed factor changes
        
        // Inclinação
        this.pitchAngle = 0;
        this.maxPitchAngle = Math.PI/12;
        
        // Parâmetros de movimento
        this.cruisingAltitude = -12;
        this.currentAltitude = 0;
        this.verticalSpeed = 0;
        this.maxVerticalSpeed = 0.1;
        
        // Balde
        this.showBucket = true;
        this.bucketDeployed = true;
        this.bucketFilled = false;
        this.bucketPosition = [0, -2, 0];
        this.waterDropHeight = 0; // Para animar a queda da água
        this.isWaterDropping = false;
        this.waterDropTime = 0;
        this.waterDropDuration = 2000; // 2 segundos para queda da água
        
        // Referência para objetos da cena para interação
        this.lake = null;
        this.fire = null;
        this.fireStation = null;
        
        this.initComponents();
        this.createMaterials();
    }

    isOverLake() {
        if (!this.lake) return false;
        return this.lake.isOverLake(this.x, this.z);
    }
    
    isOverHeliport() {
        if (!this.fireStation) return false;
        return this.fireStation.isOverHeliport(this.x, this.z);
    }
    
    // Adicione este método para verificar se o helicóptero está sobre o fogo
    isOverFire() {
        if (!this.fire) return false;
        
        // Verificar se está na proximidade do fogo (ajuste conforme necessário)
        const dx = this.x - this.fire.x;
        const dz = this.z - this.fire.z;
        const distance = Math.sqrt(dx*dx + dz*dz);
        
        return distance < this.fire.baseRadius * 1.2;
    }
    
    initComponents() {
        this.cabin = new MySphere(this.scene, 16, 8, 1, false, 3.0);
        
        this.tail = new MyCylinder(this.scene, 8, 1);

        this.cockpit = new MySphere(this.scene, 16, 16, 1);
        
        this.mainBlade = new MyCylinder(this.scene, 8, 1);
        this.tailBlade = new MyCylinder(this.scene, 8, 1);
        
        
        this.landingGear = new MyCylinder(this.scene, 8, 1);
        
        // Balde de água
        this.bucketBase = new MyBucket(this.scene, 16, 1); 
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
        // Atualizar rotação das hélices
        this.bladeRotation = (this.bladeRotation + this.bladeSpeed * deltaT / 50) % (2 * Math.PI);
        
        // Check for speed factor changes
        const currentSpeedFactor = this.scene.speedFactor || 1.0;
        if (this.lastSpeedFactor !== currentSpeedFactor && this.state === 'flying') {
            const speed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            if (speed > 0) {
                // Calculate new speed based on ratio of speed factors, maintaining direction
                const scaleFactor = currentSpeedFactor / this.lastSpeedFactor;
                this.velocity[0] *= scaleFactor;
                this.velocity[2] *= scaleFactor;
                
                // Ensure we don't exceed the new max speed
                const newSpeed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
                const maxSpeed = 0.3 * currentSpeedFactor;
                if (newSpeed > maxSpeed) {
                    const adjustFactor = maxSpeed / newSpeed;
                    this.velocity[0] *= adjustFactor;
                    this.velocity[2] *= adjustFactor;
                }
            }
            this.lastSpeedFactor = currentSpeedFactor;
        }
        
        if (this.state !== 'landed') {
            this.bladeSpeed = Math.min(this.bladeSpeed + 0.01, this.maxBladeSpeed);
        } else {
            this.bladeSpeed = Math.max(0, this.bladeSpeed - 0.01);
            this.y = -16; // Manter a altura do helicóptero no heliporto
            this.setShowBucket(false);
        }
        
        // Implementar movimento conforme o estado
        if (this.state === 'flying') {
            this.x += this.velocity[0] * deltaT / 50;
            this.z += this.velocity[2] * deltaT / 50;
            
            // Ajustar inclinação com base na velocidade
            const speed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            const speedFactor = this.scene.speedFactor || 1.0;
            const maxSpeed = 0.3 * speedFactor;
            const targetPitch = -this.maxPitchAngle * (speed / maxSpeed); 
            this.pitchAngle = 0.9 * this.pitchAngle + 0.1 * targetPitch;
            
   
        } 
        else if (this.state === 'taking_off') {
            // Acelerar as hélices
            if (this.bladeSpeed < this.maxBladeSpeed * 0.9) {
                return;
            }
            
            // Subir até altitude de cruzeiro
            if (this.y < this.cruisingAltitude) {
                this.y += 0.1 * deltaT / 50;
            } else {
                this.state = 'flying';
                this.showBucket = true;
            }
        }
        else if (this.state === 'landing') {
            // Desacelerar
            this.velocity = [0, 0, 0];
            this.showBucket = false;
            
            // Descer lentamente
            if (this.y > -16) {
                this.y -= 0.1 * deltaT / 50;
            } else {
                // Tocou o solo
                this.y = -16;
                this.state = 'landed';
            }
            
            this.pitchAngle *= 0.9; 
        }
        else if (this.state === 'filling_bucket') {
            // Desacelerar totalmente
            this.velocity = [0, 0, 0];
            
            // Descer lentamente até o nível da água
            if (this.y > -25) {
                this.y -= 0.1 * deltaT / 50;
            } else {
                // Chegou próximo à água
                this.y = -25; 
                this.bucketFilled = true;
            }
        }
        else if (this.state === 'dropping_water') {
            // Desacelerar
            this.velocity = [0, 0, 0];
            
            // Temporizador para simulação da queda da água
            if (!this.waterDropTime) {
                this.waterDropTime = t;
            }
            
            // Calcular progresso da animação
            const elapsed = t - this.waterDropTime;
            const progress = Math.min(elapsed / this.waterDropDuration, 1.0);
            
            // Animar queda da água - calculando distância até o solo
            // Considerar a altura atual do helicóptero para determinar a altura da coluna de água
            const groundDistance = Math.abs(this.y); // Distância aproximada até o chão
            this.waterDropHeight = progress * groundDistance; 
            this.isWaterDropping = true;
            
            // Apagar o fogo quando a água chegar aproximadamente na metade do caminho
            if (progress >= 0.5 && this.fire && this.fire.active) {
                this.fire.extinguish();
            }
            
            // Finalizar o estado de queda
            if (progress >= 1.0) {
                this.isWaterDropping = false;
                this.bucketFilled = false;
                this.bucketBase.setShowWater(false);
                this.waterDropTime = 0;
                this.state = 'flying';
                this.setShowBucket(true);
            }
        }
    }
    
    
    
    
    dropWater() {
        if (this.state === 'flying' && this.bucketFilled) {
            if (this.isOverFire()) {
                this.state = 'dropping_water';
                this.isWaterDropping = true;
                this.waterDropTime = 0;
            }
        }
    }
    
    turn(v) {
        if (this.state === 'flying') {
            // Update orientation
            this.orientation += v;
            this.orientation = this.orientation % (2 * Math.PI);
    
            const speed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            this.velocity[0] = Math.sin(this.orientation) * speed;
            this.velocity[2] = Math.cos(this.orientation) * speed;
    
            // Activate red light when turning left, green light when turning right
            if (v < 0) {
                this.redLightActive = false;
                this.greenLightActive = true;
            } else if (v > 0) {
                this.redLightActive = true;
                this.greenLightActive = false;
            }
            else {
                this.redLightActive = false;
                this.greenLightActive = false;
            }
        }
    }

    
    accelerate(v) {
        if (this.state === 'flying') {
            let currentSpeed = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[2] * this.velocity[2]);
            let newSpeed = currentSpeed + v;
            
            // Get speedFactor from scene and apply it to maxSpeed
            const speedFactor = this.scene.speedFactor || 1.0;
            const maxSpeed = 0.3 * speedFactor;
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
        if (this.state === 'landed' || this.state === 'filling_bucket') {
            this.state = 'taking_off';
        }
    }
    
    /**
     * Inicia o pouso do helicóptero ou a coleta de água do lago
     */
    land() {
        if (this.state === 'flying') {
            // Se estiver sobre o lago e o balde não estiver cheio, encher o balde
            if (this.isOverLake() && !this.isMoving()) {
                if (!this.bucketFilled) {
                    this.state = 'filling_bucket';
                    this.velocity = [0, 0, 0]; 
                } else {
                    console.log("O balde já está cheio!");
                }
            }
            
            if (this.isOverHeliport() && !this.isMoving()) {
                this.state = 'landing';
                this.velocity = [0, 0, 0]; 
            }
        }
    }    
    
    isMoving() {
        return Math.abs(this.velocity[0]) > 0.03 || Math.abs(this.velocity[2]) > 0.03;
    }

    setShowBucket(show) {
        this.showBucket = show;
    }

    /**
     * Verifica se o helicóptero está sobre o lago
     * @returns {Boolean} - true se o helicóptero estiver sobre o lago
     */
    isOverLake() {
        if (!this.lake) return false;
        return this.lake.isOverLake(this.x, this.z);
    }

    /**
     * Verifica se o helicóptero está sobre o fogo
     * @returns {Boolean} - true se o helicóptero estiver sobre o fogo
     */
    isOverFire() {
        if (!this.fire) return false;
        
        // Verificar se está na proximidade do fogo
        const dx = this.x - this.fire.x;
        const dz = this.z - this.fire.z;
        const distance = Math.sqrt(dx*dx + dz*dz);
        
        return distance < this.fire.baseRadius * 1.2;
    }
        
    reset() {
        this.x = -150;  
        this.y = -16;
        this.z = -250;  
        this.orientation = 0;
        this.velocity = [0, 0, 0];
        this.state = 'landed';
        this.bladeRotation = 0;
        this.bladeSpeed = 0;
        this.pitchAngle = 0;
        this.showBucket = false;
        this.bucketDeployed = true;
        this.bucketFilled = false;
        this.bucketBase.setShowWater(false);
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
        redLight.setAmbient(this.redLightActive ? 1.0 : 0.2, 0.0, 0.0, 1.0);
        redLight.setDiffuse(this.redLightActive ? 1.0 : 0.2, 0.0, 0.0, 1.0);
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
        greenLight.setAmbient(0.0, this.greenLightActive ? 1.0 : 0.2, 0.0, 1.0);
        greenLight.setDiffuse(0.0, this.greenLightActive ? 1.0 : 0.2, 0.0, 1.0);
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
        if (this.showBucket && this.bucketDeployed) {
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
                this.bucketBase.setShowWater(true);
            }
            
            // Se estiver despejando água, mostrar a animação
            if (this.isWaterDropping) {
                this.scene.pushMatrix();
                
                // Configurar transparência para água caindo
                this.scene.gl.enable(this.scene.gl.BLEND);
                this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
                
                // Material da água
                this.waterMaterial.apply();
                
                // Desenhar "coluna" de água caindo
                this.scene.pushMatrix();
                // Posicionar a coluna de água abaixo do balde
                this.scene.translate(0, -0.6, 0); // Posição inicial embaixo do balde
                this.scene.scale(0.7, 0.7, this.waterDropHeight);
                this.bucketBase.display(); // Usar cilindro como coluna de água
                this.scene.popMatrix();
                
                // Desenhar "splash" no final da coluna de água
                if (this.waterDropHeight > 10) {
                    const splashScale = (this.waterDropHeight - 10) / 10;
                    this.scene.pushMatrix();
                    const groundDistance = Math.abs(this.y) - 4.5; // Distância até o solo a partir do balde
                    this.scene.translate(0, -groundDistance, 0); // Colocar o splash no chão
                    this.scene.scale(2 * splashScale, 0.1, 2 * splashScale);
                    this.scene.rotate(Math.PI/2, 1, 0, 0);
                    this.bucketBase.display();
                    this.scene.popMatrix();
                }
                
                this.scene.gl.disable(this.scene.gl.BLEND);
                
                this.scene.popMatrix();
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
            
            this.scene.popMatrix(); 
            
            this.scene.popMatrix(); 
        }
        this.scene.popMatrix();
    }
}