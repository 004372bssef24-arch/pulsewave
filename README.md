# PulseWave 🎵

> A modern, enterprise-grade web audio player built with zero dependencies — featuring real-time frequency visualization, WCAG 2.1 AA accessibility, and a professional dark cyberpunk UI.

![PulseWave](assets/screenshots/pulsewave-main.png)

---

## 🚀 Live Demo

**[Try PulseWave Live →]((https://pulsewave-gamma.vercel.app/))**

---

## ✨ Features

### Core Playback
- ▶️ Play / Pause / Next / Previous
- 🎚️ Drag-to-seek progress bar with real-time thumb
- 🔊 Volume control with mute toggle and dynamic icons
- 🔁 3-state repeat (Off → All → One)
- 🔀 Shuffle mode with "Shuffle All"
- ⏩ Playback speed control (1.0x → 2.0x)
- ⏱️ Real-time time display (M:SS format)

### Real-Time Visualization
- 📊 Canvas-based frequency visualizer using Web Audio API
- 🎨 Dynamic cyan-to-purple gradient bars
- 🌊 32 frequency bins with smooth animation
- 🎨 Hero card background blur synced to album art

### Track Library
- 🎵 6 pre-loaded tracks across 4 genres (Lo-Fi, Synthwave, Cyberpunk, Ambient)
- 🔍 Real-time search by title, artist, or genre
- 📂 Category filtering via sidebar navigation
- 💚 Like/favorite system with LocalStorage persistence
- 🎯 Active track highlighting with live "now playing" indicator

### Accessibility (WCAG 2.1 AA)
- ♿ Full keyboard navigation (Space, Arrow keys, M, S, N, P)
- 🏷️ ARIA labels on all interactive elements
- 🎯 Focus-visible styles for keyboard users
- 📢 Screen reader announcements via aria-live regions
- ⏩ Skip navigation link
- 🎬 prefers-reduced-motion support

### Security & Performance
- 🔒 XSS prevention via escapeHtml() on all user inputs
- 💾 LocalStorage persistence (volume, liked tracks, last played)
- ⚡ Zero dependencies — pure vanilla JavaScript
- 📱 Fully responsive (480px to 1024px+)
- 🎯 Cached DOM lookups + debounced search
- 🛡️ Security headers (Referrer-Policy, X-Content-Type-Options)

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Markup** | HTML5 (Semantic, single-page) |
| **Styling** | CSS3 (Custom Properties, Grid, Flexbox, Animations, Backdrop Filters) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Audio Engine** | HTML5 `<audio>` + Web Audio API (AnalyserNode) |
| **Icons** | Lucide Icons (CDN, pinned v0.344.0) |
| **Fonts** | Plus Jakarta Sans + JetBrains Mono |

**No frameworks. No build tools. No dependencies.**

---

## 🏗️ Architecture
pulsewave/
├── index.html # Markup & semantic structure
├── style.css # All styling & design system
├── app.js # Application logic
└── docs/
├── PRD.md # Product Requirements Document
├── TRD.md # Technical Requirements Document
├── UI-BRIEF.md # UI Design Brief
├── APP-FLOW.md # Application Flow Documentation
├── IMPLEMENTATION-PLAN.md # Step-by-step implementation plan
└── CURRENT-PROJECT-STATE.md # Audit & roadmap

text

### JavaScript Module Organization (app.js)

1. **Constants & Configuration** — `TRACKS` array, `CONFIG` object
2. **Application State** — Centralized state object
3. **DOM Element Cache** — All element references cached
4. **Utilities** — `formatTime()`, `escapeHtml()`, `debounce()`, `showToast()`
5. **Web Audio API** — `initAudioContext()`, `startVisualizer()`
6. **Visualizer Engine** — Canvas rendering loop
7. **Track List Rendering** — Dynamic filterable list
8. **Playback Controls** — Play, pause, next, previous
9. **Progress / Seek** — Drag support with mouse + touch
10. **Volume Controls** — Slider + mute
11. **Shuffle, Repeat, Speed** — Advanced playback modes
12. **Like / Favorites** — Persisted state
13. **Category Filter & Search** — Sidebar + search
14. **Keyboard Shortcuts** — Global key bindings
15. **Event Bindings & Error Handling** — Audio events, global errors
16. **Initialization** — DOMContentLoaded entry point

---

## 📸 Screenshots

### Main Interface
<img width="1366" height="734" alt="image" src="https://github.com/user-attachments/assets/38ed5497-fdfe-47d3-a0ef-5d9400d6bf25" />


### Real-Time Visualizer
<img width="1366" height="732" alt="image" src="https://github.com/user-attachments/assets/3643570d-882a-4e63-ac19-fc4602f9c658" />


### Mobile Responsive
![Mobile View](assets/screenshots/pulsewave-mobile.png)

---

## 🚦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- Internet connection (for CDN audio, images, fonts)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/004372bssef24-arch/pulsewave.git
   cd pulsewave
Open in browser

Simply open https://pulsewave-gamma.vercel.app/

OR use a local server:

bash
python -m http.server 8000
# Then visit http://localhost:8000
Click play and enjoy

Note: No build step, no npm install, no server required.

⌨️ Keyboard Shortcuts
Key	Action
Space	Play / Pause
→	Seek forward 5s
←	Seek backward 5s
M	Mute / Unmute
S	Toggle Shuffle
N	Next Track
P	Previous Track
🎵 Track Database
#	Title	Artist	Genre	Duration
1	Midnight Reverie	Aura & Synth Lab	Lo-Fi	2:45
2	Neon Horizon	RetroWave Collective	Synthwave	3:10
3	Cyber Protocol 2077	Zero Day Unit	Cyberpunk	2:30
4	Deep Focus Echoes	Solitude Space	Ambient	3:40
5	Tokyo Rainy Night	Komorebi Beats	Lo-Fi	2:15
6	Electromagnetic Pulse	Vector Void	Synthwave	2:55
All tracks sourced from Pixabay CDN (royalty-free). Artwork from Unsplash.

📊 Project Stats
Metric	Value
Total Lines of Code	~1,242
Dependencies	0
Bundle Size	~33.9 KB (unminified)
Build Time	None required
Browser Support	Chrome, Edge, Firefox, Safari
Accessibility	WCAG 2.1 AA compliant
🗺️ Roadmap
☑ Core playback functionality
☑ Real-time frequency visualizer
☑ Keyboard shortcuts
☑ WCAG 2.1 AA accessibility
☑ LocalStorage persistence
☑ Drag-to-seek support
☑ Responsive layout
□ Light / dark theme toggle
□ Playlist management
□ Audio equalizer (5-band)
□ Lyrics display with sync
□ PWA support (offline mode)
□ Media Session API (lock screen controls)
🧪 Testing
No automated tests yet. Manual testing checklist:

□ All 6 tracks play correctly
□ Category filters work (All, Lo-Fi, Synthwave, Cyberpunk, Ambient)
□ Search filters by title, artist, genre
□ Keyboard shortcuts function
□ Volume slider and mute work
□ Shuffle, repeat, speed controls function
□ Visualizer reacts to audio
□ Responsive on mobile/tablet
□ Screen reader announces track changes
□ Drag-to-seek works with mouse and touch
🤝 Contributing
This is a personal project, but suggestions are welcome. Feel free to open an issue or submit a PR.

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

👤 Author
M. Hasnain Baig

💻 GitHub: @004372bssef24-arch

🔗 LinkedIn: linkedin.com/in/hasnaibaiq

📧 Email: mhasnaibaiq2005@gmail.com

🙏 Acknowledgments
Built as part of the Arch Technologies Web Development Internship

Audio tracks from Pixabay

Album artwork from Unsplash

Icons from Lucide

Fonts from Google Fonts

⭐ If you found this project useful, consider giving it a star!

text

---

## Quick Summary

| Element | Value |
|:---|:---|
| **GitHub Username** | `004372bssef24-arch` |
| **GitHub URL** | `github.com/004372bssef24-arch/pulsewave` |
| **Live Demo URL** | `https://004372bssef24-arch.github.io/pulsewave/` (after Pages deploy) |
| **LinkedIn** | `linkedin.com/in/hasnaibaiq` |
| **Email** | `mhasnaibaiq2005@gmail.com` |

---
