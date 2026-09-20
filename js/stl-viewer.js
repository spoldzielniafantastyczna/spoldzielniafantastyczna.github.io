// Lazy-loaded STL model viewer built on Three.js. Only imported by pages/projects
// that actually declare an `stl` asset, so the ~700KB three.js runtime never
// ships to visitors browsing pages without a 3D model.

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initStlViewer(container, stlUrl) {
  const statusEl = container.querySelector('[data-viewer-status]');
  const hintEl = container.querySelector('[data-viewer-hint]');

  function setStatus(text, isError = false) {
    if (!statusEl) return;
    if (text === null) {
      statusEl.hidden = true;
      return;
    }
    statusEl.hidden = false;
    statusEl.classList.toggle('model-viewer__status--error', isError);
    statusEl.innerHTML = isError
      ? `<p>${text}</p>`
      : `<div class="spinner" aria-hidden="true"></div><p>${text}</p>`;
  }

  setStatus('Ładowanie modelu 3D…');

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(2.4, 2, 2.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfff2e6, 0x1a1512, 0.9));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(3, 4, 2);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd81e2c, 0.35);
  fillLight.position.set(-3, -1, -2);
  scene.add(fillLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1;
  controls.maxDistance = 8;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;

  const stopAutoRotate = () => {
    controls.autoRotate = false;
    hintEl?.style.setProperty('opacity', '0');
  };
  controls.domElement.addEventListener('pointerdown', stopAutoRotate, { once: true });
  controls.domElement.addEventListener('touchstart', stopAutoRotate, { once: true, passive: true });
  controls.domElement.addEventListener('wheel', stopAutoRotate, { once: true, passive: true });

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let frameId;
  function animate() {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const loader = new STLLoader();
  loader.load(
    stlUrl,
    (geometry) => {
      geometry.computeBoundingBox();
      geometry.center();

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 1.6 / maxDim;

      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: 0xc9c6c2,
        roughness: 0.55,
        metalness: 0.06,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(scale);
      mesh.rotation.x = -Math.PI / 2; // STL is typically Z-up; three.js is Y-up
      scene.add(mesh);

      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere.radius * scale;
      const fitDistance = (radius / Math.sin((camera.fov * Math.PI) / 360)) * 1.35;
      camera.position.set(fitDistance * 0.7, fitDistance * 0.55, fitDistance * 0.8);
      controls.target.set(0, 0, 0);
      controls.minDistance = radius * 1.2;
      controls.maxDistance = fitDistance * 3;
      controls.update();

      setStatus(null);
    },
    undefined,
    (err) => {
      console.error('STL load failed', err);
      setStatus('Nie udało się wczytać modelu 3D. Spróbuj ponownie później.', true);
    },
  );

  return () => {
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    controls.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
