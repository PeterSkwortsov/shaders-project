import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'


const gui = new GUI()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load('flag.jpg');

const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);

const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);

for (let i = 0; i < count; i++) {   
    randoms[i] = Math.random();
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

const material = new THREE.RawShaderMaterial({
    vertexShader: `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    uniform vec2 uFrequency;
    uniform float uTime;

    attribute vec3 position;
    attribute float aRandom; 
    attribute vec2 uv; 

    varying vec2 vUv;
    varying float vElevation;
    varying float vRandom;
    
        void main()
        {
        
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
        elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

        modelPosition.z += elevation;

        modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1 ;
        modelPosition.z += sin(modelPosition.y * uFrequency.y  - uTime) * 0.1;


        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;
        vUv = uv;
        vElevation = elevation;
    }`,
    fragmentShader: `
    precision mediump float;
    uniform vec3 uColor;
        
    varying float vRandom;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vElevation;

        void main() {
            vec4 textureColor = texture2D(uTexture, vUv);
            textureColor.rgb += vElevation * 4.5 + 0.1;
            gl_FragColor = textureColor;
        }`,
    uniforms: {
        uFrequency: { value: new THREE.Vector2(10,5)},
        uTime: { value: 0},
        uColor: { value: new THREE.Color('orange')},
        uTexture: { value: flagTexture}
    },
    side: THREE.DoubleSide,
    wireframe: false



 });
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

camera.position.z = 3.5;
const controls = new OrbitControls(camera, renderer.domElement);

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(50).step(0.1).name('Частота X');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(50).step(0.1).name('Частота Y');



const clock = new THREE.Clock();
function animate() {

   const elepsedTime = clock.getElapsedTime();

    material.uniforms.uTime.value = elepsedTime;

    controls.update();
    renderer.render(scene, camera);

}