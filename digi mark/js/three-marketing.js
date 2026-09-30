/**
 * NEXX SOLUTIONS - 3D DIGITAL MARKETING VISUAL ENGINE
 * High-Performance Three.js 3D Composition:
 * - Floating 3D Live Analytics Dashboard with Animated Traffic Wave Graphs
 * - Floating Website Preview Card showing a Modern Landing Page
 * - Animated SEO Ranking Card (Google Top #1 Rankings & Organic Traffic)
 * - Digital Campaign & Multi-Channel Ads Performance Card (5.8x ROAS)
 * - 3D Floating Social Media Badges (Instagram, YouTube, LinkedIn, Facebook)
 * - Ascending 3D Growth Bar Chart with Glowing Arrow
 * - Glowing Connecting Data Streams & Drifting Ambient Particles
 * - Desktop Mouse-Based Parallax & Smooth Sinusoidal Floating Motion
 */

class NexxMarketingScene3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.showFallback();
      return;
    }

    if (!this.isWebGLAvailable()) {
      console.warn('WebGL not available, showing fallback poster.');
      this.showFallback();
      return;
    }

    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.animatedObjects = [];
    this.chartCanvas = null;
    this.chartCtx = null;
    this.chartTexture = null;

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
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 580;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.updateCameraPosition();

    // WebGL Renderer
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

    // Root Group
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    // Setup Lighting
    this.setupLighting();

    // Build 3D Visual Marketing Elements
    this.buildAnalyticsDashboard();
    this.buildWebsitePreviewCard();
    this.buildSeoRankingCard();
    this.buildAdCampaignCard();
    this.buildGrowthBarChart();
    this.buildSocialMediaIcons();
    this.buildConnectionLines();
    this.buildFloatingParticles();

    // Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Start Animation Loop
    this.animate();
  }

  updateCameraPosition() {
    const w = window.innerWidth;
    if (w <= 768) {
      this.camera.position.set(0, 0, 16.5);
    } else if (w <= 1024) {
      this.camera.position.set(0, 0, 15.0);
    } else {
      this.camera.position.set(0, 0, 13.5);
    }
    this.camera.lookAt(0, 0, 0);
  }

  setupLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Key Directional Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(6, 9, 10);
    this.scene.add(keyLight);

    // Electric Blue / Cyan Point Light
    this.cyanLight = new THREE.PointLight(0x00f0ff, 4.2, 35);
    this.cyanLight.position.set(-6, 3, 5);
    this.scene.add(this.cyanLight);

    // Vibrant Purple Point Light
    this.purpleLight = new THREE.PointLight(0x8b5cf6, 4.5, 35);
    this.purpleLight.position.set(6, -4, 5);
    this.scene.add(this.purpleLight);

    // Subtle Front Fill Light
    const fillLight = new THREE.PointLight(0x3b82f6, 1.8, 25);
    fillLight.position.set(0, 5, 8);
    this.scene.add(fillLight);
  }

  /* -------------------------------------------------------------------------
     1. Floating 3D Live Analytics Dashboard with Animated Traffic Graphs
     ------------------------------------------------------------------------- */
  buildAnalyticsDashboard() {
    this.chartCanvas = document.createElement('canvas');
    this.chartCanvas.width = 640;
    this.chartCanvas.height = 420;
    this.chartCtx = this.chartCanvas.getContext('2d');

    this.renderDashboardTexture(0);

    this.chartTexture = new THREE.CanvasTexture(this.chartCanvas);
    this.chartTexture.generateMipmaps = true;

    // Panel Geometry & Material
    const panelGeom = new THREE.BoxGeometry(4.8, 3.15, 0.12);
    const panelMat = new THREE.MeshStandardMaterial({
      map: this.chartTexture,
      roughness: 0.22,
      metalness: 0.75,
      transparent: true,
      opacity: 0.96
    });

    this.dashboardMesh = new THREE.Mesh(panelGeom, panelMat);
    this.dashboardMesh.position.set(-0.2, 0.45, 0.2);
    this.dashboardMesh.rotation.y = 0.12;
    this.dashboardMesh.rotation.x = -0.04;
    this.mainGroup.add(this.dashboardMesh);

    // Subtle Chrome Bezel Edge
    const edges = new THREE.EdgesGeometry(panelGeom);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    this.dashboardMesh.add(edgeLines);

    this.animatedObjects.push({
      mesh: this.dashboardMesh,
      baseY: 0.45,
      speed: 0.75,
      amplitude: 0.15,
      rotSpeedY: 0.02
    });
  }

  renderDashboardTexture(time) {
    const ctx = this.chartCtx;
    const w = 640;
    const h = 420;

    // Dark Luxury Glass Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0c122b');
    bgGrad.addColorStop(1, '#070b1c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Top Header Bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Poppins, sans-serif';
    ctx.fillText('NEXX SOLUTIONS ANALYTICS & REVENUE', 32, 44);

    // Live Badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.beginPath();
    ctx.roundRect(450, 24, 155, 28, 14);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(468, 38, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('LIVE ATTRIBUTION', 482, 42);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 66);
    ctx.lineTo(608, 66);
    ctx.stroke();

    // Metric 1: Monthly Visitors
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('TOTAL REACH & VISITORS', 32, 102);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Poppins, sans-serif';
    ctx.fillText('1.48M', 32, 142);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('▲ +38.4% MoM', 165, 138);

    // Metric 2: Conversion Rate & ROAS
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('AVG CONVERSION RATE', 340, 102);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px Poppins, sans-serif';
    ctx.fillText('7.8%', 340, 142);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('5.4x ROAS', 440, 138);

    // Dynamic Traffic Wave Chart
    const baseY = 350;
    const wavePoints = [];
    const count = 9;
    const step = (w - 70) / (count - 1);

    for (let i = 0; i < count; i++) {
      const px = 35 + i * step;
      // Procedural undulating heights simulating real-time traffic
      const curveHeight = [80, 110, 85, 160, 130, 200, 175, 230, 220][i];
      const dynamicOffset = Math.sin(time * 2.0 + i * 0.7) * 7;
      const py = baseY - curveHeight - dynamicOffset;
      wavePoints.push([px, py]);
    }

    // Chart Area Gradient Fill
    const areaGrad = ctx.createLinearGradient(0, 140, 0, baseY);
    areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    areaGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.1)');
    areaGrad.addColorStop(1, 'rgba(14, 22, 51, 0)');

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(35, baseY);
    wavePoints.forEach((pt, idx) => {
      if (idx === 0) ctx.lineTo(pt[0], pt[1]);
      else {
        const prev = wavePoints[idx - 1];
        const cx = (prev[0] + pt[0]) / 2;
        const cy = (prev[1] + pt[1]) / 2;
        ctx.quadraticCurveTo(prev[0], prev[1], cx, cy);
      }
    });
    ctx.lineTo(wavePoints[wavePoints.length - 1][0], wavePoints[wavePoints.length - 1][1]);
    ctx.lineTo(wavePoints[wavePoints.length - 1][0], baseY);
    ctx.closePath();
    ctx.fill();

    // Chart Line Curve
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    wavePoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt[0], pt[1]);
      else {
        const prev = wavePoints[idx - 1];
        const cx = (prev[0] + pt[0]) / 2;
        const cy = (prev[1] + pt[1]) / 2;
        ctx.quadraticCurveTo(prev[0], prev[1], cx, cy);
      }
    });
    ctx.lineTo(wavePoints[wavePoints.length - 1][0], wavePoints[wavePoints.length - 1][1]);
    ctx.stroke();

    // Chart Glowing Dots
    wavePoints.forEach((pt, idx) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 8, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Month Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'];
    months.forEach((m, idx) => {
      ctx.fillText(m, 30 + idx * step, 385);
    });
  }

  /* -------------------------------------------------------------------------
     2. Floating Website Preview Card Showing Modern Landing Page
     ------------------------------------------------------------------------- */
  buildWebsitePreviewCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 460;
    canvas.height = 310;
    const ctx = canvas.getContext('2d');

    // Browser Chrome Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 460, 310);

    // Browser Header Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 460, 42);

    // Window Dots (Red, Yellow, Green)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(22, 21, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(38, 21, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(54, 21, 5, 0, Math.PI * 2);
    ctx.fill();

    // URL Address Pill
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(85, 10, 270, 22, 6);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('🔒 https://nexxsolutions.com/growth', 100, 25);

    // Landing Page Hero Section
    ctx.fillStyle = '#0b0f1f';
    ctx.fillRect(0, 42, 460, 268);

    // Badge
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.roundRect(28, 62, 175, 20, 10);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px Poppins, sans-serif';
    ctx.fillText('● NEXT-GEN WEB DESIGN', 38, 76);

    // Headline Preview
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Poppins, sans-serif';
    ctx.fillText('Scalable Web Platforms', 28, 115);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Fast, responsive, and conversion-engineered.', 28, 138);

    // CTA Button Preview
    const btnGrad = ctx.createLinearGradient(28, 0, 180, 0);
    btnGrad.addColorStop(0, '#00d2ff');
    btnGrad.addColorStop(1, '#2563eb');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(28, 156, 140, 32, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Poppins, sans-serif';
    ctx.fillText('Launch Project →', 42, 176);

    // Preview Feature Cards inside Landing Page
    ctx.fillStyle = '#151d38';
    ctx.beginPath();
    ctx.roundRect(28, 208, 185, 80, 10);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px Poppins, sans-serif';
    ctx.fillText('Core Web Vitals: 99%', 42, 235);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText('✓ 0.4s Ultra-Fast Load', 42, 260);

    // Right Preview Card: Donut Mini Chart
    ctx.fillStyle = '#151d38';
    ctx.beginPath();
    ctx.roundRect(230, 80, 200, 208, 12);
    ctx.fill();

    // Mini Donut Chart
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(330, 165, 45, 0, Math.PI * 1.4);
    ctx.stroke();

    ctx.strokeStyle = '#00d2ff';
    ctx.beginPath();
    ctx.arc(330, 165, 45, Math.PI * 1.4, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('89%', 330, 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Conversion', 330, 180);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px Poppins, sans-serif';
    ctx.fillText('Mobile-First UX', 250, 255);

    const tex = new THREE.CanvasTexture(canvas);
    const geom = new THREE.BoxGeometry(3.3, 2.2, 0.08);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.25,
      metalness: 0.7,
      transparent: true,
      opacity: 0.95
    });

    this.webPreviewMesh = new THREE.Mesh(geom, mat);
    this.webPreviewMesh.position.set(-2.0, -1.15, 1.8);
    this.webPreviewMesh.rotation.y = 0.26;
    this.webPreviewMesh.rotation.x = -0.06;
    this.mainGroup.add(this.webPreviewMesh);

    this.animatedObjects.push({
      mesh: this.webPreviewMesh,
      baseY: -1.15,
      speed: 0.65,
      amplitude: 0.12,
      rotSpeedY: 0.03
    });
  }

  /* -------------------------------------------------------------------------
     3. Animated SEO Ranking Chart Card (Google Search Rankings)
     ------------------------------------------------------------------------- */
  buildSeoRankingCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 260;
    const ctx = canvas.getContext('2d');

    // Dark Background
    ctx.fillStyle = '#0c132c';
    ctx.fillRect(0, 0, 420, 260);

    // Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.fillText('🔍 GOOGLE SEARCH RANKINGS', 26, 38);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText('● ORGANIC REACH +240%', 220, 38);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(26, 54);
    ctx.lineTo(394, 54);
    ctx.stroke();

    // Ranked Keywords List
    const keywords = [
      { kw: 'Digital Marketing Agency', rank: '#1', change: '▲ +14' },
      { kw: 'Enterprise Web Development', rank: '#1', change: '▲ +8' },
      { kw: 'High-ROAS Google Ads Partner', rank: '#2', change: '▲ +19' }
    ];

    keywords.forEach((item, idx) => {
      const y = 92 + idx * 48;

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText(item.kw, 26, y);

      // Rank Badge
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px Poppins, sans-serif';
      ctx.fillText(item.rank, 305, y);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(item.change, 345, y);

      // Mini Progress Track
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(26, y + 10, 368, 4);

      const barGrad = ctx.createLinearGradient(26, 0, 340, 0);
      barGrad.addColorStop(0, '#2563eb');
      barGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = barGrad;
      ctx.fillRect(26, y + 10, [340, 310, 270][idx], 4);
    });

    const tex = new THREE.CanvasTexture(canvas);
    const geom = new THREE.BoxGeometry(3.1, 1.9, 0.08);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.25,
      metalness: 0.7,
      transparent: true,
      opacity: 0.94
    });

    this.seoCardMesh = new THREE.Mesh(geom, mat);
    this.seoCardMesh.position.set(2.0, 1.45, 1.3);
    this.seoCardMesh.rotation.y = -0.22;
    this.seoCardMesh.rotation.x = 0.05;
    this.mainGroup.add(this.seoCardMesh);

    this.animatedObjects.push({
      mesh: this.seoCardMesh,
      baseY: 1.45,
      speed: 0.8,
      amplitude: 0.14,
      rotSpeedY: -0.025
    });
  }

  /* -------------------------------------------------------------------------
     4. Floating Digital Advertising Campaign Card (Google & Meta Ads)
     ------------------------------------------------------------------------- */
  buildAdCampaignCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 380, 220);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px Poppins, sans-serif';
    ctx.fillText('GOOGLE & META AD CAMPAIGNS', 24, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Poppins, sans-serif';
    ctx.fillText('5.8x ROAS', 24, 82);

    ctx.fillStyle = '#10b981';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillText('● ACTIVE OPTIMIZATION', 24, 116);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('CTR: 4.9%  |  CPC: $0.48  |  LEADS: 2,840', 24, 152);

    // Bottom progress bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 175, 332, 10);

    const grad = ctx.createLinearGradient(24, 0, 300, 0);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#00f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(24, 175, 280, 10);

    const tex = new THREE.CanvasTexture(canvas);
    const geom = new THREE.BoxGeometry(2.8, 1.6, 0.08);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.93
    });

    this.adCardMesh = new THREE.Mesh(geom, mat);
    this.adCardMesh.position.set(1.9, -1.45, 1.4);
    this.adCardMesh.rotation.y = -0.16;
    this.adCardMesh.rotation.x = 0.08;
    this.mainGroup.add(this.adCardMesh);

    this.animatedObjects.push({
      mesh: this.adCardMesh,
      baseY: -1.45,
      speed: 0.7,
      amplitude: 0.12,
      rotSpeedY: 0.02
    });
  }

  /* -------------------------------------------------------------------------
     5. Ascending 3D Growth Bar Chart with Glowing Arrow
     ------------------------------------------------------------------------- */
  buildGrowthBarChart() {
    this.chartGroup = new THREE.Group();
    this.chartGroup.position.set(2.4, -2.1, -0.2);
    this.chartGroup.rotation.y = -0.32;

    const barData = [
      { height: 1.1, color: 0x8b5cf6 },
      { height: 1.7, color: 0x7c3aed },
      { height: 2.3, color: 0x6366f1 },
      { height: 3.1, color: 0x3b82f6 },
      { height: 4.2, color: 0x00f0ff }
    ];

    this.growthBars = [];

    barData.forEach((d, idx) => {
      const geom = new THREE.BoxGeometry(0.44, d.height, 0.44);
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        roughness: 0.2,
        metalness: 0.85,
        emissive: d.color,
        emissiveIntensity: 0.35
      });
      const bar = new THREE.Mesh(geom, mat);
      bar.position.set(idx * 0.65 - 1.3, d.height / 2, 0);
      this.chartGroup.add(bar);

      this.growthBars.push({ mesh: bar, baseHeight: d.height, phase: idx * 0.4 });
    });

    // Ascending Glowing 3D Curve Tube
    const lineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.3, 1.3, 0.25),
      new THREE.Vector3(-0.65, 1.9, 0.25),
      new THREE.Vector3(0, 2.6, 0.25),
      new THREE.Vector3(0.65, 3.4, 0.25),
      new THREE.Vector3(1.3, 4.6, 0.25)
    ]);

    const tubeGeom = new THREE.TubeGeometry(lineCurve, 32, 0.045, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    this.chartGroup.add(tubeMesh);

    // Glowing Arrowhead at top
    const coneGeom = new THREE.ConeGeometry(0.16, 0.42, 16);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const coneMesh = new THREE.Mesh(coneGeom, coneMat);
    coneMesh.position.set(1.3, 4.75, 0.25);
    coneMesh.rotation.z = -Math.PI * 0.22;
    this.chartGroup.add(coneMesh);

    this.mainGroup.add(this.chartGroup);
  }

  /* -------------------------------------------------------------------------
     6. Floating 3D Social Media Badges (Instagram, YouTube, LinkedIn, Facebook)
     ------------------------------------------------------------------------- */
  buildSocialMediaIcons() {
    const badgeGeom = new THREE.BoxGeometry(0.95, 0.95, 0.16);

    const configs = [
      // Instagram
      {
        name: 'instagram',
        pos: [2.9, 0.2, 2.1],
        draw: (ctx) => {
          const grad = ctx.createLinearGradient(0, 0, 256, 256);
          grad.addColorStop(0, '#f58529');
          grad.addColorStop(0.5, '#dd2a7b');
          grad.addColorStop(1, '#8134af');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 256, 256);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 18;
          ctx.beginPath();
          ctx.roundRect(40, 40, 176, 176, 44);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(128, 128, 46, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(180, 76, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      // YouTube
      {
        name: 'youtube',
        pos: [-2.6, 1.8, 1.2],
        draw: (ctx) => {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, 0, 256, 256);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(96, 70);
          ctx.lineTo(180, 128);
          ctx.lineTo(96, 186);
          ctx.closePath();
          ctx.fill();
        }
      },
      // LinkedIn
      {
        name: 'linkedin',
        pos: [0.8, 2.4, 0.8],
        draw: (ctx) => {
          ctx.fillStyle = '#0a66c2';
          ctx.fillRect(0, 0, 256, 256);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 150px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('in', 128, 124);
        }
      },
      // Facebook
      {
        name: 'facebook',
        pos: [-1.4, -2.1, 1.6],
        draw: (ctx) => {
          ctx.fillStyle = '#1877f2';
          ctx.fillRect(0, 0, 256, 256);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 180px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('f', 140, 134);
        }
      }
    ];

    configs.forEach((cfg, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      cfg.draw(canvas.getContext('2d'));

      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.6,
        roughness: 0.25,
        emissive: 0x111633,
        emissiveIntensity: 0.25
      });

      const mesh = new THREE.Mesh(badgeGeom, mat);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      this.mainGroup.add(mesh);

      this.animatedObjects.push({
        mesh,
        baseY: cfg.pos[1],
        speed: 0.85 + idx * 0.15,
        amplitude: 0.14,
        rotSpeedX: 0.25 * (idx % 2 === 0 ? 1 : -1),
        rotSpeedY: 0.35
      });
    });
  }

  /* -------------------------------------------------------------------------
     7. Glowing Connection Lines Between Marketing Nodes
     ------------------------------------------------------------------------- */
  buildConnectionLines() {
    const curvePoints1 = [
      [-2.0, -1.15, 1.8],
      [-0.8, -0.2, 1.2],
      [-0.2, 0.45, 0.2],
      [1.0, 0.9, 0.8],
      [2.0, 1.45, 1.3]
    ];

    const vectors1 = curvePoints1.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve1 = new THREE.CatmullRomCurve3(vectors1);

    const tubeGeom1 = new THREE.TubeGeometry(curve1, 40, 0.02, 8, false);
    const tubeMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45
    });

    const lineMesh1 = new THREE.Mesh(tubeGeom1, tubeMat1);
    this.mainGroup.add(lineMesh1);

    const curvePoints2 = [
      [-0.2, 0.45, 0.2],
      [1.0, -0.5, 0.9],
      [1.9, -1.45, 1.4]
    ];

    const vectors2 = curvePoints2.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve2 = new THREE.CatmullRomCurve3(vectors2);

    const tubeGeom2 = new THREE.TubeGeometry(curve2, 30, 0.018, 8, false);
    const tubeMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45
    });

    const lineMesh2 = new THREE.Mesh(tubeGeom2, tubeMat2);
    this.mainGroup.add(lineMesh2);
  }

  /* -------------------------------------------------------------------------
     8. Floating Ambient Stardust Particles
     ------------------------------------------------------------------------- */
  buildFloatingParticles() {
    const count = 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cCyan = new THREE.Color(0x00f0ff);
    const cPurple = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 22;
      positions[i3 + 1] = (Math.random() - 0.5) * 16;
      positions[i3 + 2] = (Math.random() - 0.5) * 12;

      const c = Math.random() < 0.6 ? cCyan : cPurple;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    this.mouse.targetX = Math.max(-1, Math.min(1, nx)) * 0.45;
    this.mouse.targetY = Math.max(-1, Math.min(1, ny)) * 0.35;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 580;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.updateCameraPosition();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Mouse Parallax Lerping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (this.camera) {
      this.camera.position.x = this.mouse.x * 1.5;
      this.camera.position.y = this.mouse.y * 1.1;
      this.camera.lookAt(0, 0, 0);
    }

    // Refresh Traffic Chart on Dashboard Texture every ~8 frames
    if (this.chartTexture && Math.floor(elapsed * 60) % 8 === 0) {
      this.renderDashboardTexture(elapsed);
      this.chartTexture.needsUpdate = true;
    }

    // Animate Upward Growth Bars
    if (this.growthBars) {
      this.growthBars.forEach(b => {
        const factor = 1 + Math.sin(elapsed * 2.2 + b.phase) * 0.12;
        b.mesh.scale.y = factor;
      });
    }

    // Floating sinusoidal animation on 3D elements
    this.animatedObjects.forEach(obj => {
      obj.mesh.position.y = obj.baseY + Math.sin(elapsed * obj.speed) * obj.amplitude;
      if (obj.rotSpeedX) obj.mesh.rotation.x += delta * obj.rotSpeedX;
      if (obj.rotSpeedY) obj.mesh.rotation.y += delta * obj.rotSpeedY;
    });

    // Ambient Particle drift
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.02;
    }

    // Moving dynamic lights
    if (this.cyanLight) {
      this.cyanLight.position.x = -6 + Math.sin(elapsed * 0.8) * 1.5;
    }
    if (this.purpleLight) {
      this.purpleLight.position.y = -4 + Math.cos(elapsed * 0.7) * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto Initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeMarketingContainer') || document.getElementById('threeCurrencyContainer');
  if (container) {
    window.marketingScene = new NexxMarketingScene3D(container.id);
  }
});
