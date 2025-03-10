import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import g, { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import fragmentShader from './shaders/fragment.js';
import vertexShader from './shaders/vertex.js';

const gui = new GUI()
const debugObject = {}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(5, 5, 500, 500);

debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';



const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) }, // вектор 2 означает направление по - x, y
        uBigWavesSpeed: { value: 0.5 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3.0 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 3.0 },


        udDephColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5.0 },


    }
 });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = Math.PI * 0.5;
scene.add(mesh);

camera.position.z = 3;
camera.position.y = 3;
const controls = new OrbitControls(camera, renderer.domElement);

gui.add(mesh.material.uniforms.uBigWavesElevation, 'value').min(0).max(2).step(0.01).name('высота волны');
gui.add(mesh.material.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.01).name('частота волны по x');
gui.add(mesh.material.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.01).name('частота волны по y');
gui.add(mesh.material.uniforms.uBigWavesSpeed, 'value').min(0).max(5).step(0.01).name('скорость волны');


gui.addColor(debugObject, 'depthColor').name('цвет глубины').onChange(() => {
    mesh.material.uniforms.udDephColor.value.set(debugObject.depthColor);
})
gui.addColor(debugObject, 'surfaceColor').name('цвет поверхности').onChange(() => {
    mesh.material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
})
gui.add(mesh.material.uniforms.uColorOffset, 'value').min(0).max(5).step(0.01).name('смещение цвета');
gui.add(mesh.material.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.01).name('множитель цвета');
gui.add(mesh.material.uniforms.uSmallWavesElevation, 'value').min(0).max(2).step(0.01).name('высота волны');
gui.add(mesh.material.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.01).name('частота волны');
gui.add(mesh.material.uniforms.uSmallWavesSpeed, 'value').min(0).max(5).step(0.01).name('скорость волны');
gui.add(mesh.material.uniforms.uSmallWavesIterations, 'value').min(0).max(5).step(1.0).name('количество волны');


const clock = new THREE.Clock();
function animate() {

    const elapsedTime = clock.getElapsedTime();

    mesh.material.uniforms.uTime.value = elapsedTime;
    controls.update();
    renderer.render(scene, camera);

}