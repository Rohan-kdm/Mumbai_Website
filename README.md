# Mumbai Silicon — Interactive Web Application & Cloudflare Setup

High-performance, futuristic fullstack web application for **Mumbai Silicon** (Next-Gen RISC-V SoC Boards, KiCad Open PCB Engineering, Custom Hardware Manufacturing).

## 🚀 Cloudflare Pages 2-Click Deployment Guide

You can host this website on Cloudflare Pages for FREE with global CDN, free SSL certificate, and automatic deployment.

### Method 1: 2-Click Automatic GitHub Deployment (Recommended)
1. Push this project code to your GitHub Repository: `https://github.com/Rohan-kdm/Mumbai_Website`
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** -> **Create Application** -> **Pages**.
3. Select **Connect to Git** and choose `Rohan-kdm/Mumbai_Website`.
4. Click **Save and Deploy**! Cloudflare will automatically build and publish your site at `mumbai-silicon.pages.dev`.

> 💡 **Future Web Upgrades**: Every time you `git push` to your GitHub repo, Cloudflare automatically builds and deploys the update in under 30 seconds without dragging or dropping files!

---

### Method 2: Wrangler CLI Deployment
Run the following command in your terminal:
```bash
npx wrangler pages deploy . --project-name=mumbai-silicon
```

---

## ⚡ Features Included

- **3D Hardware Inspector (WebGL/Canvas)**: Interactive 3D rendering of the flagship **MS-RV1** RISC-V board with real-time OLED screen telemetry animation and pinout tooltips.
- **KiCad Gerber Layer Explorer**: Toggle F.Cu (Top Copper), B.Cu (Bottom Copper), Silkscreen, Vias/Drills, and Solder Mask.
- **CERN Open Hardware Business Strategy**: Enterprise guide on leveraging industrial reference schematics (sub-nanosecond timing networks, 6-layer PDN, 90Ω/100Ω differential pairs) to accelerate time-to-market.
- **Custom PCB Configurator & RFQ Estimator**: Real-time quote calculation engine for layer counts, surface finishes, RISC-V variants, and peripherals.
- **Interactive RISC-V Terminal Simulator**: Simulated Linux kernel boot sequence with commands (`uname -a`, `lscpu`, `sensors`, `pinout`, `flash`).
- **Contact Hub & Careers**: Dedicated portals for Sales, Careers, and Technical Support.
- **Cloudflare Edge Worker API**: Serverless `/api/orders`, `/api/rfq`, `/api/contact` handlers (`api/_worker.js`).
- **Web Audio API**: Synthesized sci-fi haptic audio feedback.

---

## 🛠️ Local Development & Testing

To test locally using Python's built-in web server:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.
