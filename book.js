import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("[data-canvas]");
const loading = document.querySelector("[data-loading]");
const task = document.querySelector("[data-task]");
const completion = document.querySelector("[data-completion]");
const resetButton = document.querySelector("[data-reset-view]");
const replayButton = document.querySelector("[data-replay]");
const progressDots = [...document.querySelectorAll("[data-progress]")];

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x183a31, 0.035);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const defaultCamera = new THREE.Vector3(11.6, 10.2, 13.8);
camera.position.copy(defaultCamera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 23;
controls.minPolarAngle = 0.48;
controls.maxPolarAngle = 1.36;
controls.target.set(0, 0.8, -0.2);

scene.add(new THREE.HemisphereLight(0xfff2d2, 0x163b32, 2.25));
const keyLight = new THREE.DirectionalLight(0xffdfaa, 3.2);
keyLight.position.set(-7, 12, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12;
keyLight.shadow.camera.bottom = -12;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x82b7a1, 1.15);
rimLight.position.set(8, 5, -8);
scene.add(rimLight);

function makePaperTexture(base, fleck, seed = 3) {
  const size = 512;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size;
  const context = textureCanvas.getContext("2d");
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  let value = seed;
  const random = () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };

  context.fillStyle = fleck;
  for (let index = 0; index < 2100; index += 1) {
    const alpha = random() * 0.12;
    context.globalAlpha = alpha;
    context.fillRect(random() * size, random() * size, random() * 2.4 + 0.3, random() * 1.2 + 0.2);
  }
  context.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

const creamTexture = makePaperTexture("#e7d9b7", "#765f42", 7);
const greenTexture = makePaperTexture("#315f4e", "#102f26", 13);
const redTexture = makePaperTexture("#a94b3d", "#612b25", 23);
const goldTexture = makePaperTexture("#d49b43", "#79521e", 31);

const materials = {
  page: new THREE.MeshStandardMaterial({ map: creamTexture, color: 0xf0e1bd, roughness: 0.94, metalness: 0 }),
  edge: new THREE.MeshStandardMaterial({ color: 0x9a8158, roughness: 1 }),
  cover: new THREE.MeshStandardMaterial({ map: greenTexture, color: 0x315f4e, roughness: 0.9 }),
  mountain: new THREE.MeshStandardMaterial({ map: greenTexture, color: 0x52745e, roughness: 1, side: THREE.DoubleSide }),
  mountainBack: new THREE.MeshStandardMaterial({ color: 0x78907a, roughness: 1, side: THREE.DoubleSide }),
  red: new THREE.MeshStandardMaterial({ map: redTexture, color: 0xa94b3d, roughness: 0.86, side: THREE.DoubleSide }),
  gold: new THREE.MeshStandardMaterial({ map: goldTexture, color: 0xd49b43, roughness: 0.86, side: THREE.DoubleSide }),
  dark: new THREE.MeshStandardMaterial({ color: 0x253c32, roughness: 0.95, side: THREE.DoubleSide }),
  water: new THREE.MeshStandardMaterial({ color: 0x5f9486, roughness: 0.74, transparent: true, opacity: 0.9 })
};

const book = new THREE.Group();
book.rotation.y = -0.07;
book.position.y = -1.1;
scene.add(book);

function addBox(size, position, material, parent = book) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

addBox([12.7, 0.28, 7.4], [0, -0.22, 0.2], materials.cover);
addBox([12.05, 0.54, 6.92], [0, 0.06, 0], materials.edge);
addBox([11.9, 0.16, 6.78], [0, 0.42, -0.02], materials.page);
addBox([0.22, 0.42, 6.95], [0, 0.3, 0], materials.cover);

for (let index = 0; index < 7; index += 1) {
  const lineMaterial = new THREE.MeshStandardMaterial({ color: index % 2 ? 0xc8b386 : 0xdfcea7, roughness: 1 });
  addBox([5.72, 0.012, 6.65], [-3, 0.17 + index * 0.035, -0.02], lineMaterial);
  addBox([5.72, 0.012, 6.65], [3, 0.17 + index * 0.035, -0.02], lineMaterial);
}

const sceneRoot = new THREE.Group();
sceneRoot.position.y = 0.51;
book.add(sceneRoot);

const water = new THREE.Mesh(new THREE.PlaneGeometry(6.7, 4.15), materials.water);
water.rotation.x = -Math.PI / 2;
water.position.set(0.7, 0.03, 0.35);
water.receiveShadow = true;
sceneRoot.add(water);

for (let index = 0; index < 7; index += 1) {
  const ripple = new THREE.Mesh(
    new THREE.TorusGeometry(0.34 + index * 0.26, 0.012, 5, 44, Math.PI * 1.38),
    new THREE.MeshBasicMaterial({ color: 0xd6dcc3, transparent: true, opacity: 0.38 })
  );
  ripple.rotation.x = -Math.PI / 2;
  ripple.rotation.z = index * 0.68;
  ripple.position.set(-1.35 + index * 0.47, 0.055, 0.25 + Math.sin(index) * 0.6);
  sceneRoot.add(ripple);
}

function createMountain(points, colorMaterial, position, scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.lineTo(points[0][0], points[0][1]);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.11,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 1
  });
  geometry.center();
  const mountain = new THREE.Mesh(geometry, colorMaterial);
  mountain.position.set(...position);
  mountain.scale.setScalar(scale);
  mountain.castShadow = true;
  mountain.receiveShadow = true;
  sceneRoot.add(mountain);
  return mountain;
}

const mountains = [
  createMountain([[-2.8, -0.7], [-1.4, 1.3], [-0.45, 0.15], [0.65, 1.85], [2.6, -0.7]], materials.mountainBack, [0.3, 1.12, -2.25], 1.05),
  createMountain([[-2.6, -0.7], [-1.15, 1.75], [-0.2, 0.48], [0.7, 1.4], [2.5, -0.7]], materials.mountain, [-1.95, 1.15, -1.32], 0.92),
  createMountain([[-2.7, -0.7], [-1.7, 0.8], [-0.8, 0.25], [0.2, 1.35], [1.1, 0.15], [2.65, -0.7]], materials.dark, [3.2, 0.96, -0.72], 0.72)
];

function createFoldSupport(x, z, width, height, material) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width / 2, height);
  shape.closePath();
  const support = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  support.rotation.y = Math.PI / 2;
  support.position.set(x, height / 2, z);
  support.castShadow = true;
  sceneRoot.add(support);
}

createFoldSupport(-2.15, -1.23, 1.15, 1.3, materials.edge);
createFoldSupport(3.35, -0.65, 0.95, 1.05, materials.edge);

function createPine(position, scale, material = materials.dark) {
  const pine = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.25, 0.09), materials.red);
  trunk.position.y = 0.62;
  trunk.castShadow = true;
  pine.add(trunk);

  [0.45, 0.75, 1.03].forEach((height, index) => {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.62 - index * 0.1, 0.72, 5), material);
    crown.position.y = height + 0.35;
    crown.rotation.y = index * 0.55;
    crown.castShadow = true;
    pine.add(crown);
  });
  pine.position.set(...position);
  pine.scale.setScalar(scale);
  sceneRoot.add(pine);
  return pine;
}

createPine([-4.2, 0, -1.25], 1.25);
createPine([-3.35, 0, -2.25], 0.85, materials.mountain);
createPine([4.35, 0, -1.6], 0.95);
createPine([2.7, 0, -2.25], 0.64, materials.mountain);

const arch = new THREE.Group();
addBox([2.3, 0.18, 0.2], [0, 2.18, 0], materials.red, arch);
addBox([0.18, 2.2, 0.2], [-0.88, 1.1, 0], materials.red, arch);
addBox([0.18, 2.2, 0.2], [0.88, 1.1, 0], materials.red, arch);
addBox([2.75, 0.13, 0.25], [0, 2.43, 0], materials.gold, arch);
arch.position.set(-0.45, 0, -1.15);
arch.castShadow = true;
sceneRoot.add(arch);

const lanterns = [];
const lanternPositions = [
  [-3.75, 1.12, 0.55],
  [-0.45, 1.56, -1.04],
  [3.15, 1.08, 0.36]
];

function createLantern(position, index) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.userData.isLantern = true;
  group.userData.index = index;
  group.userData.baseY = position[1];

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12), materials.gold);
  top.position.y = 0.3;
  const bodyMaterial = materials.red.clone();
  bodyMaterial.emissive = new THREE.Color(0x5a0d05);
  bodyMaterial.emissiveIntensity = 0.1;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 0.52, 12), bodyMaterial);
  const bottom = top.clone();
  bottom.position.y = -0.3;
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 6), materials.gold);
  tassel.position.y = -0.5;
  const hitArea = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 8, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  [top, body, bottom, tassel].forEach((part) => {
    part.castShadow = true;
    part.userData.lanternGroup = group;
    group.add(part);
  });
  hitArea.userData.lanternGroup = group;
  group.add(hitArea);

  const glow = new THREE.PointLight(0xffad43, 0, 4.5, 2);
  glow.position.y = 0;
  group.add(glow);
  group.userData.bodyMaterial = bodyMaterial;
  group.userData.glow = glow;
  group.scale.setScalar(0);
  sceneRoot.add(group);
  lanterns.push(group);
}

lanternPositions.forEach(createLantern);

const steppingStones = [
  [-2.25, 0.11, 1.58],
  [-1.15, 0.11, 1.05],
  [0.05, 0.11, 1.36],
  [1.2, 0.11, 0.85],
  [2.2, 0.11, 1.22]
];
steppingStones.forEach(([x, y, z], index) => {
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.12, 7), index % 2 ? materials.gold : materials.page);
  stone.position.set(x, y, z);
  stone.rotation.y = index * 0.72;
  stone.scale.z = 0.68;
  stone.castShadow = true;
  sceneRoot.add(stone);
});

const sealCanvas = document.createElement("canvas");
sealCanvas.width = 256;
sealCanvas.height = 256;
const sealContext = sealCanvas.getContext("2d");
sealContext.fillStyle = "#a94b3d";
sealContext.fillRect(28, 28, 200, 200);
sealContext.strokeStyle = "#ead9b7";
sealContext.lineWidth = 8;
sealContext.strokeRect(49, 49, 158, 158);
sealContext.fillStyle = "#ead9b7";
sealContext.font = '104px "KaiTi", serif';
sealContext.textAlign = "center";
sealContext.textBaseline = "middle";
sealContext.fillText("石", 128, 132);
const sealTexture = new THREE.CanvasTexture(sealCanvas);
sealTexture.colorSpace = THREE.SRGBColorSpace;
const seal = new THREE.Mesh(
  new THREE.PlaneGeometry(0.7, 0.7),
  new THREE.MeshBasicMaterial({ map: sealTexture, transparent: true })
);
seal.rotation.x = -Math.PI / 2;
seal.rotation.z = 0.12;
seal.position.set(4.65, 0.1, 2.35);
sceneRoot.add(seal);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(17, 64),
  new THREE.ShadowMaterial({ color: 0x071d17, opacity: 0.28 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.38;
ground.receiveShadow = true;
scene.add(ground);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;
let litCount = 0;
let startTime = performance.now();
let isOpening = true;

function resetChapter() {
  litCount = 0;
  startTime = performance.now();
  isOpening = true;
  sceneRoot.scale.set(1, 0.015, 1);
  mountains.forEach((mountain) => {
    mountain.rotation.x = -Math.PI / 2;
  });
  lanterns.forEach((lantern) => {
    lantern.userData.isLit = false;
    lantern.userData.glow.intensity = 0;
    lantern.userData.bodyMaterial.emissiveIntensity = 0.1;
    lantern.scale.setScalar(0);
  });
  progressDots.forEach((dot) => dot.classList.remove("is-lit"));
  task.textContent = "依次点亮山间的三盏纸灯";
  completion.classList.remove("is-visible");
  window.setTimeout(() => {
    completion.hidden = true;
  }, 500);
}

function lightLantern(lantern) {
  if (lantern.userData.isLit || isOpening) return;
  lantern.userData.isLit = true;
  lantern.userData.litAt = performance.now();
  lantern.userData.glow.intensity = 5.2;
  lantern.userData.bodyMaterial.emissiveIntensity = 1.35;
  progressDots[litCount]?.classList.add("is-lit");
  litCount += 1;
  task.textContent = litCount < 3 ? `还剩 ${3 - litCount} 盏纸灯` : "三盏纸灯已全部点亮";

  if (litCount === 3) {
    completion.hidden = false;
    requestAnimationFrame(() => completion.classList.add("is-visible"));
    window.setTimeout(() => completion.classList.remove("is-visible"), 2900);
  }
}

function pickLantern(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(lanterns, true);
  const lantern = hits[0]?.object.userData.lanternGroup;
  if (lantern) lightLantern(lantern);
}

canvas.addEventListener("pointerdown", (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointerup", (event) => {
  if (!pointerDown) return;
  const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
  if (distance < 8) pickLantern(event);
  pointerDown = null;
});

function resetView() {
  camera.position.copy(defaultCamera);
  controls.target.set(0, 0.8, -0.2);
  controls.update();
}

resetButton.addEventListener("click", resetView);
replayButton.addEventListener("click", () => {
  resetView();
  resetChapter();
});

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

function updateOpening(now) {
  const elapsed = now - startTime;
  const pageProgress = Math.min(1, elapsed / 1500);
  const foldProgress = Math.min(1, Math.max(0, (elapsed - 420) / 1380));
  sceneRoot.scale.y = Math.max(0.015, easeOutBack(pageProgress));
  mountains.forEach((mountain, index) => {
    const delay = index * 0.08;
    const localProgress = Math.min(1, Math.max(0, (foldProgress - delay) / (1 - delay)));
    mountain.rotation.x = -Math.PI / 2 * (1 - localProgress);
  });
  lanterns.forEach((lantern, index) => {
    const localProgress = Math.min(1, Math.max(0, (elapsed - 920 - index * 150) / 520));
    lantern.scale.setScalar(easeOutBack(localProgress));
  });
  if (elapsed > 1900) isOpening = false;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.fov = width < 720 ? 46 : 34;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
}

window.addEventListener("resize", resize);
resize();
resetChapter();

const clock = new THREE.Clock();
function animate(now) {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (isOpening) updateOpening(now);

  lanterns.forEach((lantern, index) => {
    lantern.position.y = lantern.userData.baseY + Math.sin(elapsed * 1.45 + index) * 0.035;
    lantern.rotation.y = Math.sin(elapsed * 0.72 + index * 0.6) * 0.12;
    if (lantern.userData.isLit) {
      lantern.userData.glow.intensity = 4.8 + Math.sin(elapsed * 5 + index) * 0.5;
    }
  });
  water.material.opacity = 0.84 + Math.sin(elapsed * 0.8) * 0.05;
  controls.update();
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
window.setTimeout(() => loading.classList.add("is-hidden"), 650);
