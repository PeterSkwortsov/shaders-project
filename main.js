import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import fragmentShader from './shaders/fragment.js';
import vertexShader from './shaders/vertex.js';

const gui = new GUI()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);




const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
   


 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 3.5;
const controls = new OrbitControls(camera, renderer.domElement);



const clock = new THREE.Clock();
function animate() {

  
    controls.update();
    renderer.render(scene, camera);

}