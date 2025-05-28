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
uniform float windDirection;
uniform float windStrength;

varying vec2 vTextureCoord;
varying float vHeight;

void main() {
    vec3 position = aVertexPosition;
    
    if (aVertexPosition.y > 0.9) {

        float topSwayX = sin(timeFactor * 0.015 * frequency + flamePhase) * swayMagnitude * 2.0;
        float topFastSwayX = sin(timeFactor * 0.035 * frequency + flamePhase * 1.7) * swayMagnitude * 1.0;
        float topFlickerX = sin(timeFactor * 0.07 * frequency + flamePhase * 2.5) * 0.3;
        
        float combinedSway = topSwayX * 0.6 + topFastSwayX * 0.3 + topFlickerX * 0.1;
        

        float windOffset = windDirection * windStrength * 0.3;
        
        float limitedSway = (combinedSway + windOffset) * horizontalFactor * 0.5;
        
        position.x += limitedSway;
        
        float windVerticalFactor = 1.0 - abs(windDirection) * windStrength * 0.2;
        float topWaveY1 = sin(timeFactor * 0.02 * frequency + flamePhase * 1.3) * 0.25 * windVerticalFactor;
        float topWaveY2 = sin(timeFactor * 0.012 * frequency + flamePhase * 0.7) * 0.15 * windVerticalFactor;
        float combinedWaveY = topWaveY1 * 0.6 + topWaveY2 * 0.4;
        
        position.y += combinedWaveY * verticalFactor * 2.5;
    }
    else if (aVertexPosition.y > 0.0) {
        float heightFactor = aVertexPosition.y * aVertexPosition.y;
        
        float midSwayX1 = sin(timeFactor * 0.012 * frequency + flamePhase) * swayMagnitude * 1.0;
        float midSwayX2 = sin(timeFactor * 0.025 * frequency + flamePhase * 1.5) * swayMagnitude * 0.5;
        float combinedMidSway = midSwayX1 * 0.7 + midSwayX2 * 0.3;
        
        float midWindOffset = windDirection * windStrength * 0.2 * heightFactor;
        
        float limitedMidSway = (combinedMidSway + midWindOffset) * horizontalFactor * 0.5 * heightFactor;
        
        position.x += limitedMidSway;
        
        float windVerticalMidFactor = 1.0 - abs(windDirection) * windStrength * 0.15 * heightFactor;
        float midWaveY = sin(timeFactor * 0.018 * frequency + flamePhase * 0.8) * 0.15 * windVerticalMidFactor;
        position.y += midWaveY * verticalFactor * heightFactor;
    }
    
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    
    vTextureCoord = aTextureCoord;
    vHeight = aVertexPosition.y;
}