/* Mumbai Silicon - PCB Customizer & Live RFQ Quote Engine */

class PCBConfigurator {
  constructor() {
    this.layers = 4;
    this.finish = 'ENIG';
    this.cpu = 'quad-1.8';
    this.quantity = 10;
    this.peripherals = {
      ethernet: true,
      hdmi: true,
      oled: true,
      usbc: true,
      wifi6: false
    };

    this.baseCostPerBoard = 45;
    this.initEvents();
    this.calculate();
  }

  initEvents() {
    // Radio selection cards
    document.querySelectorAll('[data-config-type]').forEach(card => {
      card.addEventListener('click', (e) => {
        const type = card.dataset.configType;
        const val = card.dataset.configVal;

        // Deselect siblings in same group
        document.querySelectorAll(`[data-config-type="${type}"]`).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        if (type === 'layer') this.layers = parseInt(val);
        if (type === 'finish') this.finish = val;
        if (type === 'cpu') this.cpu = val;

        if (window.soundFX) window.soundFX.playClick();
        this.calculate();
      });
    });

    // Peripherals checkboxes
    document.querySelectorAll('.peri-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const p = e.target.dataset.peri;
        if (p in this.peripherals) {
          this.peripherals[p] = e.target.checked;
          if (window.soundFX) window.soundFX.playClick();
          this.calculate();
        }
      });
    });

    // Quantity selector
    const qtyInput = document.getElementById('config-qty');
    if (qtyInput) {
      qtyInput.addEventListener('input', (e) => {
        this.quantity = Math.max(1, parseInt(e.target.value) || 1);
        this.calculate();
      });
    }
  }

  calculate() {
    let unitPrice = 25.0; // Base bare board 2-layer price

    // Layer multiplier
    if (this.layers === 4) unitPrice += 15;
    if (this.layers === 6) unitPrice += 32;
    if (this.layers === 8) unitPrice += 55;

    // Finish multiplier
    if (this.finish === 'ENIG') unitPrice += 8;
    if (this.finish === 'ImmersionSilver') unitPrice += 6;

    // CPU selection
    if (this.cpu === 'quad-1.8') unitPrice += 38;
    if (this.cpu === 'dual-1.2') unitPrice += 22;
    if (this.cpu === 'single-lp') unitPrice += 12;

    // Peripherals
    if (this.peripherals.ethernet) unitPrice += 6;
    if (this.peripherals.hdmi) unitPrice += 8;
    if (this.peripherals.oled) unitPrice += 9;
    if (this.peripherals.usbc) unitPrice += 5;
    if (this.peripherals.wifi6) unitPrice += 11;

    // Quantity discount scaling
    let scaleFactor = 1.0;
    if (this.quantity >= 50) scaleFactor = 0.85;
    if (this.quantity >= 200) scaleFactor = 0.72;
    if (this.quantity >= 500) scaleFactor = 0.60;

    const finalUnitPrice = (unitPrice * scaleFactor).toFixed(2);
    const totalPrice = (finalUnitPrice * this.quantity).toFixed(2);

    // Update UI elements
    const unitEl = document.getElementById('unit-price-val');
    const totalEl = document.getElementById('total-price-val');
    const breakdownEl = document.getElementById('config-summary-text');

    if (unitEl) unitEl.textContent = `₹${(finalUnitPrice * 83).toLocaleString('en-IN')} ($${finalUnitPrice})`;
    if (totalEl) totalEl.textContent = `₹${(totalPrice * 83).toLocaleString('en-IN')} ($${totalPrice})`;

    if (breakdownEl) {
      breakdownEl.innerHTML = `
        <strong>Specification Summary:</strong><br>
        • ${this.layers}-Layer PCB (${this.finish} Finish)<br>
        • ${this.cpu.toUpperCase()} RISC-V SoC Brain<br>
        • Active Modules: ${Object.keys(this.peripherals).filter(k => this.peripherals[k]).join(', ').toUpperCase()}<br>
        • Quantity: <strong>${this.quantity} units</strong> (Includes ESD testing & QA report)
      `;
    }

    window.currentConfigQuote = {
      layers: this.layers,
      finish: this.finish,
      cpu: this.cpu,
      quantity: this.quantity,
      unitPriceUSD: finalUnitPrice,
      totalPriceUSD: totalPrice,
      totalPriceINR: (totalPrice * 83).toFixed(2)
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.configurator = new PCBConfigurator();
});
