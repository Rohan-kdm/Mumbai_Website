/* Mumbai Silicon - MS-RV1 RISC-V PCB 3D Hardware Inspector */

class PCB3DViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = this.canvas.clientWidth || 600;
    this.height = this.canvas.height = this.canvas.clientHeight || 520;

    // Board 3D Projection State
    this.rotX = 0.45;
    this.rotY = -0.35;
    this.rotZ = 0;
    this.zoom = 1.0;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Telemetry text animation for OLED screen
    this.oledFrames = [
      "MS-RV1 v2.4",
      "CPU: 4x 1.8GHz",
      "RAM: 8GB LPDDR4",
      "ETH: 1Gbps LINK",
      "TEMP: 38.4°C",
      "STATUS: OK"
    ];
    this.oledIndex = 0;
    this.oledTimer = 0;

    // Component Definitions with 3D boundaries
    this.components = [
      { id: 'riscv-cpu', name: 'RISC-V 64-Bit Quad-Core SoC', x: 0, y: -10, z: 8, w: 90, h: 90, d: 12, color: '#1a233a', accent: '#00f0ff', desc: 'RV64GC Architecture, 1.8GHz, AI Vector Unit, 64-bit Memory Bus' },
      { id: 'oled-screen', name: '0.96" OLED Live Screen', x: -140, y: -90, z: 10, w: 75, h: 50, d: 8, color: '#030a16', accent: '#00ff88', desc: '128x64 Monochrome Display for Real-Time CPU & Telemetry Data' },
      { id: 'ethernet', name: 'Gigabit Ethernet RJ45', x: 160, y: -80, z: 20, w: 55, h: 65, d: 35, color: '#4a5568', accent: '#ffb703', desc: '10/100/1000Mbps PHY with Status LEDs' },
      { id: 'hdmi', name: 'HDMI 2.0 Output Port', x: 160, y: 10, z: 12, w: 45, h: 50, d: 25, color: '#2d3748', accent: '#00f0ff', desc: '4K @ 60Hz Display Output support' },
      { id: 'usb-c', name: 'USB Type-C (Power + Data)', x: -160, y: 80, z: 8, w: 40, h: 30, d: 15, color: '#4a5568', accent: '#00ff88', desc: 'Dual-Role PD 20V/3A Power & USB 3.1 10Gbps' },
      { id: 'usb-a', name: 'USB 3.0 Type-A Host', x: 160, y: 90, z: 15, w: 50, h: 40, d: 28, color: '#2d3748', accent: '#00f0ff', desc: 'SuperSpeed 5Gbps Host Interface' },
      { id: 'micro-usb', name: 'Micro-USB UART Console', x: -160, y: 20, z: 6, w: 30, h: 25, d: 12, color: '#718096', accent: '#ffb703', desc: 'CP2102 Serial Debug Console Bridge' },
      { id: 'sd-card', name: 'MicroSD UHS-I Card Slot', x: -100, y: 110, z: 5, w: 45, h: 40, d: 8, color: '#2b6cb0', accent: '#00f0ff', desc: 'High-speed UHS-I Bootable OS Storage' },
      { id: 'gpio-header', name: '40-Pin Expansion Header', x: 0, y: -110, z: 10, w: 220, h: 20, d: 15, color: '#1a202c', accent: '#e5b842', desc: 'SPI, I2C, UART, CAN Bus, PWM & 3.3V/5V Power Rails' }
    ];

    this.activeHoverComponent = null;
    this.tooltipEl = document.getElementById('pcb-tooltip');

    this.initEvents();
    this.animate();
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.width = this.canvas.width = this.canvas.clientWidth || 600;
      this.height = this.canvas.height = this.canvas.clientHeight || 520;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      if (window.soundFX) window.soundFX.playClick();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.rotY += dx * 0.008;
        this.rotX += dy * 0.008;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        this.checkHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom += e.deltaY * -0.0015;
      this.zoom = Math.min(Math.max(0.6, this.zoom), 2.2);
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.activeHoverComponent) {
        if (window.soundFX) window.soundFX.playSuccess();
        const comp = this.activeHoverComponent;
        alert(`⚡ Mumbai Silicon Hardware Inspector\n\nComponent: ${comp.name}\nSpecification: ${comp.desc}`);
      }
    });
  }

  checkHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - this.width / 2;
    const my = e.clientY - rect.top - this.height / 2;

    let found = null;
    for (const comp of this.components) {
      // 2D projection estimation for hover
      const proj = this.project3D(comp.x, comp.y, comp.z);
      const dist = Math.hypot(mx - proj.x, my - proj.y);
      if (dist < Math.max(comp.w, comp.h) * 0.45 * this.zoom) {
        found = comp;
        break;
      }
    }

    if (found !== this.activeHoverComponent) {
      this.activeHoverComponent = found;
      if (found) {
        if (window.soundFX) window.soundFX.playHover();
        this.canvas.style.cursor = 'pointer';
        if (this.tooltipEl) {
          this.tooltipEl.innerHTML = `<strong>${found.name}</strong><br><span style="color:#94a3b8;font-size:0.8rem">${found.desc}</span>`;
          this.tooltipEl.classList.add('visible');
        }
      } else {
        this.canvas.style.cursor = 'grab';
        if (this.tooltipEl) this.tooltipEl.classList.remove('visible');
      }
    }

    if (found && this.tooltipEl) {
      this.tooltipEl.style.left = `${e.clientX}px`;
      this.tooltipEl.style.top = `${e.clientY}px`;
    }
  }

  project3D(x, y, z) {
    // 3D Euler angle rotation
    let radX = this.rotX;
    let radY = this.rotY;

    // Y rotation
    let x1 = x * Math.cos(radY) + z * Math.sin(radY);
    let z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // X rotation
    let y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective scale
    let fov = 450;
    let scale = (fov / (fov + z2 + 300)) * this.zoom;

    return {
      x: x1 * scale,
      y: y2 * scale,
      z: z2,
      scale: scale
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;

    // 1. Draw Matte Black Board Base (400x280)
    const pcbCorners = [
      { x: -200, y: -140, z: 0 },
      { x: 200, y: -140, z: 0 },
      { x: 200, y: 140, z: 0 },
      { x: -200, y: 140, z: 0 }
    ].map(pt => this.project3D(pt.x, pt.y, pt.z));

    // PCB Substrate Gradient
    this.ctx.beginPath();
    this.ctx.moveTo(cx + pcbCorners[0].x, cy + pcbCorners[0].y);
    for (let i = 1; i < pcbCorners.length; i++) {
      this.ctx.lineTo(cx + pcbCorners[i].x, cy + pcbCorners[i].y);
    }
    this.ctx.closePath();

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fill();
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 2. Draw Decorative Gold Circuit Traces
    const traces = [
      [{ x: -140, y: -90, z: 2 }, { x: 0, y: -10, z: 2 }],
      [{ x: 0, y: -10, z: 2 }, { x: 160, y: -80, z: 2 }],
      [{ x: 0, y: -10, z: 2 }, { x: 160, y: 10, z: 2 }],
      [{ x: 0, y: -10, z: 2 }, { x: 160, y: 90, z: 2 }],
      [{ x: 0, y: -10, z: 2 }, { x: -160, y: 80, z: 2 }],
      [{ x: 0, y: -10, z: 2 }, { x: -100, y: 110, z: 2 }]
    ];

    this.ctx.strokeStyle = '#e5b842';
    this.ctx.lineWidth = 1.5;
    for (const t of traces) {
      const p1 = this.project3D(t[0].x, t[0].y, t[0].z);
      const p2 = this.project3D(t[1].x, t[1].y, t[1].z);
      this.ctx.beginPath();
      this.ctx.moveTo(cx + p1.x, cy + p1.y);
      this.ctx.lineTo(cx + p2.x, cy + p2.y);
      this.ctx.stroke();
    }

    // 3. Draw 3D Components
    for (const comp of this.components) {
      const isHovered = this.activeHoverComponent && this.activeHoverComponent.id === comp.id;
      const p = this.project3D(comp.x, comp.y, comp.z);

      const w = comp.w * p.scale;
      const h = comp.h * p.scale;

      this.ctx.save();
      this.ctx.translate(cx + p.x, cy + p.y);

      // Component shadow
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(-w/2 + 5, -h/2 + 5, w, h);

      // Component body
      this.ctx.fillStyle = isHovered ? '#1e293b' : comp.color;
      this.ctx.fillRect(-w/2, -h/2, w, h);

      // Border & Accent Glow
      this.ctx.strokeStyle = isHovered ? '#00f0ff' : comp.accent;
      this.ctx.lineWidth = isHovered ? 2.5 : 1.2;
      this.ctx.strokeRect(-w/2, -h/2, w, h);

      // OLED Special Live Render
      if (comp.id === 'oled-screen') {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-w/2 + 3, -h/2 + 3, w - 6, h - 6);

        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = `${Math.max(9, Math.floor(11 * p.scale))}px 'Fira Code', monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.oledFrames[this.oledIndex], 0, 4);
      } else if (comp.id === 'riscv-cpu') {
        // RISC-V Logo on Chip
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.font = `bold ${Math.floor(13 * p.scale)}px 'Outfit', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RISC-V', 0, -4);
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = `${Math.floor(9 * p.scale)}px 'Fira Code', monospace`;
        this.ctx.fillText('MS-RV64GC', 0, 12);
      } else {
        // Component label
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = `${Math.floor(9 * p.scale)}px 'Inter', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(comp.id.toUpperCase(), 0, 3);
      }

      this.ctx.restore();
    }
  }

  animate() {
    this.oledTimer++;
    if (this.oledTimer > 75) {
      this.oledTimer = 0;
      this.oledIndex = (this.oledIndex + 1) % this.oledFrames.length;
    }

    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  resetView() {
    this.rotX = 0.45;
    this.rotY = -0.35;
    this.zoom = 1.0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pcbViewer = new PCB3DViewer('pcb-3d-canvas');
});
