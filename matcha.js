// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';

// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js";
// import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js";


let camera, scene, renderer, controls;
let matchaMaterial;
let container;
let model;
let bounceTime = 0;
let idleSpin = 0;

init();
animate();

function init() {
  container = document.getElementById("matcha-container");
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 3.4, 6);
  camera.lookAt(0, 1.0, 0); 

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;

  controls.minPolarAngle = Math.PI / 2 - 0.40;
  controls.maxPolarAngle = Math.PI / 2 + 0.40;

  controls.minAzimuthAngle = -Math.PI;
  controls.maxAzimuthAngle = Math.PI;

  controls.target.set(0, 1.5, 0);
  controls.update();

  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(2, 6, 2);
  dirLight.target.position.set(0, 0.5, 0);
  dirLight.castShadow = true;
  scene.add(dirLight);
  scene.add(dirLight.target);

  const loader = new GLTFLoader();
  loader.load("public/matcha-optimized.glb", (gltf) => {
    model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
      if (child.isMesh && child.name === "NurbsPath001") {
        const uniforms = {
          uColorTop: { value: new THREE.Color(0xffffff) },
          uColorBottom: { value: new THREE.Color(0xd5f2ba) },
          uMinHeight: { value: 0.0 },
          uMaxHeight: { value: 1.5 },
          uLightDirection: { value: new THREE.Vector3(2, 6, 2).normalize() },
          uCameraPosition: { value: new THREE.Vector3() },
          uTopLightDirection: { value: new THREE.Vector3(0.0, 1.0, 0.0) },
        };

        matchaMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: `
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            void main() {
              vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 uColorTop;
            uniform vec3 uColorBottom;
            uniform float uMinHeight;
            uniform float uMaxHeight;
            uniform vec3 uCameraPosition;
            uniform vec3 uTopLightDirection;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            float bumpNoise(vec3 pos) {
              return fract(sin(dot(pos.xyz, vec3(12.9898,78.233,45.164))) * 43758.5453);
            }
            void main() {
              float height = (vWorldPosition.y - uMinHeight) / (uMaxHeight - uMinHeight);
              height = height * 1.1 - 0.4;
              height = clamp(height, 0.0, 1.0);
              float bumps = bumpNoise(vWorldPosition * 10.0) * 0.2;
              vec3 baseColor = mix(uColorBottom, uColorTop, height + bumps * 0.5);
              vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
              vec3 normal = normalize(vWorldNormal);
              float viewLighting = dot(normal, viewDir);
              float topLighting = dot(normal, normalize(uTopLightDirection));
              float lighting = 0.7 * viewLighting + 0.5 * topLighting;
              lighting = clamp(lighting, 0.6, 1.2);
              gl_FragColor = vec4(baseColor * lighting, 0.85);
            }
          `,
          transparent: true,
        });

        child.material = matchaMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (matchaMaterial) {
    matchaMaterial.uniforms.uCameraPosition.value.copy(camera.position);
  }

  if (model) {
    bounceTime += 0.06;
    model.position.y = Math.sin(bounceTime) * 0.3;
    model.rotation.y += 0.04;
  }

  renderer.render(scene, camera);
}
