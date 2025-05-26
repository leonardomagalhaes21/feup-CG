#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float timeFactor;
uniform float colorVariation;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    
    float flicker = 0.9 + sin(timeFactor * 0.003) * 0.1 * colorVariation;
    
    vec3 enhancedColor = texColor.rgb;
    enhancedColor.r *= 1.0 + 0.1 * flicker;     
    enhancedColor.g *= 1.0 + 0.05 * flicker;    
    
    // Combinar a cor original com um leve brilho
    float heightFactor = vTextureCoord.y * 0.2;
    vec3 highlight = vec3(1.0, 0.9, 0.6) * heightFactor * flicker;
    
    // 80% cor original, 20% realce
    vec3 finalColor = mix(enhancedColor, enhancedColor + highlight, 0.2);
    
    gl_FragColor = vec4(finalColor, texColor.a);
}