
export default /*glsl*/`
 precision mediump float;

varying vec2 vUv;
varying float vElevation;
varying vec3 vColor;



        void main() {
            float streength = distance(gl_PointCoord, vec2(0.5));
            // streength = 1.0 - step(0.5, streength); // нарисовали круглый диск
            streength *= 2.0;
            streength = 1.0 - streength;
            streength = pow(streength, 1.0);

        vec3 color = mix(vec3(0.0), vColor, streength);

        gl_FragColor = vec4(vec3(color), 1.0);
        }

`;