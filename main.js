import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'


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

const updateAllMaterial = () => {
    scene.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
            child.scale.set(1, 1, 1)


        }
    })
}

const cubeRendererTarget = new THREE.WebGLRenderTarget(256,
    {
        type: THREE.HalfFloatType
    }
)


scene.environment = cubeRendererTarget.texture
// scene.background = environmentMap
// scene.environment = environmentMap

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
ambientLight.visible = true
scene.add(ambientLight)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2.3, 10)

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



const mapTexture = textureLoader.load('lpshead/color.jpg')
mapTexture.colorSpace = THREE.SRGBColorSpace
const normalTexture = textureLoader.load('lpshead/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture
})

const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

const customUniforms = {
    uTime: { value: 0 }
}



material.onBeforeCompile = (shader) => {

    shader.uniforms.uTime = customUniforms.uTime

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>

            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
            #include <beginnormal_vertex>

            float angle = (sin(position.y + uTime * 0.5)) * 0.9;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            objectNormal.xz = rotateMatrix * objectNormal.xz;


        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>
            
            angle = (position.y + uTime * 0.5) * 0.9;

            transformed.xz = rotateMatrix * transformed.xz;
        `
    )

}

depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
            #include <common>

            uniform float uTime;

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
            #include <begin_vertex>

            float angle = (sin(position.y + uTime * 0.5)) * 0.4;
            mat2 rotateMatrix = get2dRotateMatrix(angle); 
            
            transformed.xz = rotateMatrix * transformed.xz;
        `
    )

}



global.envMapIntensity = scene.environmentIntensity



scene.environmentIntensity = 1

gltfLoader.load('lpshead/LeePerrySmith.glb', (gltf) => {
    const mesh = gltf.scene.children[0]
    // mesh.rotation.y = Math.PI * 0.5
    mesh.material = material
    mesh.customDepthMaterial = depthMaterial
    scene.add(mesh)

    // Update materials
    updateAllMaterial()
})

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.rotation.y = Math.PI
plane.position.y = - 5
plane.position.z = 5
scene.add(plane)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)


renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





const clock = new THREE.Clock()
function animate() {
    const elapsedTime = clock.getElapsedTime()

    customUniforms.uTime.value = elapsedTime

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)

}


animate()