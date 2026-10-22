import * as THREE from './vendor/three.module.js';

// A real 3D volume, with perspective-sized flakes and depth-dependent drift.
const hero = document.querySelector('.hero');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (hero && !reduced.matches) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch { /* The photograph remains the complete non-WebGL presentation. */ }
  if (renderer) mount(renderer);
}

function mount(renderer) {
  const mobile = matchMedia('(max-width: 800px)').matches;
  const count = mobile ? 230 : 650;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'snow-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  hero.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 60);
  camera.position.z = 12;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions.set([(Math.random() - .5) * 42, (Math.random() - .5) * 26, -Math.random() * 22], i * 3);
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { time: { value: 0 }, wind: { value: 0 }, pixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float seed; uniform float time; uniform float wind; uniform float pixelRatio; varying float opacity;
      void main(){vec3 p=position;
        p.y=mod(p.y+13.-time*(.65+seed*.7),26.)-13.;
        p.x=mod(p.x+21.+time*(.18+seed*.25)+sin(time*.4+seed*30.)*.35+wind*(1.+seed*2.),42.)-21.;
        vec4 view=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*view;
        gl_PointSize=clamp((30.+seed*35.)/-view.z,1.,5.)*pixelRatio;
        opacity=(.14+seed*.36)*smoothstep(0.,2.,13.-abs(p.y));
      }`,
    fragmentShader: `varying float opacity;void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.12,.5,d))*opacity;gl_FragColor=vec4(.88,.96,1.,a);}`
  });
  scene.add(new THREE.Points(geometry, material));
  let visible = true, disposed = false, last = 0, elapsed = 0, targetX = 0, targetY = 0;
  function resize() {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(hero);
  function pointer(event) {
    if (event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - .5;
    targetY = (event.clientY - rect.top) / rect.height - .5;
  }
  function resetPointer() { targetX = targetY = 0; }
  hero.addEventListener('pointermove', pointer);
  hero.addEventListener('pointerleave', resetPointer);
  function frame(now) {
    if (now - last < 33) return;
    const dt = Math.min((now - last) / 1000, .05);
    last = now; elapsed += dt;
    material.uniforms.time.value = elapsed;
    material.uniforms.wind.value += (targetX * 1.5 - material.uniforms.wind.value) * .035;
    camera.position.x += (targetX * .65 - camera.position.x) * .025;
    camera.position.y += (-targetY * .35 - camera.position.y) * .025;
    renderer.render(scene, camera);
  }
  function playback() {
    if (disposed) return;
    last = performance.now();
    renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  }
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); });
  intersection.observe(hero);
  document.addEventListener('visibilitychange', playback);
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    observer.disconnect(); intersection.disconnect();
    hero.removeEventListener('pointermove', pointer);
    hero.removeEventListener('pointerleave', resetPointer);
    document.removeEventListener('visibilitychange', playback);
    reduced.removeEventListener('change', preference);
    window.removeEventListener('pagehide', pagehide);
    window.removeEventListener('pageshow', pageshow);
    geometry.dispose(); material.dispose(); renderer.dispose();
    renderer.domElement.remove();
  }
  function preference() { if (reduced.matches) dispose(); }
  function pagehide(event) { if (event.persisted) renderer.setAnimationLoop(null); else dispose(); }
  function pageshow() { playback(); }
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); }, { once: true });
  reduced.addEventListener('change', preference);
  window.addEventListener('pagehide', pagehide);
  window.addEventListener('pageshow', pageshow);
  resize(); playback();
}
