
export default /*glsl*/`
 precision mediump float;

varying vec2 vUv;
varying float vElevation;

uniform vec3 udDephColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;


        void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(udDephColor, uSurfaceColor, mixStrength);
    gl_FragColor = vec4(color, 1.0);

        }

`;