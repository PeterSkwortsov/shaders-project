import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import vertex from './shaders/vertex.js'
import fragment from './shaders/fragment.js'
import gsap from 'gsap'
import { Sky } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()


const gui = new GUI(
    {
        width: 350
    }
)
const global = {}

const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()



const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)

const textures = [
    textureLoader.load('lpshead/particles/1.png'),
    textureLoader.load('lpshead/particles/2.png'),
    textureLoader.load('lpshead/particles/3.png'),
    textureLoader.load('lpshead/particles/4.png'),
    textureLoader.load('lpshead/particles/5.png'),
    textureLoader.load('lpshead/particles/6.png'),
    textureLoader.load('lpshead/particles/7.png'),
    textureLoader.load('lpshead/particles/8.png'),
]

const createFierwerk = (count, position, size, texture, radius, color) => 
{
    const positionsArray = new Float32Array(count * 3)
    const sizesArray = new Float32Array(count)
    const timeMultiplaerArray = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        const i3 = i * 3

        const spherical = new THREE.Spherical(
            radius * (0.75 + Math.random()* 0.25),
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2
        )
        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)

        positionsArray[i3] = position.x
        positionsArray[i3 + 1] = position.y
        positionsArray[i3 + 2] = position.z
  

        sizesArray[i] = Math.random()
        timeMultiplaerArray[i] = 1 + Math.random()
    }
    const geometry = new THREE.BufferGeometry()
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3))
    
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(positionsArray, 1))

    geometry.setAttribute('aTimeMultiplaer', new THREE.Float32BufferAttribute(positionsArray, 1))

    texture.flipY = false

    const material = new THREE.ShaderMaterial({ 
        vertexShader: vertex,
        fragmentShader: fragment,

        uniforms: {
            uSize: new THREE.Uniform(size), 
            uResolution: new THREE.Uniform(sizes.resolution),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform(color),
            uProgress: new THREE.Uniform(0)
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
        

     })

    const fierwerk = new THREE.Points(geometry, material)
    fierwerk.position.copy(position)
    scene.add(fierwerk)

     const destroyFierwerk = () => {
        fierwerk.geometry.dispose()
        fierwerk.material.dispose()
        scene.remove(fierwerk)
    }  // уничтожение 

    gsap.to(
        material.uniforms.uProgress,
        {
            value: 1,
            duration: 3,
            ease: 'linear',
            onComplete: destroyFierwerk,
        }
    )
}

const createRandomFirework = () => {
    const count = Math.round(400 + Math.random() * 1000)
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
    )
    const size = 0.1 + Math.random() * 0.1
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()
    const color = new THREE.Color()
    color.setHSL(Math.random(), 1, 0.7)
    createFierwerk(count, position, size, texture, radius, color)
}



const sky = new Sky()
sky.scale.setScalar(450000)
scene.add(sky)

const sun = new THREE.Vector3()

const skyParameters = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.95,
    elevation: -2.2,
    azimuth: 180,
    // exposure: renderer.toneMappingExposure
}

const updateSky = () => {
    const uniforms = sky.material.uniforms
    uniforms['turbidity'].value = skyParameters.turbidity
    uniforms['rayleigh'].value = skyParameters.rayleigh
    uniforms['mieCoefficient'].value = skyParameters.mieCoefficient
    uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG

    const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation)
    const theta = THREE.MathUtils.degToRad(skyParameters.azimuth)

    sun.setFromSphericalCoords(1, phi, theta)

    uniforms['sunPosition'].value.copy(sun)

    // renderer.toneMappingExposure = skyParameters.exposure
    // renderer.render(scene, camera)
}

gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky)
gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky)
gui.add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSky)
gui.add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSky)
gui.add(skyParameters, 'elevation', -3, 90, 0.01).onChange(updateSky)
gui.add(skyParameters, 'azimuth', - 180, 180, 0.1).onChange(updateSky)
// gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky)

updateSky()




createRandomFirework()
window.addEventListener('click', createRandomFirework)


const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.resolution.set(window.innerWidth, window.innerHeight)
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(sizes.pixelRatio)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


    






renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





const clock = new THREE.Clock()
function animate() {
    const elapsedTime = clock.getElapsedTime()

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)

}


animate()