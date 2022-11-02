import * as THREE from 'three'
import { OrbitControls } from 'https://unpkg.com/three@0.146.0/examples/jsm/controls/OrbitControls.js';
import * as PIECE from './piece.js'

// Event Listeners
document.addEventListener('keypress', (e) => controlManager(e.key.toLowerCase()))

// Constants
const ROTATION_SPEED = 1/60
const PI = Math.PI
const R_ANGLE = PI * 0.5
const WHITE = 0xffffff
const RED = 0xc72033
const BLUE = 0x00a2ff 
const ORANGE = 0xffa500
const GREEN = 0x00ff00
const YELLOW = 0xffff00

const KEY = {
    R       : 'k',
    R_PRIME : 'j',
    L       : 'f',
    L_PRIME : 'd',
    U       : 'u',
    U_PRIME : 'r',
    D       : ',',
    D_PRIME : 'c',
    F       : 'm',
    F_PRIME : 'v',
    B       : 'e',
    B_PRIME : 'i',
    M       : 'h',
    M_PRIME : 'g',
    S       : 'y',
    S_PRIME : 't',
    E       : 'n',
    E_PRIME : 'b',
    X       : 'w',
    X_PRIME : 'q',
    Y       : 'a',
    Y_PRIME : 's',
    Z       : 'x',
    Z_PRIME : 'z',
}


// Global variables
let animationFrame = 0
let rotation = 0
let keyBuffer = []

// Three Javascript
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(5, 4, 5)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight - 1)
renderer.setClearColor(0x2f3133)
document.body.appendChild(renderer.domElement)

// Camera controller
const controls = new OrbitControls( camera, renderer.domElement )
controls.target.set(1, 1, 1)

// Helper Functions
function vect3(x, y, z) {
    return new THREE.Vector3(x, y, z)
}

function euler(x, y, z) {
    return new THREE.Euler(x, y, z)
}

function createCenter(parent, color, pos, rot) { 
    const center = new PIECE.Center(color)
    center.position.set(pos.x, pos.y, pos.z)
    center.rotation.set(rot.x, rot.y, rot.z)
    parent.add(center)
    return center
}

function createEdge(parent, color, pos, rot) { 
    const edge = new PIECE.Edge(color)
    edge.position.set(pos.x, pos.y, pos.z)
    edge.rotation.set(rot.x, rot.y, rot.z)
    parent.add(edge)
    return edge
}

function createCorner(parent, color, pos, rot) { 
    const corner = new PIECE.Corner(color)
    corner.position.set(pos.x, pos.y, pos.z)
    corner.rotation.set(rot.x, rot.y, rot.z)
    parent.add(corner)
    return corner
}

function createGroup(parent, x, y, z) {
    const group = new THREE.Group()
    group.position.set(x, y, z)
    parent.add(group)
    return group
}

function popKeyQueue() {
    if (keyBuffer.length > 0) {
        controlManager(keyBuffer[0])
        keyBuffer.shift()
    }
}

function reset(side) {
    cancelAnimationFrame(animationFrame)
    Array.from(side.children).forEach((piece) => {
        piece.getWorldPosition(piece.position)
        piece.position.round()
        piece.getWorldQuaternion(piece.rotation)
        scene.add(piece)
    })
    side.rotation.set(0, 0, 0)
    rotation = 0
    animationFrame = 0

    // Start next animation in keyBuffer
    popKeyQueue()
}

// Set which pieces to rotate
function setAxes({
    x = {values: [0, 1, 2], selected: false}, 
    y = {values: [0, 1, 2], selected: false}, 
    z = {values: [0, 1, 2], selected: false}
}) {
    return {
        x: x,
        y: y,
        z: z,
    }
}

const getSelected = (arr) => { return {values: arr, selected: true} }

// Building the rubik's cube
const pieces = [
    // Centers
    createCenter(scene, WHITE,  vect3(1, 0, 1), euler(R_ANGLE, 0, 0)),  // White
    createCenter(scene, RED,    vect3(2, 1, 1), euler(0, R_ANGLE, 0)),  // Red
    createCenter(scene, BLUE,   vect3(1, 1, 2), euler(0, 0, 0)),        // Blue
    createCenter(scene, ORANGE, vect3(0, 1, 1), euler(0, -R_ANGLE, 0)), // Orange
    createCenter(scene, GREEN,  vect3(1, 1, 0), euler(0, PI, 0)),       // Green
    createCenter(scene, YELLOW, vect3(1, 2, 1), euler(-R_ANGLE, 0, 0)), // Yellow
    
    // Edges
    createEdge(scene, [WHITE, RED],     vect3(2, 0, 1), euler(R_ANGLE, 0, -R_ANGLE)),  // White-Red
    createEdge(scene, [WHITE, BLUE],    vect3(1, 0, 2), euler(R_ANGLE, 0, 0)),         // White-Blue
    createEdge(scene, [WHITE, ORANGE],  vect3(0, 0, 1), euler(R_ANGLE, 0, R_ANGLE)),   // White-Orange
    createEdge(scene, [WHITE, GREEN],   vect3(1, 0, 0), euler(R_ANGLE, 0, PI)),        // White-Green
    createEdge(scene, [RED, BLUE],      vect3(2, 1, 2), euler(R_ANGLE, R_ANGLE, 0)),   // Red-Blue
    createEdge(scene, [RED, GREEN],     vect3(2, 1, 0), euler(-R_ANGLE, R_ANGLE, 0)),  // Red-Green
    createEdge(scene, [RED, YELLOW],    vect3(2, 2, 1), euler(0, R_ANGLE, 0)),         // Red-Yellow
    createEdge(scene, [BLUE, ORANGE],   vect3(0, 1, 2), euler(0, 0, R_ANGLE)),         // Blue-Orange
    createEdge(scene, [BLUE, YELLOW],   vect3(1, 2, 2), euler(0, 0, 0)),               // Blue-Yellow
    createEdge(scene, [ORANGE, GREEN],  vect3(0, 1, 0), euler(-R_ANGLE, -R_ANGLE, 0)), // Orange-Green
    createEdge(scene, [ORANGE, YELLOW], vect3(0, 2, 1), euler(0, -R_ANGLE, 0)),        // Orange-Yellow
    createEdge(scene, [GREEN, YELLOW],  vect3(1, 2, 0), euler(0, -PI, 0)),             // Green-Yellow

    // Corners
    createCorner(scene, [WHITE, BLUE, RED],     vect3(2, 0, 2), euler(R_ANGLE, 0, 0)),        // White-Blue-Red
    createCorner(scene, [WHITE, ORANGE, BLUE],  vect3(0, 0, 2), euler(R_ANGLE, 0, R_ANGLE)),  // White-Orange-Blue
    createCorner(scene, [WHITE, GREEN, ORANGE], vect3(0, 0, 0), euler(R_ANGLE, 0, PI)),       // White-Green-Orange
    createCorner(scene, [WHITE, RED, GREEN],    vect3(2, 0, 0), euler(R_ANGLE, 0, -R_ANGLE)), // White-Red-Green
    createCorner(scene, [BLUE, YELLOW, RED],    vect3(2, 2, 2), euler(0, 0, 0)),              // Blue-Yellow-Red
    createCorner(scene, [ORANGE, YELLOW, BLUE], vect3(0, 2, 2), euler(0, -R_ANGLE, 0)),       // Orange-Yellow-Blue
    createCorner(scene, [GREEN, YELLOW, ORANGE],vect3(0, 2, 0), euler(0, PI, 0)),             // Blue-Yellow-Red
    createCorner(scene, [RED, YELLOW, GREEN],   vect3(2, 2, 0), euler(0, R_ANGLE, 0)),        // Red-Yellow-Green
] 

// Create side groups
const SIDES = {
    'left'  : createGroup(scene, 0, 1, 1),
    'down'  : createGroup(scene, 1, 0, 1),
    'back'  : createGroup(scene, 1, 1, 0),
    'right' : createGroup(scene, 2, 1, 1),
    'up'    : createGroup(scene, 1, 2, 1),
    'front' : createGroup(scene, 1, 1, 2),
    'middle': createGroup(scene, 1, 1, 1),
}

// Rotation functions
function rotate(s, axes, direction = false) {
    pieces.forEach((piece) => {
        let pos = piece.position
        if (axes.x.values.includes(pos.x) && axes.y.values.includes(pos.y) && axes.z.values.includes(pos.z)) {
            piece.position.set(pos.x - s.position.x, pos.y - s.position.y, pos.z - s.position.z)
            s.add(piece)
        }
    })
    doRotation(s, axes, direction)
}

function doRotation(s, axes, direction) {
    animationFrame = requestAnimationFrame(() => doRotation(s, axes, direction))
    if (rotation < R_ANGLE) {
        if (axes.x.selected) {
            s.rotation.x += PI * ROTATION_SPEED * direction
        } else if (axes.y.selected) {
            s.rotation.y += PI * ROTATION_SPEED * direction
        } else if (axes.z.selected) {
            s.rotation.z += PI * ROTATION_SPEED * direction
        }
        rotation += Math.PI * ROTATION_SPEED
    } else {
        reset(s)
    }
}

// Keybindings
function controlManager(key) {
    if (animationFrame) {
        keyBuffer.push(key)
        return
    }
    switch (key) {
        case KEY.R:
            rotate(SIDES.right, setAxes({x: getSelected([2])}), -1)
            break
        case KEY.R_PRIME:
            rotate(SIDES.right, setAxes({x: getSelected([2])}), 1)
            break
        case KEY.L:
            rotate(SIDES.left, setAxes({x: getSelected([0])}), 1)
            break
        case KEY.L_PRIME:
            rotate(SIDES.left, setAxes({x: getSelected([0])}), -1)
            break
        case KEY.U:
            rotate(SIDES.up, setAxes({y: getSelected([2])}), -1)
            break
        case KEY.U_PRIME:
            rotate(SIDES.up, setAxes({y: getSelected([2])}), 1)
            break
        case KEY.D:
            rotate(SIDES.down, setAxes({y: getSelected([0])}), 1)
            break
        case KEY.D_PRIME:
            rotate(SIDES.down, setAxes({y: getSelected([0])}), -1)
            break
        case KEY.F:
            rotate(SIDES.front, setAxes({z: getSelected([2])}), -1)
            break
        case KEY.F_PRIME:
            rotate(SIDES.front, setAxes({z: getSelected([2])}), 1)
            break
        case KEY.B:
            rotate(SIDES.back, setAxes({z: getSelected([0])}), 1)
            break
        case KEY.B_PRIME:
            rotate(SIDES.back, setAxes({z: getSelected([0])}), -1)
            break
        case KEY.M:
            rotate(SIDES.middle, setAxes({x: getSelected([1])}), -1)
            break
        case KEY.M_PRIME:
            rotate(SIDES.middle, setAxes({x: getSelected([1])}), 1)
            break
        case KEY.S:
            rotate(SIDES.middle, setAxes({z: getSelected([1])}), -1)
            break
        case KEY.S_PRIME:
            rotate(SIDES.middle, setAxes({z: getSelected([1])}), 1)
            break
        case KEY.E:
            rotate(SIDES.middle, setAxes({y: getSelected([1])}), 1)
            break
        case KEY.E_PRIME:
            rotate(SIDES.middle, setAxes({y: getSelected([1])}), -1)
            break
        case KEY.X:
            rotate(SIDES.middle, setAxes({x: getSelected([0, 1, 2])}), -1)
            break
        case KEY.X_PRIME:
            rotate(SIDES.middle, setAxes({x: getSelected([0, 1, 2])}), 1)
            break
        case KEY.Y:
            rotate(SIDES.middle, setAxes({y: getSelected([0, 1, 2])}), -1)
            break
        case KEY.Y_PRIME:
            rotate(SIDES.middle, setAxes({y: getSelected([0, 1, 2])}), 1)
            break
        case KEY.Z:
            rotate(SIDES.middle, setAxes({z: getSelected([0, 1, 2])}), -1)
            break
        case KEY.Z_PRIME:
            rotate(SIDES.middle, setAxes({z: getSelected([0, 1, 2])}), 1)
            break
        default:
            break
    }
}

// Allow movement
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}
animate()