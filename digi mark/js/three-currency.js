/**
 * DOLO TECHNOLOGY - 3D CURRENCY ANIMATION
 * Cinematic Three.js composition with procedural metallic gold & silver coins,
 * realistic PBR lighting, orbital mechanics, and interactive parallax.
 */

class CurrencyScene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.showFallback();
      return;
    }

    // Check WebGL support
    if (!this.isWebGLAvailable()) {
      console.warn('WebGL not available, showing fallback poster.');
      this.showFallback();
      return;
    }

    this.coins = [];
    this.particles = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();

    this.init();
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  showFallback() {
    const fallback = document.querySelector('.hero-fallback-img');
    if (fallback) fallback.style.display = 'block';
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.updateCameraPosition();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // Create Procedural Coin Textures
    this.createTextures();

    // Lighting
    this.setupLighting();

    // Coins Group
    this.coinsGroup = new THREE.Group();
    this.scene.add(this.coinsGroup);

    // Build Floating Coins
    this.createCoins();

    // Build Ambient Stardust Particles
    this.createParticles();

    // Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Start Animation Loop
    this.animate();
  }

  updateCameraPosition() {
    if (window.innerWidth <= 768) {
      // Mobile: center the camera and push slightly back
      this.camera.position.set(0, 0, 22);
      if (this.coinsGroup) this.coinsGroup.position.set(0, -2, 0);
    } else if (window.innerWidth <= 1100) {
      // Tablet: slight offset
      this.camera.position.set(0, 0, 19);
      if (this.coinsGroup) this.coinsGroup.position.set(2, 0, 0);
    } else {
      // Desktop: place 3D cluster toward the right side of the screen
      this.camera.position.set(0, 0, 17);
      if (this.coinsGroup) this.coinsGroup.position.set(3.8, 0.2, 0);
    }
  }

  createTextures() {
    // Generate high-resolution procedural normal/bump maps for embossed coins
    this.coinTextures = {
      goldFront: this.generateCoinFaceTexture('$', '#ffd700', '#7a5a00'),
      silverFront: this.generateCoinFaceTexture('◆', '#ffffff', '#556677'),
      doloFront: this.generateCoinFaceTexture('D', '#38bdf8', '#1e293b'),
      back: this.generateCoinBackTexture()
    };
  }

  generateCoinFaceTexture(symbol, mainColor, shadeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Circular background with subtle radial gradient
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 250);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.7, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Outer milled ridge border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.stroke();

    // Inner beaded ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
      const x = 256 + Math.cos(a) * 215;
      const y = 256 + Math.sin(a) * 215;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner decorative circle
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 185, 0, Math.PI * 2);
    ctx.stroke();

    // Center Embossed Symbol
    ctx.font = 'bold 150px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = shadeColor;
    ctx.fillText(symbol, 260, 260); // Drop shadow
    ctx.fillStyle = mainColor;
    ctx.fillText(symbol, 256, 256);

    // Circular subtext
    ctx.font = '600 20px "Poppins", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('• DOLO TECHNOLOGY • DIGITAL ASSET •', 256, 100);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  generateCoinBackTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Geometric Star / Crest Pattern
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x1 = 256 + Math.cos(a) * 60;
      const y1 = 256 + Math.sin(a) * 60;
      const x2 = 256 + Math.cos(a) * 190;
      const y2 = 256 + Math.sin(a) * 190;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    ctx.font = 'bold 36px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('GROWTH', 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  setupLighting() {
    // Ambient light - deep cool tone
    const ambientLight = new THREE.AmbientLight(0x0c132c, 1.2);
    this.scene.add(ambientLight);

    // Main key light - crisp studio white
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.keyLight.position.set(5, 8, 12);
    this.scene.add(this.keyLight);

    // Electric Cyan Rim Light (left/top)
    this.cyanRimLight = new THREE.PointLight(0x00f0ff, 4.5, 35);
    this.cyanRimLight.position.set(-8, 6, 4);
    this.scene.add(this.cyanRimLight);

    // Neon Purple / Magenta Rim Light (bottom/right)
    this.purpleRimLight = new THREE.PointLight(0x8b5cf6, 4.5, 35);
    this.purpleRimLight.position.set(9, -7, 6);
    this.scene.add(this.purpleRimLight);

    // Warm Gold Accent Light
    this.goldLight = new THREE.PointLight(0xffc837, 2.5, 25);
    this.goldLight.position.set(2, 4, 8);
    this.scene.add(this.goldLight);
  }

  createCoins() {
    // Materials
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd152,
      metalness: 0.94,
      roughness: 0.16,
      map: this.coinTextures.goldFront,
      envMapIntensity: 1.5
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.12,
      map: this.coinTextures.silverFront,
      envMapIntensity: 1.8
    });

    const doloMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.88,
      roughness: 0.2,
      map: this.coinTextures.doloFront,
      envMapIntensity: 1.4
    });

    // Base cylinder geometry for coins (radius: 1.4, thickness: 0.18)
    const coinGeom = new THREE.CylinderGeometry(1.4, 1.4, 0.18, 48);

    // Define coin orbit configurations
    const coinConfigs = [
      // Hero Principal Gold Coin (large, near foreground)
      {
        mat: goldMaterial,
        scale: 1.25,
        orbitRadiusX: 2.2,
        orbitRadiusY: 1.6,
        orbitSpeed: 0.35,
        orbitPhase: 0,
        tiltX: 0.4,
        tiltY: 0.3,
        rotSpeedX: 0.8,
        rotSpeedY: 1.2,
        rotSpeedZ: 0.4
      },
      // Hero Principal Silver Coin (adjacent companion)
      {
        mat: silverMaterial,
        scale: 1.1,
        orbitRadiusX: 3.5,
        orbitRadiusY: 2.4,
        orbitSpeed: 0.28,
        orbitPhase: Math.PI * 0.65,
        tiltX: -0.3,
        tiltY: 0.5,
        rotSpeedX: 0.6,
        rotSpeedY: 1.0,
        rotSpeedZ: -0.5
      },
      // Dolo Cyan Accent Coin
      {
        mat: doloMaterial,
        scale: 0.95,
        orbitRadiusX: 4.8,
        orbitRadiusY: 3.0,
        orbitSpeed: 0.22,
        orbitPhase: Math.PI * 1.3,
        tiltX: 0.5,
        tiltY: -0.4,
        rotSpeedX: 0.9,
        rotSpeedY: -0.7,
        rotSpeedZ: 0.6
      },
      // Secondary Gold Coin (medium depth)
      {
        mat: goldMaterial,
        scale: 0.85,
        orbitRadiusX: 5.8,
        orbitRadiusY: 3.8,
        orbitSpeed: 0.18,
        orbitPhase: Math.PI * 0.25,
        tiltX: 0.6,
        tiltY: 0.2,
        rotSpeedX: 0.5,
        rotSpeedY: 0.8,
        rotSpeedZ: 0.3
      },
      // Secondary Silver Coin
      {
        mat: silverMaterial,
        scale: 0.8,
        orbitRadiusX: 6.6,
        orbitRadiusY: 4.2,
        orbitSpeed: 0.15,
        orbitPhase: Math.PI * 0.95,
        tiltX: -0.5,
        tiltY: -0.6,
        rotSpeedX: -0.7,
        rotSpeedY: 0.6,
        rotSpeedZ: 0.5
      },
      // Floating Micro Coins (Depth of Field impression)
      {
        mat: goldMaterial,
        scale: 0.55,
        orbitRadiusX: 7.8,
        orbitRadiusY: 4.8,
        orbitSpeed: 0.12,
        orbitPhase: Math.PI * 1.6,
        tiltX: 0.8,
        tiltY: 0.4,
        rotSpeedX: 1.1,
        rotSpeedY: 1.3,
        rotSpeedZ: -0.7
      },
      {
        mat: silverMaterial,
        scale: 0.5,
        orbitRadiusX: 8.5,
        orbitRadiusY: 5.2,
        orbitSpeed: 0.1,
        orbitPhase: Math.PI * 0.45,
        tiltX: -0.7,
        tiltY: 0.7,
        rotSpeedX: 0.8,
        rotSpeedY: -1.1,
        rotSpeedZ: 0.4
      }
    ];

    coinConfigs.forEach(cfg => {
      const mesh = new THREE.Mesh(coinGeom, cfg.mat);
      mesh.scale.set(cfg.scale, cfg.scale, cfg.scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.coinsGroup.add(mesh);
      this.coins.push({
        mesh,
        cfg,
        currentPhase: cfg.orbitPhase
      });
    });

    // Optional: Add a subtle glowing orbital trajectory ring
    const ringGeom = new THREE.TorusGeometry(5.2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI * 0.45;
    ringMesh.rotation.y = Math.PI * 0.15;
    this.coinsGroup.add(ringMesh);
  }

  createParticles() {
    const count = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0x00f0ff);
    const c2 = new THREE.Color(0x8b5cf6);
    const c3 = new THREE.Color(0xffd152);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26;
      positions[i3 + 1] = (Math.random() - 0.5) * 18;
      positions[i3 + 2] = (Math.random() - 0.5) * 14;

      const rand = Math.random();
      const chosenColor = rand < 0.4 ? c1 : rand < 0.7 ? c2 : c3;
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onMouseMove(e) {
    // Normalized coordinates (-1 to 1)
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;

    this.mouse.targetX = nx * 0.6;
    this.mouse.targetY = ny * 0.4;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.updateCameraPosition();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Gentle camera parallax movement
    if (this.camera) {
      this.camera.position.x = this.mouse.x * 1.5;
      this.camera.position.y = this.mouse.y * 1.2;
      this.camera.lookAt(0, 0, 0);
    }

    // Animate coins in orbital trajectories
    this.coins.forEach((item, idx) => {
      const cfg = item.cfg;
      const mesh = item.mesh;

      // Update orbital position along an inclined ellipse
      item.currentPhase += delta * cfg.orbitSpeed;
      const angle = item.currentPhase;

      const baseRadiusX = cfg.orbitRadiusX;
      const baseRadiusY = cfg.orbitRadiusY;

      const x = Math.cos(angle) * baseRadiusX;
      const y = Math.sin(angle) * baseRadiusY * Math.cos(cfg.tiltX) + Math.sin(elapsedTime * 0.8 + idx) * 0.25;
      const z = Math.sin(angle) * baseRadiusY * Math.sin(cfg.tiltY) + Math.cos(angle) * 1.2;

      mesh.position.set(x, y, z);

      // Multi-axis tumbling rotation
      mesh.rotation.x += delta * cfg.rotSpeedX;
      mesh.rotation.y += delta * cfg.rotSpeedY;
      mesh.rotation.z += delta * cfg.rotSpeedZ;
    });

    // Gentle rotation of the overall coin group
    if (this.coinsGroup) {
      this.coinsGroup.rotation.y = this.mouse.x * 0.25;
      this.coinsGroup.rotation.x = -this.mouse.y * 0.2;
    }

    // Slowly drift particles
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.03;
      this.particles.rotation.x = elapsedTime * 0.015;
    }

    // Animate point light positions for dynamic rim reflections
    if (this.cyanRimLight) {
      this.cyanRimLight.position.x = -8 + Math.sin(elapsedTime * 0.7) * 2;
    }
    if (this.purpleRimLight) {
      this.purpleRimLight.position.y = -7 + Math.cos(elapsedTime * 0.6) * 2;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeCurrencyContainer');
  if (container) {
    window.currencyScene = new CurrencyScene3D('threeCurrencyContainer');
  }
});
