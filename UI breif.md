# UI Design Brief

**Project:** PulseWave - Modern Web Audio Player
**Task:** Task 3: Music Player
**Internship:** Arch Technologies

## 1. Design Philosophy

PulseWave adopts a dark cyberpunk aesthetic inspired by professional audio production software and futuristic dashboards. The design emphasizes:

- Dark backgrounds with subtle gradient overlays
- Neon accent colors (cyan, teal, purple) for interactive elements
- Glassmorphism (frosted glass effect) on cards and overlays
- Monospace typography for technical labels and data
- Smooth micro-interactions on all interactive elements

## 2. Color System

### 2.1 Backgrounds

- --bg-dark: #090B10 - Main page background
- --bg-sidebar: #0F131A - Sidebar panel
- --bg-card: rgba(22, 27, 36, 0.7) - Cards, track rows, glassmorphism
- --bg-card-hover: rgba(32, 40, 54, 0.85) - Hover state for cards

### 2.2 Accents

- --accent-cyan: #00F0FF - Primary accent (buttons, active states, links)
- --accent-teal: #00A3C4 - Secondary accent (gradients)
- --accent-purple: #7928CA - Tertiary (gradient endpoints, visualizer)

### 2.3 Text

- --text-main: #F8FAFC - Primary text (white)
- --text-muted: #94A3B8 - Secondary text (gray-blue)

### 2.4 Borders

- --border-subtle: rgba(255, 255, 255, 0.08) - Default borders
- --border-focus: rgba(0, 240, 255, 0.3) - Focus/active borders

## 3. Typography

### 3.1 Font Families

- Plus Jakarta Sans: 400, 500, 600, 700, 800 - All UI text, headings, body
- JetBrains Mono: 500, 700 - Labels, badges, timestamps, code-like elements

### 3.2 Type Scale

- Logo heading: 1.2rem, weight 800
- Section headings: 1.1rem, weight 700
- Track titles: 0.95rem, weight 700
- Body text: 0.85-0.9rem, weight 600
- Labels/badges: 10-11px, weight 500-700, uppercase
- Timestamps: 11-12px mono

## 4. Layout Structure

### 4.1 Page Grid

The page uses a two-column grid: Sidebar (260px fixed) on the left, Main Content on the right. The main content contains a Top Bar (Search + Status Badge), a Hero Visualizer Card (Art + Info + Canvas), and a Track List (Filterable Rows). A Persistent Bottom Player Bar (90px fixed) spans the full width at the bottom with three sections: Cover+Info, Controls+Scrubber, Speed+Volume.

### 4.2 Sidebar (260px fixed width)

- Logo area: Gradient icon + "PulseWave" title + "PRO AUDIO ENGINE" mono label
- Category navigation: List of genre filters with icons
- Keyboard hints: Monospace key badges in a dark card
- Credit: "Arch Tech Internship / Task 3: Music Player"

### 4.3 Hero Visualizer Card

- Full-width card with border-radius: 24px
- Background blur effect using album art (filter: blur(60px))
- Album artwork (170x170px, rounded)
- Track title (large, bold)
- Artist name, genre badge, play count
- Canvas-based frequency visualizer (bottom portion)

### 4.4 Track List

- Header with section title, track count, "Shuffle All" button
- Rows using CSS Grid: 40px | 50px | 1fr | 140px | 80px | 40px
- Columns: Index, Thumbnail, Title+Artist, Genre, Duration, Play button
- Active row highlighted with cyan border and tinted background
- Hover effect: translateX(4px) + border reveal

### 4.5 Bottom Player Bar (90px fixed)

- Left section (300px): Album cover thumbnail, track title, artist, like button
- Center section (flex): Shuffle, Prev, Play (44px circle), Next, Repeat + Scrubber timeline
- Right section (300px): Speed toggle button, volume icon + slider
