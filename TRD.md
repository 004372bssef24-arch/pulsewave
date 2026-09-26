# Technical Requirements Document (TRD)

**Project:** PulseWave - Modern Web Audio Player
**Task:** Task 3: Music Player
**Internship:** Arch Technologies

## 1. Architecture Overview

### 1.1 Application Type
- Single-Page Application (SPA) - no routing, no server-side rendering
- Static file serving - open index.html directly in the browser
- No build pipeline - no bundler, transpiler, or minifier

### 1.2 File Structure

- index.html - Markup and layout (177 lines)
- style.css - All styling, animations, design system (628 lines)
- app.js - All application logic (437 lines)

### 1.3 External Dependencies (CDN)

- Lucide Icons - SVG icon library - unpkg.com/lucide@latest
- Google Fonts - Plus Jakarta Sans + JetBrains Mono - fonts.googleapis.com
- Pixabay Audio - Royalty-free MP3 streams - cdn.pixabay.com
- Unsplash - Album cover artwork - images.unsplash.com

## 2. Technology Stack

- HTML: HTML5 - Semantic elements, audio tag
- CSS: CSS3 - Custom Properties, Grid, Flexbox, Animations, Backdrop Filter
- JavaScript: ES6+ Vanilla - let/const, arrow functions, template literals, requestAnimationFrame
- Audio: HTML5 Audio API - audio element for playback
- Visualization: Web Audio API - AudioContext, AnalyserNode, MediaElementSource
- Icons: Lucide - SVG icon rendering via lucide.createIcons()

## 3. Data Model

### 3.1 Track Object Schema

Each track has: id (Number), title (String), artist (String), genre (String), duration (String), cover (String URL), src (String URL to audio).

### 3.2 Application State

- currentTrackIndex = 0 - Index into TRACKS array
- isPlaying = false - Current playback state
- isShuffle = false - Shuffle mode toggle
- repeatMode = 0 - 0=Off, 1=All, 2=One
- selectedCategory = "All" - Active sidebar filter
- searchQuery = "" - Current search input
- speedOptions = [1.0, 1.25, 1.5, 2.0]
- currentSpeedIndex = 0 - Index into speedOptions

### 3.3 Web Audio State

- audioCtx = null - AudioContext instance
- analyser = null - AnalyserNode for visualization
- sourceNode = null - MediaElementSourceNode
- visualizerInitialized = false

## 4. Web Audio API Integration

### 4.1 Initialization Flow

1. User clicks Play (first interaction)
2. initVisualizer() called
3. Create AudioContext (with webkit fallback)
4. Create AnalyserNode (fftSize = 64 = 32 frequency bins)
5. Create MediaElementSource from audio element
6. Connect: source -> analyser -> destination
7. Start renderVisualizerFrame() animation loop

### 4.2 Visualization Rendering

- Uses requestAnimationFrame for 60fps rendering
- Reads frequency data via analyser.getByteFrequencyData()
- Draws vertical bars with linear gradient (teal -> cyan -> purple)
- Canvas dimensions matched to element offset size

## 5. CSS Architecture

### 5.1 Design System (CSS Custom Properties)

- --bg-dark: #090B10 (Page background)
- --bg-sidebar: #0F131A (Sidebar)
- --bg-card: rgba(22,27,36,0.7) (Glassmorphism cards)
- --accent-cyan: #00F0FF (Primary accent)
- --accent-teal: #00A3C4 (Secondary accent)
- --accent-purple: #7928CA (Gradient endpoint)
- --text-main: #F8FAFC (Primary text)
- --text-muted: #94A3B8 (Secondary text)
- --font-sans: Plus Jakarta Sans (UI font)
- --font-mono: JetBrains Mono (Monospace font)

### 5.2 Layout Strategy

- Grid: grid-template-columns: 260px 1fr for sidebar + main
- Fixed footer: Bottom player bar (90px height, position fixed)
- Hero card: Flexbox layout with blur background overlay
- Track list: CSS Grid rows (40px 50px 1fr 140px 80px 40px)

### 5.3 Key CSS Techniques

- backdrop-filter: blur() for glassmorphism
- linear-gradient for accents and buttons
- @keyframes pulse for live dot animation
- CSS transitions on hover/focus states (0.15-0.3s)
- Custom range input styling (-webkit-slider-thumb)

## 6. DOM Structure

### 6.1 Major Sections

App Container contains: Sidebar (Logo, Navigation, Keyboard hints, Credit) and Main Content (Top bar, Hero visualizer card with Artwork+Details+Canvas, Track list section). Below is the Persistent Bottom Player Bar (Left: Cover+Info+Like, Center: Controls+Scrubber, Right: Speed+Volume). Hidden audio element for playback.

### 6.2 JavaScript Module Sections (app.js)

1. Soundtrack Database (TRACKS array)
2. Application State (global variables)
3. DOM Element References (cached getElementById)
4. Initialize (DOMContentLoaded)
5. Load Track (UI sync)
6. Play / Pause
7. Skip Controls (next/prev)
8. Track List Rendering (filtered/dynamic)
9. Web Audio Visualizer (canvas)
10. Timeline / Seek (progress bar)
11. Volume Controls
12. Shuffle and Repeat
13. Category Filtering and Search
14. Keyboard Shortcuts

## 7. Browser Compatibility

- HTML5 Audio: Chrome, Edge, Firefox, Safari all supported
- Web Audio API: Chrome, Edge, Firefox supported; Safari with webkit prefix
- CSS Grid, Backdrop Filter, Custom Properties: All browsers supported

The code includes window.AudioContext || window.webkitAudioContext fallback for Safari compatibility.

## 8. Performance Considerations

- No framework overhead - vanilla JS executes directly
- Lazy visualizer init - Web Audio API only created on first user interaction
- Canvas rendering - requestAnimationFrame for smooth 60fps
- DOM caching - All element references cached at script load
- Minimal DOM manipulation - Track list re-rendered only on filter/search change
- CDN assets - No local file serving overhead

## 9. Security Considerations

- All audio and images loaded from HTTPS CDNs
- crossorigin="anonymous" attribute on audio element for CORS
- No user data collection or storage
- No backend communication
- No eval() or dynamic code execution
