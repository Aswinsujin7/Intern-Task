/**
 * Ammuni Construction - Cinematic 60 FPS Animated Construction Video Engine
 * Simulates complete ground-up building process:
 * 1. Excavation -> 2. Foundation -> 3. Structural Frame -> 4. Masonry -> 5. Modern Façade -> 6. Handover
 */

class ConstructionVideoEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.duration = 48; // Total video duration in seconds
        this.currentTime = 0;
        this.isPlaying = true;
        this.playbackRate = 1.0;
        this.lastTimestamp = null;
        this.isMuted = true;
        
        // Sound System (Web Audio API)
        this.audioCtx = null;
        this.droneOsc = null;
        this.droneGain = null;
        
        // Phase definitions
        this.phases = [
            { id: 1, name: "Site Excavation & Survey", start: 0, end: 8, label: "Excavation", telemetry: { depth: "-4.2 m", material: "Sub-base Soil Test", status: "Survey In Progress", safety: "100%" } },
            { id: 2, name: "Reinforced Footings & Foundation", start: 8, end: 16, label: "Foundation", telemetry: { depth: "-2.0 m", material: "M25 Grade RMC Concrete", status: "Anti-Seismic Piling", safety: "100%" } },
            { id: 3, name: "Structural Steel & Pillar Frame", start: 16, end: 25, label: "Frame", telemetry: { depth: "+4.5 m", material: "Fe500D TMT Steel Columns", status: "Tower Crane Active", safety: "100%" } },
            { id: 4, name: "Floor Slabs & AAC Masonry", start: 25, end: 33, label: "Masonry", telemetry: { depth: "+8.2 m", material: "Autoclaved Aerated Blocks", status: "Floor Slab Curing", safety: "100%" } },
            { id: 5, name: "Modern Glass Façade & Cladding", start: 33, end: 41, label: "Façade", telemetry: { depth: "+11.5 m", material: "Double-Glazed Low-E Glass", status: "Architectural Louvers", safety: "100%" } },
            { id: 6, name: "Landscaping, Lights & Handover", start: 41, end: 48, label: "Handover", telemetry: { depth: "+12.8 m", material: "Turnkey Finishing", status: "Inspection Passed & Ready", safety: "100%" } }
        ];

        this.isMini = options.isMini || false;

        // Particles (dust, sparks, crane wires)
        this.particles = [];
        this.initParticles();

        // High DPI Canvas setup
        this.setupDPI();
        window.addEventListener('resize', () => this.setupDPI());

        // Setup UI hooks (only for main player)
        if (!this.isMini) {
            this.initUI();
        }

        // Start render loop
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    setupDPI() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = rect.width || 960;
        this.height = rect.height || 540;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < 45; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2.5 + 1,
                speedX: (Math.random() - 0.5) * 0.001,
                speedY: -Math.random() * 0.0015 - 0.0005,
                opacity: Math.random() * 0.6 + 0.2,
                type: Math.random() > 0.6 ? 'spark' : 'dust'
            });
        }
    }

    initUI() {
        // Play / Pause toggles
        this.playBtn = document.getElementById('playPauseBtn');
        this.bigPlayOverlay = document.getElementById('bigPlayOverlay');
        this.timeDisplay = document.getElementById('currentTimeDisplay');
        this.progressBar = document.getElementById('timelineProgress');
        this.timelineHandle = document.getElementById('timelineHandle');
        this.timelineWrapper = document.getElementById('timelineWrapper');
        this.speedBtn = document.getElementById('speedBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.downloadBtn = document.getElementById('downloadVideoBtn');
        this.stageNameHUD = document.getElementById('stageNameHUD');
        this.currentPhaseHUD = document.getElementById('currentPhaseHUD');
        this.telemetryGrid = {
            stage: document.getElementById('t-stage'),
            elevation: document.getElementById('t-elevation'),
            material: document.getElementById('t-material'),
            safety: document.getElementById('t-safety')
        };

        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
        if (this.bigPlayOverlay) {
            this.bigPlayOverlay.addEventListener('click', () => this.togglePlay());
        }
        this.canvas.addEventListener('click', () => this.togglePlay());

        // Timeline Scrubbing
        if (this.timelineWrapper) {
            let isDragging = false;
            const handleSeek = (e) => {
                const rect = this.timelineWrapper.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                this.seekTo(pos * this.duration);
            };
            this.timelineWrapper.addEventListener('mousedown', (e) => {
                isDragging = true;
                handleSeek(e);
            });
            window.addEventListener('mousemove', (e) => {
                if (isDragging) handleSeek(e);
            });
            window.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }

        // Speed toggle (0.5x, 1x, 2x)
        if (this.speedBtn) {
            this.speedBtn.addEventListener('click', () => {
                if (this.playbackRate === 1.0) this.playbackRate = 2.0;
                else if (this.playbackRate === 2.0) this.playbackRate = 0.5;
                else this.playbackRate = 1.0;
                this.speedBtn.textContent = `${this.playbackRate}x`;
            });
        }

        // Sound toggle
        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', () => this.toggleSound());
        }

        // Fullscreen
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => {
                const container = document.getElementById('videoPlayerContainer');
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(err => alert("Fullscreen not supported"));
                } else {
                    document.exitFullscreen();
                }
            });
        }

        // Phase buttons
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phaseNum = parseInt(btn.getAttribute('data-phase'));
                const phase = this.phases[phaseNum - 1];
                if (phase) {
                    this.seekTo(phase.start + 0.1);
                    if (!this.isPlaying) this.play();
                }
            });
        });

        // Download Video (MediaRecorder)
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.recordAndDownloadVideo());
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.lastTimestamp = null;
        if (this.playBtn) this.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        if (this.bigPlayOverlay) this.bigPlayOverlay.classList.remove('visible');
        if (!this.isMuted) this.playAmbientDrone();
    }

    pause() {
        this.isPlaying = false;
        if (this.playBtn) this.playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (this.bigPlayOverlay) this.bigPlayOverlay.classList.add('visible');
        if (this.droneGain) {
            this.droneGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);
        }
    }

    seekTo(seconds) {
        this.currentTime = Math.max(0, Math.min(this.duration, seconds));
        this.updateUI();
    }

    getCurrentPhase() {
        for (let i = 0; i < this.phases.length; i++) {
            if (this.currentTime >= this.phases[i].start && this.currentTime < this.phases[i].end) {
                return { ...this.phases[i], index: i };
            }
        }
        return { ...this.phases[this.phases.length - 1], index: this.phases.length - 1 };
    }

    toggleSound() {
        if (this.isMuted) {
            this.isMuted = false;
            this.initAudio();
            this.playAmbientDrone();
            if (this.soundBtn) {
                this.soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                this.soundBtn.classList.add('active');
            }
        } else {
            this.isMuted = true;
            if (this.droneGain) {
                this.droneGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);
            }
            if (this.soundBtn) {
                this.soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                this.soundBtn.classList.remove('active');
            }
        }
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playAmbientDrone() {
        if (this.isMuted || !this.audioCtx) return;
        try {
            if (!this.droneOsc) {
                this.droneOsc = this.audioCtx.createOscillator();
                this.droneGain = this.audioCtx.createGain();
                
                // Deep architectural resonant hum
                this.droneOsc.type = 'triangle';
                this.droneOsc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
                
                this.droneGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
                this.droneOsc.connect(this.droneGain);
                this.droneGain.connect(this.audioCtx.destination);
                this.droneOsc.start();
            } else {
                this.droneGain.gain.setTargetAtTime(0.04, this.audioCtx.currentTime, 0.1);
            }
        } catch (e) {
            console.log("Audio init pending interaction");
        }
    }

    playPhaseChime() {
        if (this.isMuted || !this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, this.audioCtx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.45);
        } catch (e) {}
    }

    // ==========================================
    // RENDER LOOP & DRAWING ENGINE
    // ==========================================
    renderLoop(timestamp) {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const delta = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        if (this.isPlaying) {
            const previousPhase = this.getCurrentPhase().id;
            this.currentTime += delta * this.playbackRate;
            
            if (this.currentTime >= this.duration) {
                this.currentTime = 0; // Loop seamlessly
            }
            
            const currentPhase = this.getCurrentPhase().id;
            if (currentPhase !== previousPhase) {
                this.playPhaseChime();
            }

            this.updateUI();
        }

        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && Math.abs(rect.width - this.width) > 4) {
            this.setupDPI();
        }

        this.drawScene();
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    updateUI() {
        const progress = (this.currentTime / this.duration) * 100;
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;
        if (this.timelineHandle) this.timelineHandle.style.left = `${progress}%`;

        // Update time display: 00:14 / 00:48
        if (this.timeDisplay) {
            const curM = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
            const curS = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
            const totM = Math.floor(this.duration / 60).toString().padStart(2, '0');
            const totS = Math.floor(this.duration % 60).toString().padStart(2, '0');
            this.timeDisplay.innerHTML = `<span class="current-time">${curM}:${curS}</span> / ${totM}:${totS}`;
        }

        // Phase HUD & Badges
        const currentPhase = this.getCurrentPhase();
        if (this.stageNameHUD) {
            this.stageNameHUD.textContent = currentPhase.name;
        }
        if (this.currentPhaseHUD) {
            this.currentPhaseHUD.textContent = `PHASE 0${currentPhase.id} / 06`;
        }

        // Update Telemetry grid
        if (this.telemetryGrid.stage) this.telemetryGrid.stage.textContent = `Stage 0${currentPhase.id}: ${currentPhase.label}`;
        if (this.telemetryGrid.elevation) this.telemetryGrid.elevation.textContent = currentPhase.telemetry.depth;
        if (this.telemetryGrid.material) this.telemetryGrid.material.textContent = currentPhase.telemetry.material;
        if (this.telemetryGrid.safety) this.telemetryGrid.safety.textContent = currentPhase.telemetry.safety;

        // Phase buttons highlight
        document.querySelectorAll('.phase-btn').forEach(btn => {
            const p = parseInt(btn.getAttribute('data-phase'));
            if (p === currentPhase.id) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    drawScene() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const phase = this.getCurrentPhase();
        const progressInPhase = Math.max(0, Math.min(1, (this.currentTime - phase.start) / (phase.end - phase.start)));
        const overallProgress = this.currentTime / this.duration;

        ctx.clearRect(0, 0, w, h);

        // 1. DYNAMIC SKY & AMBIENT LIGHT (Day -> Golden Sunset -> Luxury Twilight in Phase 6)
        this.drawSky(ctx, w, h, overallProgress);

        // 2. BACKGROUND ARCHITECTURAL GRID & DISTANT CITYLINE
        this.drawDistantEnvironment(ctx, w, h, overallProgress);

        // 3. GROUND / TERRAIN / EXCAVATION TRENCH
        this.drawGround(ctx, w, h, overallProgress, progressInPhase);

        // 4. MAIN BUILDING CONSTRUCTION BY PHASES
        this.drawConstructionStructure(ctx, w, h, overallProgress, progressInPhase);

        // 5. TOWER CRANE & ACTIVE WINCH (Active during framing & masonry)
        this.drawTowerCrane(ctx, w, h, overallProgress);

        // 6. ATMOSPHERIC PARTICLES & DUST
        this.drawAtmosphere(ctx, w, h, overallProgress);

        // 7. CINEMATIC OVERLAYS & BLUEPRINT GUIDELINES
        this.drawCinematicHUD(ctx, w, h, overallProgress, phase);
    }

    // Sky gradient with sun arc and dusk transition
    drawSky(ctx, w, h, progress) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
        
        if (progress < 0.65) {
            // Bright clear construction daytime
            skyGrad.addColorStop(0, '#7eb6e8');
            skyGrad.addColorStop(0.5, '#bce1fa');
            skyGrad.addColorStop(1, '#eaf4fc');
        } else if (progress < 0.85) {
            // Warm golden hour
            const t = (progress - 0.65) / 0.2;
            skyGrad.addColorStop(0, this.lerpColor('#7eb6e8', '#e66b44', t));
            skyGrad.addColorStop(0.5, this.lerpColor('#bce1fa', '#f7ad59', t));
            skyGrad.addColorStop(1, this.lerpColor('#eaf4fc', '#fde4b8', t));
        } else {
            // Luxury twilight / dusk with deep cobalt & starry night
            const t = (progress - 0.85) / 0.15;
            skyGrad.addColorStop(0, this.lerpColor('#e66b44', '#0d1624', t));
            skyGrad.addColorStop(0.6, this.lerpColor('#f7ad59', '#1a273b', t));
            skyGrad.addColorStop(1, this.lerpColor('#fde4b8', '#2a3b50', t));
        }

        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.75);

        // Sun / Moon representation
        const sunX = w * (0.15 + progress * 0.7);
        const sunY = h * 0.15 + Math.sin(progress * Math.PI) * (-20);

        if (progress < 0.85) {
            // Sun glow
            const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 80);
            sunGlow.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
            sunGlow.addColorStop(0.3, 'rgba(254, 180, 50, 0.45)');
            sunGlow.addColorStop(1, 'rgba(254, 180, 50, 0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
            ctx.fill();

            // Sun Core
            ctx.fillStyle = '#fffdf0';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 14, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Twilight Moon & Stars
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
            ctx.fill();

            // Stars in twilight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 15; i++) {
                const sx = (w * 0.08 * i + 40) % w;
                const sy = (h * 0.04 * (i * 3 + 2)) % (h * 0.4);
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }
        }
    }

    drawDistantEnvironment(ctx, w, h, progress) {
        // Blueprint background grid overlay
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h * 0.72);
            ctx.stroke();
        }
        for (let y = 0; y < h * 0.72; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.restore();

        // Distant mountains / greenery silhouettes
        ctx.fillStyle = progress > 0.85 ? '#111a24' : '#88989f';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.72);
        ctx.lineTo(0, h * 0.62);
        ctx.quadraticCurveTo(w * 0.25, h * 0.58, w * 0.5, h * 0.63);
        ctx.quadraticCurveTo(w * 0.75, h * 0.68, w, h * 0.61);
        ctx.lineTo(w, h * 0.72);
        ctx.closePath();
        ctx.fill();
    }

    drawGround(ctx, w, h, overallProgress, pInPhase) {
        const groundY = h * 0.72;

        // Ground layer (Soil / Concrete foundation bed / Lush lawn at handover)
        if (overallProgress < 0.83) {
            // Construction earth & soil
            const soilGrad = ctx.createLinearGradient(0, groundY, 0, h);
            soilGrad.addColorStop(0, '#594433');
            soilGrad.addColorStop(0.3, '#433123');
            soilGrad.addColorStop(1, '#2c1e13');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(0, groundY, w, h - groundY);

            // Ground gravel texture
            ctx.strokeStyle = '#6e5642';
            ctx.lineWidth = 2;
            for (let i = 0; i < w; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, groundY);
                ctx.lineTo(i + 8, groundY + 4);
                ctx.stroke();
            }

            // In Phase 1: Excavation pit
            if (overallProgress < 0.17) {
                const excavateDepth = (overallProgress / 0.17) * 48;
                ctx.fillStyle = '#26190e';
                ctx.fillRect(w * 0.28, groundY, w * 0.44, excavateDepth);

                // Laser level line
                ctx.strokeStyle = '#ff3b30';
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(w * 0.24, groundY + excavateDepth);
                ctx.lineTo(w * 0.76, groundY + excavateDepth);
                ctx.stroke();
                ctx.setLineDash([]);

                // Survey measurement flag
                ctx.fillStyle = '#fe932c';
                ctx.fillRect(w * 0.26, groundY - 30, 3, 30 + excavateDepth);
                ctx.fillStyle = '#ff3333';
                ctx.beginPath();
                ctx.moveTo(w * 0.26 + 3, groundY - 30);
                ctx.lineTo(w * 0.26 + 22, groundY - 22);
                ctx.lineTo(w * 0.26 + 3, groundY - 14);
                ctx.closePath();
                ctx.fill();

                // Telemetry text inside pit
                ctx.fillStyle = '#ff8844';
                ctx.font = '10px monospace';
                ctx.fillText(`EXCAVATION DEPTH: -${(excavateDepth / 10).toFixed(1)}m`, w * 0.32, groundY + excavateDepth - 8);
            }
        } else {
            // Phase 6: Landscaping Handover (Lush green lawn & modern driveway paving)
            const t = (overallProgress - 0.83) / 0.17;
            
            // Modern driveway pavers (left side)
            ctx.fillStyle = '#2b3036';
            ctx.fillRect(0, groundY, w, h - groundY);

            // Green turf lawn
            const lawnGrad = ctx.createLinearGradient(0, groundY, 0, h);
            lawnGrad.addColorStop(0, '#2e6b36');
            lawnGrad.addColorStop(1, '#1b4721');
            ctx.fillStyle = lawnGrad;
            ctx.fillRect(w * 0.2, groundY, w * 0.6, h - groundY);

            // Modern stone walkway tiles
            ctx.fillStyle = '#485058';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(w * 0.44 + i * 22, groundY + 12 + i * 14, 38, 10);
            }

            // Modern landscape trees / palms
            this.drawPalmTree(ctx, w * 0.16, groundY, 1.1);
            this.drawPalmTree(ctx, w * 0.82, groundY, 1.2);
            this.drawShrubs(ctx, w * 0.22, groundY);
            this.drawShrubs(ctx, w * 0.74, groundY);
        }
    }

    drawConstructionStructure(ctx, w, h, overallProgress, pInPhase) {
        const groundY = h * 0.72;
        const bX = w * 0.30;
        const bW = w * 0.40;
        const floorH = 68;

        // Base foundation coordinates
        const fY = groundY;
        const f1Y = fY - floorH;
        const f2Y = f1Y - floorH;
        const roofY = f2Y - 24;

        // -------------------------------------------------------------
        // PHASE 2+: REINFORCED CONCRETE BASE & FOOTINGS (16%+)
        // -------------------------------------------------------------
        if (overallProgress >= 0.14) {
            const foundationT = Math.min(1, (overallProgress - 0.14) / 0.10);
            const footingH = 26 * foundationT;

            // Concrete raft slab
            ctx.fillStyle = '#7a8288';
            ctx.fillRect(bX - 12, groundY - footingH + 12, bW + 24, footingH);

            // Steel rebar mesh lines
            ctx.strokeStyle = '#a65922';
            ctx.lineWidth = 2;
            for (let rx = bX - 8; rx < bX + bW + 8; rx += 20) {
                ctx.beginPath();
                ctx.moveTo(rx, groundY - footingH + 12);
                ctx.lineTo(rx, groundY + 12);
                ctx.stroke();
            }

            // Heavy foundation pedestals
            ctx.fillStyle = '#5c646b';
            for (let i = 0; i < 5; i++) {
                const colX = bX + (bW / 4) * i;
                ctx.fillRect(colX - 10, groundY - footingH + 2, 20, 16);
            }
        }

        // -------------------------------------------------------------
        // PHASE 3+: STRUCTURAL STEEL & CONCRETE COLUMNS (33%+)
        // -------------------------------------------------------------
        if (overallProgress >= 0.30) {
            const frameT = Math.min(1, (overallProgress - 0.30) / 0.16);

            // Pillar columns (Ground Floor & First Floor)
            const numCols = 5;
            for (let i = 0; i < numCols; i++) {
                const colX = bX + (bW / (numCols - 1)) * i;

                // Ground floor column rising
                const gColH = floorH * Math.min(1, frameT * 1.5);
                ctx.fillStyle = overallProgress < 0.65 ? '#808a91' : '#49535c';
                ctx.fillRect(colX - 7, groundY - gColH, 14, gColH);

                // Steel rebar extending out of columns before slab
                if (frameT < 0.9) {
                    ctx.strokeStyle = '#fe932c';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(colX - 3, groundY - gColH);
                    ctx.lineTo(colX - 3, groundY - gColH - 12);
                    ctx.moveTo(colX + 3, groundY - gColH);
                    ctx.lineTo(colX + 3, groundY - gColH - 12);
                    ctx.stroke();
                }

                // First floor column rising
                if (frameT > 0.4) {
                    const fColT = Math.min(1, (frameT - 0.4) / 0.6);
                    const fColH = floorH * fColT;
                    ctx.fillStyle = overallProgress < 0.65 ? '#808a91' : '#49535c';
                    ctx.fillRect(colX - 6, f1Y - fColH, 12, fColH);
                }
            }

            // Floor 1 Slab (Reinforced concrete beam)
            if (frameT > 0.35) {
                const slab1T = Math.min(1, (frameT - 0.35) / 0.35);
                ctx.fillStyle = '#656f75';
                ctx.fillRect(bX - 10, f1Y, (bW + 20) * slab1T, 14);
            }

            // Floor 2 / Terrace Slab
            if (frameT > 0.75) {
                const slab2T = Math.min(1, (frameT - 0.75) / 0.25);
                ctx.fillStyle = '#5c646b';
                ctx.fillRect(bX - 14, f2Y, (bW + 28) * slab2T, 14);
            }
        }

        // -------------------------------------------------------------
        // PHASE 4+: MASONRY BRICKWORK & INTERIOR WALLS (50%+)
        // -------------------------------------------------------------
        if (overallProgress >= 0.48) {
            const brickT = Math.min(1, (overallProgress - 0.48) / 0.16);

            // Ground floor AAC block brickwork
            this.drawBrickSection(ctx, bX + 6, groundY - floorH + 14, bW * 0.32, floorH - 14, brickT);
            this.drawBrickSection(ctx, bX + bW * 0.62, groundY - floorH + 14, bW * 0.32, floorH - 14, brickT);

            // First floor brickwork
            if (brickT > 0.3) {
                const fBrickT = Math.min(1, (brickT - 0.3) / 0.7);
                this.drawBrickSection(ctx, bX + bW * 0.15, f2Y + 14, bW * 0.4, floorH - 14, fBrickT);
                this.drawBrickSection(ctx, bX + bW * 0.72, f2Y + 14, bW * 0.24, floorH - 14, fBrickT);
            }

            // Scaffolding on exterior (Visible during phases 4 & 5)
            if (overallProgress < 0.82) {
                this.drawScaffolding(ctx, bX - 22, roofY - 10, bW + 44, groundY - roofY + 10);
            }
        }

        // -------------------------------------------------------------
        // PHASE 5+: MODERN ARCHITECTURAL FAÇADE & GLASS (66%+)
        // -------------------------------------------------------------
        if (overallProgress >= 0.66) {
            const facadeT = Math.min(1, (overallProgress - 0.66) / 0.17);

            // Smooth exterior rendering (Architectural pearl off-white & charcoal)
            ctx.fillStyle = '#e8ecee';
            ctx.fillRect(bX - 6, f2Y, bW * 0.48, floorH * 2);

            // Modern upper dark-volume cantilever
            ctx.fillStyle = '#202428';
            ctx.fillRect(bX + bW * 0.38, f2Y - 10, bW * 0.65, floorH + 16);

            // Luxury Teakwood architectural louvers / slats
            ctx.fillStyle = '#b36b32';
            for (let i = 0; i < 18; i++) {
                ctx.fillRect(bX + bW * 0.40 + i * 8, f2Y - 4, 4, floorH + 4);
            }

            // Modern Cantilevered Roof Canopy & Pergola
            ctx.fillStyle = '#16191c';
            ctx.fillRect(bX - 20, roofY - 14, bW + 40, 12);
            // Pergola beams
            for (let pb = bX - 16; pb < bX + bW + 20; pb += 22) {
                ctx.fillRect(pb, roofY - 24, 6, 12);
            }

            // Floor-to-Ceiling Panoramic Glass Windows (Ground & 1st Floor)
            const isNight = overallProgress >= 0.85;

            // Ground floor master glass facade
            this.drawArchitecturalGlass(ctx, bX + bW * 0.34, groundY - floorH + 12, bW * 0.28, floorH - 16, isNight, overallProgress);
            this.drawArchitecturalGlass(ctx, bX + 10, groundY - floorH + 12, bW * 0.22, floorH - 16, isNight, overallProgress);

            // Upper floor panoramic master suite glass
            this.drawArchitecturalGlass(ctx, bX + bW * 0.62, f2Y + 4, bW * 0.38, floorH - 8, isNight, overallProgress);

            // Balcony with sleek glass railings
            ctx.fillStyle = 'rgba(215, 235, 245, 0.45)';
            ctx.fillRect(bX + bW * 0.58, f1Y - 18, bW * 0.44, 20);
            ctx.strokeStyle = '#c4d8e2';
            ctx.lineWidth = 2;
            ctx.strokeRect(bX + bW * 0.58, f1Y - 18, bW * 0.44, 20);

            // Luxury Entrance Door (Dark walnut wood with brushed gold handle)
            ctx.fillStyle = '#26170d';
            ctx.fillRect(bX + bW * 0.30, groundY - 48, 22, 48);
            ctx.fillStyle = '#fe932c';
            ctx.fillRect(bX + bW * 0.30 + 17, groundY - 28, 2, 10); // Handle
        }

        // -------------------------------------------------------------
        // PHASE 6+: HANDOVER, LIGHTING & CERTIFICATION (83%+)
        // -------------------------------------------------------------
        if (overallProgress >= 0.83) {
            const handoverT = Math.min(1, (overallProgress - 0.83) / 0.17);

            // Exterior architectural warm ambient lights
            this.drawExteriorWallLights(ctx, bX + 6, groundY - floorH - 10);
            this.drawExteriorWallLights(ctx, bX + bW * 0.32, groundY - 55);
            this.drawExteriorWallLights(ctx, bX + bW * 0.95, f1Y + 10);

            // Ground driveway bollard lights
            for (let b = 0; b < 4; b++) {
                const bx = w * 0.42 + b * 24;
                const by = groundY + 16 + b * 12;
                ctx.fillStyle = '#1c2024';
                ctx.fillRect(bx, by - 12, 4, 12);
                // Warm light glow
                const glow = ctx.createRadialGradient(bx + 2, by - 10, 1, bx + 2, by - 10, 16);
                glow.addColorStop(0, 'rgba(254, 180, 50, 0.9)');
                glow.addColorStop(1, 'rgba(254, 180, 50, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(bx + 2, by - 10, 16, 0, Math.PI * 2);
                ctx.fill();
            }

            // Ammuni Construction completed plaque on boundary wall
            ctx.fillStyle = '#111417';
            ctx.fillRect(bX - 24, groundY - 32, 28, 32);
            ctx.fillStyle = '#fe932c';
            ctx.font = 'bold 7px sans-serif';
            ctx.fillText('AMMUNI', bX - 23, groundY - 18);
            ctx.fillStyle = '#fff';
            ctx.font = '5px sans-serif';
            ctx.fillText('BUILT 2024', bX - 23, groundY - 10);

            // Big Celebratory Ribbon & Certification Badge (at near end)
            if (handoverT > 0.4) {
                const badgeOpacity = Math.min(1, (handoverT - 0.4) / 0.3);
                ctx.save();
                ctx.globalAlpha = badgeOpacity;

                // Center floating Gold Certificate Emblem
                const badgeX = w * 0.5;
                const badgeY = f1Y - 10;
                
                // Glowing backdrop
                const badgeGlow = ctx.createRadialGradient(badgeX, badgeY, 10, badgeX, badgeY, 120);
                badgeGlow.addColorStop(0, 'rgba(254, 147, 44, 0.35)');
                badgeGlow.addColorStop(1, 'rgba(254, 147, 44, 0)');
                ctx.fillStyle = badgeGlow;
                ctx.beginPath();
                ctx.arc(badgeX, badgeY, 120, 0, Math.PI * 2);
                ctx.fill();

                // Banner Pill
                ctx.fillStyle = 'rgba(17, 20, 23, 0.92)';
                ctx.strokeStyle = '#fe932c';
                ctx.lineWidth = 2;
                const pillW = 280;
                const pillH = 46;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(badgeX - pillW / 2, badgeY - pillH / 2, pillW, pillH, 8);
                } else {
                    ctx.rect(badgeX - pillW / 2, badgeY - pillH / 2, pillW, pillH);
                }
                ctx.fill();
                ctx.stroke();

                // Star & Title text
                ctx.fillStyle = '#fe932c';
                ctx.font = 'bold 13px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('★ PROJECT 100% COMPLETE & VERIFIED ★', badgeX, badgeY - 5);

                ctx.fillStyle = '#ffffff';
                ctx.font = '11px Inter, sans-serif';
                ctx.fillText('Ammuni Construction • Turnkey Handover Ready', badgeX, badgeY + 13);
                ctx.textAlign = 'left';

                ctx.restore();
            }
        }
    }

    // Helper: Draw animated brick rows
    drawBrickSection(ctx, x, y, width, height, progress) {
        ctx.save();
        ctx.fillStyle = '#c76644';
        const rowH = 9;
        const totalRows = Math.floor(height / rowH);
        const rowsToDraw = Math.floor(totalRows * progress);

        for (let r = 0; r < rowsToDraw; r++) {
            const ry = y + height - (r + 1) * rowH;
            const offset = (r % 2 === 0) ? 0 : 8;
            for (let bx = x - offset; bx < x + width; bx += 18) {
                const drawX = Math.max(x, bx);
                const drawW = Math.min(x + width - drawX, 16);
                if (drawW > 0) {
                    ctx.fillStyle = (r + bx) % 3 === 0 ? '#b85837' : '#cf6b48';
                    ctx.fillRect(drawX, ry, drawW, rowH - 1);
                }
            }
            // Mortar line
            ctx.fillStyle = '#ded9d5';
            ctx.fillRect(x, ry + rowH - 1, width, 1);
        }
        ctx.restore();
    }

    // Helper: Draw realistic scaffolding
    drawScaffolding(ctx, x, y, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(160, 168, 173, 0.65)';
        ctx.lineWidth = 1.5;
        const colSpacing = 36;
        const rowSpacing = 28;

        for (let sx = x; sx <= x + width; sx += colSpacing) {
            ctx.beginPath();
            ctx.moveTo(sx, y);
            ctx.lineTo(sx, y + height);
            ctx.stroke();
        }

        for (let sy = y; sy <= y + height; sy += rowSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, sy);
            ctx.lineTo(x + width, sy);
            ctx.stroke();

            // Diagonal bracing
            ctx.beginPath();
            ctx.moveTo(x, sy);
            ctx.lineTo(x + colSpacing, sy + rowSpacing);
            ctx.stroke();
        }

        // Safety green mesh banner
        ctx.fillStyle = 'rgba(40, 167, 69, 0.18)';
        ctx.fillRect(x, y + 10, width, height * 0.4);
        ctx.restore();
    }

    // Helper: Draw luxury glass window with sun reflection or night illumination
    drawArchitecturalGlass(ctx, x, y, width, height, isNight, overallProgress) {
        ctx.save();
        if (isNight) {
            // Warm interior lighting glowing outside
            const warmGlow = ctx.createLinearGradient(x, y, x, y + height);
            warmGlow.addColorStop(0, '#ffe5b4');
            warmGlow.addColorStop(1, '#ffc766');
            ctx.fillStyle = warmGlow;
            ctx.fillRect(x, y, width, height);

            // Interior silhouettes (pendant lamp / furniture)
            ctx.fillStyle = 'rgba(70, 40, 10, 0.4)';
            ctx.fillRect(x + width * 0.45, y + 2, 2, 16); // Lamp wire
            ctx.beginPath();
            ctx.arc(x + width * 0.45 + 1, y + 20, 8, 0, Math.PI);
            ctx.fill();
        } else {
            // Daytime reflective glass
            const glassGrad = ctx.createLinearGradient(x, y, x + width, y + height);
            glassGrad.addColorStop(0, '#5fa8d3');
            glassGrad.addColorStop(0.5, '#78c0e8');
            glassGrad.addColorStop(1, '#a6ddf8');
            ctx.fillStyle = glassGrad;
            ctx.fillRect(x, y, width, height);

            // Diagonal sun glare on glass
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(x + width * 0.2, y);
            ctx.lineTo(x + width * 0.45, y);
            ctx.lineTo(x + width * 0.25, y + height);
            ctx.lineTo(x, y + height);
            ctx.closePath();
            ctx.fill();
        }

        // Aluminum window framing
        ctx.strokeStyle = '#1a1d20';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, width, height);

        // Mullion divider
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width / 2, y + height);
        ctx.stroke();

        ctx.restore();
    }

    // Exterior modern sconce lights
    drawExteriorWallLights(ctx, x, y) {
        ctx.save();
        // Fixture body
        ctx.fillStyle = '#111417';
        ctx.fillRect(x - 2, y - 6, 4, 12);

        // Up & Down warm light cone
        const upCone = ctx.createLinearGradient(x, y, x, y - 24);
        upCone.addColorStop(0, 'rgba(255, 210, 120, 0.85)');
        upCone.addColorStop(1, 'rgba(255, 210, 120, 0)');
        ctx.fillStyle = upCone;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x - 14, y - 28);
        ctx.lineTo(x + 14, y - 28);
        ctx.closePath();
        ctx.fill();

        const downCone = ctx.createLinearGradient(x, y, x, y + 24);
        downCone.addColorStop(0, 'rgba(255, 210, 120, 0.85)');
        downCone.addColorStop(1, 'rgba(255, 210, 120, 0)');
        ctx.fillStyle = downCone;
        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.lineTo(x - 14, y + 28);
        ctx.lineTo(x + 14, y + 28);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Landscaping palm trees
    drawPalmTree(ctx, x, y, scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Curved trunk
        ctx.strokeStyle = '#5a4635';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8, -35, 2, -70);
        ctx.stroke();

        // Palm fronds
        ctx.fillStyle = '#26612b';
        const angles = [-2.4, -1.8, -1.2, -0.6, 0.1, 0.7];
        for (let a of angles) {
            ctx.beginPath();
            ctx.moveTo(2, -70);
            const fx = 2 + Math.cos(a) * 38;
            const fy = -70 + Math.sin(a) * 22;
            ctx.quadraticCurveTo(2 + Math.cos(a) * 24, -80, fx, fy);
            ctx.lineTo(2, -70);
            ctx.fill();
        }
        ctx.restore();
    }

    drawShrubs(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#245a2a';
        ctx.beginPath();
        ctx.arc(x, y - 6, 12, 0, Math.PI * 2);
        ctx.arc(x + 14, y - 8, 14, 0, Math.PI * 2);
        ctx.arc(x + 28, y - 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Dynamic tower crane
    drawTowerCrane(ctx, w, h, overallProgress) {
        // Crane active only during framing, slabs and masonry (Phase 3 & 4)
        if (overallProgress < 0.25 || overallProgress > 0.75) return;

        const groundY = h * 0.72;
        const craneX = w * 0.78;
        const craneH = 220;
        const craneTopY = groundY - craneH;

        ctx.save();
        // Yellow construction crane color
        ctx.strokeStyle = '#e69500';
        ctx.lineWidth = 2;

        // Vertical mast lattice
        ctx.strokeRect(craneX - 8, craneTopY, 16, craneH);
        for (let cy = craneTopY; cy < groundY; cy += 18) {
            ctx.beginPath();
            ctx.moveTo(craneX - 8, cy);
            ctx.lineTo(craneX + 8, cy + 18);
            ctx.stroke();
        }

        // Operator cabin
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(craneX - 10, craneTopY - 14, 20, 14);

        // Horizontal jib arm
        const jibLength = 160;
        const counterJib = 50;
        ctx.strokeStyle = '#e69500';
        ctx.beginPath();
        ctx.moveTo(craneX - counterJib, craneTopY - 14);
        ctx.lineTo(craneX + jibLength, craneTopY - 14);
        ctx.stroke();

        // Counterweight block
        ctx.fillStyle = '#444b52';
        ctx.fillRect(craneX - counterJib - 4, craneTopY - 20, 18, 14);

        // Crane Tower Peak & Stay Cables
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(craneX, craneTopY - 32);
        ctx.lineTo(craneX + jibLength * 0.7, craneTopY - 14);
        ctx.moveTo(craneX, craneTopY - 32);
        ctx.lineTo(craneX - counterJib, craneTopY - 14);
        ctx.stroke();

        // Moving trolley & hoist cable
        const trolleyPos = Math.sin(this.currentTime * 0.8) * 0.5 + 0.5; // 0 to 1 back and forth
        const trolleyX = craneX + 30 + trolleyPos * (jibLength - 50);
        
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(trolleyX - 4, craneTopY - 14, 8, 5);

        // Cable dropping down
        const cableDrop = 70 + Math.cos(this.currentTime * 1.2) * 20;
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trolleyX, craneTopY - 9);
        ctx.lineTo(trolleyX, craneTopY - 9 + cableDrop);
        ctx.stroke();

        // Suspended Steel I-Beam
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(trolleyX - 22, craneTopY - 9 + cableDrop, 44, 7);

        // Welding sparks occasionally at building site
        if (Math.sin(this.currentTime * 4) > 0.3) {
            ctx.fillStyle = '#ffe066';
            for (let sp = 0; sp < 6; sp++) {
                const sx = w * 0.45 + (Math.random() - 0.5) * 20;
                const sy = groundY - 80 + (Math.random() - 0.5) * 20;
                ctx.fillRect(sx, sy, 2, 2);
            }
        }

        ctx.restore();
    }

    // Atmospheric particles & dust
    drawAtmosphere(ctx, w, h, overallProgress) {
        ctx.save();
        for (let p of this.particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = 1;
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;

            const px = p.x * w;
            const py = p.y * h;

            if (p.type === 'spark' && overallProgress > 0.25 && overallProgress < 0.7) {
                ctx.fillStyle = `rgba(254, 180, 50, ${p.opacity})`;
                ctx.fillRect(px, py, p.size, p.size);
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // HUD markings directly on the video
    drawCinematicHUD(ctx, w, h, overallProgress, phase) {
        ctx.save();
        // Crosshair watermark in corners
        ctx.strokeStyle = 'rgba(254, 147, 44, 0.4)';
        ctx.lineWidth = 1.5;

        // Top left cross
        ctx.strokeRect(18, 18, 12, 12);
        // Bottom right technical stamp
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`AMMUNI ENG LAB • 60 FPS • ${((overallProgress * 100).toFixed(1))}%`, w - 24, h - 20);
        ctx.restore();
    }

    // Color interpolation helper
    lerpColor(a, b, amount) {
        const ah = parseInt(a.replace(/#/g, ''), 16),
              ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
              bh = parseInt(b.replace(/#/g, ''), 16),
              br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
              rr = ar + amount * (br - ar),
              rg = ag + amount * (bg - ag),
              rb = ab + amount * (bb - ab);
        return '#' + ((1 << 24) + (Math.round(rr) << 16) + (Math.round(rg) << 8) + Math.round(rb)).toString(16).slice(1);
    }

    // Record and Download Video
    recordAndDownloadVideo() {
        if (!this.downloadBtn) return;
        
        try {
            if (typeof MediaRecorder === 'undefined') {
                alert('MediaRecorder is not supported in this browser environment.');
                return;
            }

            const stream = this.canvas.captureStream(30);
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
            }

            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks = [];

            this.downloadBtn.classList.add('recording');
            this.downloadBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Recording 10s Clip...';

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ammuni_construction_animated_timelapse.webm';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.downloadBtn.classList.remove('recording');
                this.downloadBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Video Saved!';
                setTimeout(() => {
                    this.downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download Video';
                }, 4000);
            };

            // Record 10 seconds of simulation
            recorder.start();
            setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            }, 10000);

        } catch (err) {
            console.error(err);
            alert('Could not record video directly: ' + err.message);
            this.downloadBtn.classList.remove('recording');
            this.downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download Video';
        }
    }
}

// Initialize reliably whether DOM is ready or already loaded
function initEngines() {
    if (!window.constructionEngine) {
        window.constructionEngine = new ConstructionVideoEngine('constructionCanvas');
    }
    const heroCanvas = document.getElementById('heroCanvasMini');
    if (heroCanvas && !window.heroEngine) {
        window.heroEngine = new ConstructionVideoEngine('heroCanvasMini', { isMini: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngines);
} else {
    initEngines();
}
