/* Mumbai Silicon - Interactive RISC-V Terminal Simulator */

class TerminalSimulator {
  constructor() {
    this.bodyEl = document.getElementById('terminal-body-lines');
    this.inputEl = document.getElementById('terminal-input');
    if (!this.inputEl || !this.bodyEl) return;

    this.history = [];
    this.historyIdx = -1;

    this.initEvents();
    this.printBootSequence();
  }

  initEvents() {
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.inputEl.value.trim();
        this.inputEl.value = '';
        if (cmd) {
          this.execute(cmd);
        }
      }
    });

    document.querySelectorAll('.term-shortcut-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cmd = btn.dataset.cmd;
        if (cmd) {
          if (window.soundFX) window.soundFX.playClick();
          this.execute(cmd);
        }
      });
    });
  }

  printLine(text, isPrompt = false, isError = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (isPrompt) {
      line.innerHTML = `<span class="terminal-prompt">root@mumbai-silicon:~#</span> ${text}`;
    } else if (isError) {
      line.innerHTML = `<span style="color:#ff2a6d">${text}</span>`;
    } else {
      line.innerHTML = text;
    }
    this.bodyEl.appendChild(line);
    this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
  }

  printBootSequence() {
    const bootLines = [
      "<span style='color:#00f0ff'>[  0.000000] Linux version 6.6.14-ms-rv64 (gcc 13.2.0) #1 SMP PREEMPT Mumbai Silicon</span>",
      "[  0.004120] OpenSBI v1.4-MS (RISC-V SBI Spec 2.0)",
      "[  0.012450] CPU: RV64GC (Hart 0: 1.8GHz Vector Unit Enabled)",
      "[  0.045100] Memory: 8192MB LPDDR4 @ 3200MT/s",
      "[  0.098230] Ethernet: stmmaceth-0 1000Mbps Full Duplex Link Up",
      "[  0.142100] Display: HDMI 2.0 PHY Initialized (3840x2160@60Hz)",
      "[  0.189000] OLED: SSD1306 0.96-inch 128x64 display online",
      "<span style='color:#00ff88'>[  0.220000] MUMBAI SILICON OS READY. Type 'help' or 'pinout' to explore.</span>"
    ];

    bootLines.forEach((l, i) => {
      setTimeout(() => this.printLine(l), i * 120);
    });
  }

  execute(cmd) {
    this.printLine(cmd, true);
    const cleanCmd = cmd.toLowerCase().trim();

    switch (cleanCmd) {
      case 'help':
        this.printLine(`
Available Mumbai Silicon Shell Commands:
  <span style="color:#00f0ff">uname -a</span>      - View OS and RISC-V kernel information
  <span style="color:#00f0ff">lscpu</span>         - Print RISC-V processor topology & features
  <span style="color:#00f0ff">sensors</span>       - Read temperature, power rails and voltages
  <span style="color:#00f0ff">pinout</span>        - Show 40-Pin expansion header layout
  <span style="color:#00f0ff">flash</span>         - Simulate flashing custom firmware image
  <span style="color:#00f0ff">kicad</span>         - Print open-source KiCad stackup info
  <span style="color:#00f0ff">clear</span>         - Clear terminal screen
        `);
        break;

      case 'uname -a':
        this.printLine("Linux mumbai-silicon-rv1 6.6.14-ms-rv64 #1 SMP PREEMPT Mon Aug 3 09:57:00 IST 2026 riscv64 GNU/Linux");
        break;

      case 'lscpu':
        this.printLine(`
Architecture:          riscv64
Byte Order:            Little-Endian
CPU(s):                4
On-line CPU(s) list:   0-3
Vendor ID:             Mumbai Silicon Labs
Model name:            MS-RV64GC Quad-Core Processor
CPU max MHz:           1800.0000
CPU min MHz:           400.0000
Extensions:            rv64gcv (IMAFDCLSU + Vector v1.0)
L1d cache:             128 KiB
L1i cache:             128 KiB
L2 cache:              2 MiB
L3 cache:              8 MiB
        `);
        break;

      case 'sensors':
        this.printLine(`
ms_thermal-isa-0000
Adapter: ISA adapter
SoC Temp:     +38.4°C  (crit = +105.0°C)
VDD_CORE:     +0.90 V  (min = +0.85 V, max = +0.95 V)
VDD_LPDDR4:   +1.10 V
VDD_3V3_BUS:  +3.31 V
VDD_5V0_BUS:  +5.02 V
        `);
        break;

      case 'pinout':
        this.printLine(`
<span style="color:#e5b842">=== 40-PIN EXPANSION HEADER LAYOUT ===</span>
 3.3V Power  [01]  [02]  5.0V Power
 I2C0_SDA    [03]  [04]  5.0V Power
 I2C0_SCL    [05]  [06]  GND
 UART1_TX    [08]  [10]  UART1_RX
 SPI0_MOSI   [19]  [21]  SPI0_MISO
 SPI0_SCLK   [23]  [24]  SPI0_CE0
 CAN0_TX     [29]  [31]  CAN0_RX
 PWM0_OUT    [33]  [35]  PWM1_OUT
 GND         [39]  [40]  ADC0_IN (0-3.3V)
        `);
        break;

      case 'flash':
        this.printLine("<span style='color:#ffb703'>[INFO] Initiating UART / USB-C DFU Bootloader...</span>");
        setTimeout(() => this.printLine("erasing flash sector 0x000000 - 0x0FFFFF..."), 400);
        setTimeout(() => this.printLine("writing firmware.bin [====================] 100%"), 900);
        setTimeout(() => this.printLine("<span style='color:#00ff88'>[SUCCESS] Firmware verification passed. Rebooting...</span>"), 1400);
        break;

      case 'kicad':
        this.printLine("Reference Schematics: KiCad 8.0 Open Hardware Standard (OHWR)");
        this.printLine("Stackup: 4-Layer FR4 (1.6mm thickness, 1oz copper, ENIG Gold Finish)");
        break;

      case 'clear':
        this.bodyEl.innerHTML = '';
        break;

      default:
        this.printLine(`bash: ${cmd}: command not found. Type 'help' for command list.`, false, true);
        break;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.termSim = new TerminalSimulator();
});
