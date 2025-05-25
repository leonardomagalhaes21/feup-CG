#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform float uBlendFactor;

void main() {
    vec4 baseColor = texture2D(uSampler, vTextureCoord);
    vec4 altColor = texture2D(uSampler2, vTextureCoord);
    
    // Mix the two textures based on blend factor
    gl_FragColor = mix(baseColor, altColor, uBlendFactor);
}
