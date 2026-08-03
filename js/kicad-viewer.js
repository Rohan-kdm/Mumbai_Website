/* Mumbai Silicon - KiCad Gerber Layer & Schematic Interactive Explorer */

class KiCadViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = this.canvas.clientWidth || 800;
    this.height = this.canvas.height = this.canvas.clientHeight || 480;

    this.layers = {
      topCopper: true,
      bottomCopper: false,
      silkscreen: true,
      drills: true,
      soldermask: false
    };

    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;

    this.initEvents();
    this.draw();
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.width = this.canvas.width = this.canvas.clientWidth || 800;
      this.height = this.canvas.height = this.canvas.clientHeight || 480;
      this.draw();
    });

    const toggles = document.querySelectorAll('.kicad-layer-checkbox');
    toggles.forEach(chk => {
      chk.addEventListener('change', (e) => {
        const layer = e.target.dataset.layer;
        if (layer in this.layers) {
          this.layers[layer] = e.target.checked;
          if (window.soundFX) window.soundFX.playClick();
          this.draw();
        }
      });
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Dark grid background
    this.ctx.fillStyle = '#080d14';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;
    const gridSize = 30 * this.zoom;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    const cx = this.width / 2 + this.panX;
    const cy = this.height / 2 + this.panY;

    // Layer 1: Solder Mask (Green tint)
    if (this.layers.soldermask) {
      this.ctx.fillStyle = 'rgba(10, 58, 42, 0.6)';
      this.ctx.fillRect(cx - 240 * this.zoom, cy - 160 * this.zoom, 480 * this.zoom, 320 * this.zoom);
    }

    // Layer 2: Bottom Copper B.Cu (Blue/Cyan traces)
    if (this.layers.bottomCopper) {
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      this.ctx.lineWidth = 3 * this.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 200 * this.zoom, cy + 120 * this.zoom);
      this.ctx.lineTo(cx - 80 * this.zoom, cy + 120 * this.zoom);
      this.ctx.lineTo(cx, cy + 40 * this.zoom);
      this.ctx.lineTo(cx + 180 * this.zoom, cy + 40 * this.zoom);
      this.ctx.stroke();
    }

    // Layer 3: Top Copper F.Cu (Golden traces & power plane)
    if (this.layers.topCopper) {
      this.ctx.strokeStyle = '#e5b842';
      this.ctx.lineWidth = 2.5 * this.zoom;

      // Differential Bus Traces (HDMI & USB 3.0)
      for (let i = -3; i <= 3; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 180 * this.zoom, cy + (i * 12) * this.zoom);
        this.ctx.lineTo(cx - 60 * this.zoom, cy + (i * 12) * this.zoom);
        this.ctx.lineTo(cx + 40 * this.zoom, cy - 80 * this.zoom);
        this.ctx.lineTo(cx + 180 * this.zoom, cy - 80 * this.zoom);
        this.ctx.stroke();
      }

      // RISC-V SoC BGA Pad Matrix
      const chipSize = 90 * this.zoom;
      this.ctx.fillStyle = '#ffb703';
      for (let rx = -3; rx <= 3; rx++) {
        for (let ry = -3; ry <= 3; ry++) {
          this.ctx.beginPath();
          this.ctx.arc(cx + rx * 10 * this.zoom, cy + ry * 10 * this.zoom, 3 * this.zoom, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // Layer 4: Silkscreen (White text & outlines)
    if (this.layers.silkscreen) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5 * this.zoom;
      this.ctx.strokeRect(cx - 220 * this.zoom, cy - 140 * this.zoom, 440 * this.zoom, 280 * this.zoom);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${Math.max(10, Math.floor(14 * this.zoom))}px 'Outfit', sans-serif`;
      this.ctx.fillText("MUMBAI SILICON MS-RV1", cx - 200 * this.zoom, cy - 110 * this.zoom);
      this.ctx.font = `${Math.max(8, Math.floor(10 * this.zoom))}px 'Fira Code', monospace`;
      this.ctx.fillText("OPEN HARDWARE REF ARCH v2.4", cx - 200 * this.zoom, cy - 90 * this.zoom);
    }

    // Layer 5: Drills & Vias (Cyan circles)
    if (this.layers.drills) {
      this.ctx.fillStyle = '#00f0ff';
      const vias = [
        { x: -180, y: -50 }, { x: -180, y: 50 }, { x: 180, y: -50 }, { x: 180, y: 50 },
        { x: 0, y: -100 }, { x: 0, y: 100 }
      ];
      for (const v of vias) {
        this.ctx.beginPath();
        this.ctx.arc(cx + v.x * this.zoom, cy + v.y * this.zoom, 5 * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.kicadViewer = new KiCadViewer('kicad-canvas');
});
