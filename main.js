import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import vertex from './shaders/vertex.js'
import fragment from './shaders/fragment.js'

const scene = new THREE.Scene()


const gui = new GUI()
const global = {}

const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()


rgbeLoader.load('my-hdri-cart2.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    environmentMap.colorSpace = THREE.SRGBColorSpace

    scene.background = environmentMap


})

const cubeRendererTarget = new THREE.WebGLRenderTarget(256,
    {
        type: THREE.HalfFloatType
    }
)

scene.environment = cubeRendererTarget.texture

const materialParametrs = {};
materialParametrs.color = '#70c1ff';

const material = new THREE.ShaderMaterial(
    {
        vertexShader: vertex,
        fragmentShader: fragment,

        uniforms: {
            uTime: new THREE.Uniform(0),
            uColor: new THREE.Uniform(new THREE.Color('red')),
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }
)

gui
.addColor(materialParametrs, 'color')
.onChange(() => 
{
    material.uniforms.uColor.value.set(materialParametrs.color)
})

const sphery = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 32, 16),
    material
)
sphery.position.x = -3
scene.add(sphery)

const tourusKnotGeometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128,32)

const tourusKnot = new THREE.Mesh(tourusKnotGeometry, material)
scene.add(tourusKnot)

let suzanna = null;
gltfLoader.load('lpshead/burger.glb',
    (gltf) => {
        suzanna = gltf.scene
        suzanna.scale.set(0.8, 0.8, 0.8)
        suzanna.position.set(3.5, -1)
        suzanna.traverse((child) => {
            if(child.isMesh)
                child.material = material
        })
        scene.add(suzanna)
    }


)


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap









renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





const clock = new THREE.Clock()
function animate() {
    const elapsedTime = clock.getElapsedTime()
    tourusKnot.rotation.x = elapsedTime * 0.2
    tourusKnot.rotation.y = elapsedTime * 0.2
    
    material.uniforms.uTime.value = elapsedTime
    // sphery.rotation.x = elapsedTime * 0.2

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)

}


animate()