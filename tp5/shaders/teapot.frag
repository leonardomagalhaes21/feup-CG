#ifdef GL_ES
precision highp float;
#endif

varying vec4 vPos;

void main() {
    vec4 pos = vPos *0.5 + 0.5;
    if(pos.y >= 0.5) {
        gl_FragColor =  vec4(1.0, 1.0, 0.0, 1.0);
    } else {
        gl_FragColor =  vec4(0.5, 0.5, 1.0, 1.0);
    }
}