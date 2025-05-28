#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying float vHeight;

uniform sampler2D uSampler;
uniform float timeFactor;
uniform float colorVariation;

void main() {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    
    float flicker = 0.95 + sin(timeFactor * 0.003 + vTextureCoord.y * 2.0) * 0.05 * colorVariation;
    
    vec3 finalColor = texColor.rgb * flicker;
    
    if (vTextureCoord.y > 0.7) {
        float glow = (vTextureCoord.y - 0.7) / 0.3 * 0.15 * sin(timeFactor * 0.002);
        finalColor += vec3(glow, glow * 0.7, glow * 0.3);
    }
    
    gl_FragColor = vec4(finalColor, texColor.a);
}