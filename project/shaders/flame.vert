attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;
uniform float flamePhase;
uniform float swayMagnitude;
uniform float frequency;
uniform float horizontalFactor;
uniform float verticalFactor;

varying vec2 vTextureCoord;

void main() {
    vec3 position = aVertexPosition;
    
    float heightFactor = aVertexPosition.y;
    
    float waveFactor = sin(timeFactor * 0.0008 * frequency + flamePhase);
    position.x += waveFactor * swayMagnitude * horizontalFactor * heightFactor;
    
    float heightWave = sin(timeFactor * 0.0006 * frequency + flamePhase * 1.3);
    
    // Se for o vértice superior
    if (aVertexPosition.y > 0.9) {
        position.y += heightWave * 0.15 * verticalFactor;
    }
    
    if (aVertexPosition.x < -0.2) {
        position.x += sin(timeFactor * 0.001 + flamePhase) * 0.08 * heightFactor;
    } 
    else if (aVertexPosition.x > 0.2) {
        position.x += sin(timeFactor * 0.001 + flamePhase + 1.5) * 0.08 * heightFactor;
    }
    
    position.z += cos(timeFactor * 0.0007 + flamePhase) * 0.05 * heightFactor;
    
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    
    vTextureCoord = aTextureCoord;
}