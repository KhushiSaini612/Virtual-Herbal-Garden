// Create the scene
const scene = new THREE.Scene();

// Load textures
const textureLoader = new THREE.TextureLoader();
const soilTexture = textureLoader.load('TCom_Ground_Soil3_header.jpg');
soilTexture.wrapS = THREE.RepeatWrapping;
soilTexture.wrapT = THREE.RepeatWrapping;
soilTexture.repeat.set(20, 20); // Adjust the repetition for soil texture

const grassTexture = textureLoader.load('Grass004_4K-JPG/Grass004_4K-JPG_Color.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(20, 20);

// Load sky texture for background
const skyTexture = textureLoader.load('sky.jpg'); // Replace with your sky texture path
scene.background = skyTexture;  // Set the scene background to the sky texture

// Create the soil plane between the plants
const soilMaterial = new THREE.MeshStandardMaterial({ map: soilTexture });
const soilGeometry = new THREE.PlaneGeometry(30, 500); // Soil area between plants
const soilPlane = new THREE.Mesh(soilGeometry, soilMaterial);
soilPlane.rotation.x = -Math.PI / 2;
soilPlane.position.set(0, 0, -30); // Position it between the plants
scene.add(soilPlane);

// Create grass for the left side of the plant lane
const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture, transparent: true });
const grassGeometry = new THREE.PlaneGeometry(60, 500); // Grass area on the left
const grassLeft = new THREE.Mesh(grassGeometry, grassMaterial);
grassLeft.rotation.x = -Math.PI / 2;
grassLeft.position.set(-45, 0, -30); // Position it to the left of the plants
scene.add(grassLeft);

// Create grass for the right side of the plant lane
const grassRight = new THREE.Mesh(grassGeometry, grassMaterial);
grassRight.rotation.x = -Math.PI / 2;
grassRight.position.set(45, 0, -30); // Position it to the right of the plants
scene.add(grassRight);

// Remove any extra sky spheres, if present
// Ensure no residual black color or inner spheres:
scene.traverse((object) => {
    if (object.isMesh && object.material.color && object.material.color.getHex() === 0x000000) {
        scene.remove(object); // Remove any black-colored objects
    }
});

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 30); // Adjust camera position to fit the new layout

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('tour-container').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Loaders and plants
const loader = new THREE.GLTFLoader();
const plants = [];

// Load plant models and place them along the soil lane
function loadPlantModel(path, position, scale, name) {
    return new Promise((resolve) => {
        loader.load(path, (gltf) => {
            const plant = gltf.scene;
            plant.position.set(position.x, position.y, position.z);
            plant.scale.set(scale.x, scale.y, scale.z);
            plant.name = name;
            plant.userData.plantName = name; // Store the name in userData
            scene.add(plant);
            plants.push(plant);
            resolve(plant);
        });
    });
}

// Load different plants with custom scales and positions
const plantLoadPromises = [
    // Left side
    loadPlantModel('models/hawthorn_tree/scene.gltf', { x: -15, y: 1, z: -50 }, { x: 7, y: 7, z: 7 }, 'Hawthorn'),
    loadPlantModel('models/echinacea/scene.gltf', { x: -15, y: -0.5, z: -25 }, { x: 15, y: 15, z: 15 }, 'Echinacea'),
    loadPlantModel('models/chili_pepper/scene.gltf', { x: -15, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, 'Chilli Pepper'),

    // Right side
    loadPlantModel('models/elderberry/scene.gltf', { x: 15, y: -1.5, z: -50 }, { x: 0.50, y: 0.50, z: 0.50 }, 'Elderberry'),
    loadPlantModel('models/chinese_milk_vetch_astragalus_sinicus/scene.gltf', { x: 15, y: -0.1, z: -25 }, { x: 70, y: 70, z: 70 }, 'Astragalus'),
    loadPlantModel('models/tulsi/scene.gltf', { x: 15, y: 0, z: 0 }, { x: 9, y: 9, z: 9 }, 'Tulsi'),
];

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to handle clicks
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        let object = intersects[0].object;

        // Traverse up the scene graph to find the root object with the plant name
        while (object.parent && !object.userData.plantName) {
            object = object.parent;
        }

        if (object.userData.plantName) {
            document.getElementById('info-box').innerHTML = `
                <p>Hello!!</p>
                <p>My Name Is ${object.userData.plantName}!!</p>`;
        }
    }
}

// Add event listener for clicks
window.addEventListener('click', onMouseClick);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;

// Add zoom limits
controls.minDistance = 1;  // Minimum zoom distance (how close the camera can get)
controls.maxDistance = 80; // Maximum zoom distance (how far the camera can zoom out)

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Constraint: Prevent the camera from going below the platform
    const minCameraY = 2; // Adjust this value to your desired minimum height above the platform
    if (camera.position.y < minCameraY) {
        camera.position.y = minCameraY;
    }

    renderer.render(scene, camera);
}

// Start the animation loop once all plants are loaded
Promise.all(plantLoadPromises).then(() => {
    animate();
});

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Start the animation loop once all plants are loaded
Promise.all(plantLoadPromises).then(() => {
    animate();
});
