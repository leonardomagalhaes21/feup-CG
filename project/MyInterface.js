import { CGFinterface, dat } from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        this.gui = new dat.GUI();
    
        this.gui.add(this.scene, 'speedFactor', 0.1, 3.0).name('Speed Factor');
        
        const heliFolder = this.gui.addFolder('Helicopter Controls');
        this.controls = {
            'W - Forward': 'Move helicopter forward',
            'S - Backward': 'Move helicopter backward',
            'A - Turn Left': 'Turn helicopter left',
            'D - Turn Right': 'Turn helicopter right',
            'R - Reset': 'Reset helicopter position',
            'L - Land/Down': 'Land helicopter / Go down in lake',
            'P - Take Off/Up': 'Take off helicopter / Go up in lake',
            'O - Drop Water': 'Drop water to extinguish fire',
            'C - Camera': 'Switch camera view'
        };
        
        Object.keys(this.controls).forEach(key => {
            const controller = heliFolder.add(this.controls, key).listen();
            controller.domElement.style.pointerEvents = 'none';
            controller.domElement.querySelector('input').readOnly = true;
        });
                
        this.initKeys();
        
        return true;
    }

    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;

        // disable the processKeyboard function
        this.processKeyboard = function () { };

        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }
    processKeyDown(event) {
        // called when a key is pressed down
        // mark it as active in the array
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        // called when a key is released, mark it as inactive in the array
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        // returns true if a key is marked as pressed, false otherwise
        return this.activeKeys[keyCode] || false;
    }

}