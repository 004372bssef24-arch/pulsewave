# Application Flow Documentation

**Project:** PulseWave - Modern Web Audio Player
**Task:** Task 3: Music Player
**Internship:** Arch Technologies

## 1. Application Lifecycle

1. Browser loads index.html
2. Parse HTML, load CSS
3. Load Lucide Icons CDN
4. Load Google Fonts
5. Execute app.js
6. DOMContentLoaded fires:
   - loadTrack(0)
   - renderTrackList()
   - lucide.createIcons()
7. App is ready, waiting for user interaction

## 2. Core Playback Flow

### 2.1 Play a Track

User clicks Play button (or track row, or Space key) -> togglePlay() called:
- Check if visualizer initialized: If No -> initVisualizer() (Create AudioContext, Connect nodes). If Yes -> continue.
- Is isPlaying true? Yes -> pauseTrack() (audio.pause(), isPlaying=false, Show play icon). No -> playTrack() (audio.play().then(...), isPlaying=true, Show pause icon).

### 2.2 Track Navigation

User clicks Next or Previous:
- nextTrack(): Is shuffle enabled? Yes -> Pick random index (not current). No -> (currentIndex + 1) % TRACKS.length.
- prevTrack(): Is currentTime > 3 seconds? Yes -> Restart current track (currentTime = 0). No -> (currentIndex - 1 + TRACKS.length) % TRACKS.length.
- Both call loadTrack(newIndex) then playTrack().

### 2.3 Auto-Advance on Track End

Audio "ended" event fires -> What is repeatMode?
- Mode 0 (Off): Is last track? Yes -> pauseTrack(). No -> nextTrack().
- Mode 1 (All): nextTrack()
- Mode 2 (One): audio.currentTime = 0, playTrack()

## 3. Track List Rendering Flow

renderTrackList() called:
1. getFilteredTracks(): Apply category filter (selectedCategory === "All" or match), Apply search filter (title, artist, genre includes query)
2. filtered.length === 0? Yes -> Show empty state div. No -> For each track: Create .track-row element, Set active class if current track, Set live dot if currently playing, Attach click event listener, Append to trackListEl.
3. lucide.createIcons() to render SVG icons.

## 4. Search Flow

User types in search input -> "input" event fires:
- Update searchQuery variable
- Toggle clear button visibility
- renderTrackList() -> Re-filter and re-render

## 5. Category Filter Flow

User clicks a category in the sidebar -> Click event on #category-filters:
- Find closest .cat-item element
- Remove .active from all items
- Add .active to clicked item
- Update selectedCategory variable
- Update section title text
- renderTrackList() -> Re-filter and re-render

## 6. Volume Control Flow

User interacts with volume:
- Slider Input: Set audio.volume from slider value -> updateVolumeIcon(vol)
- Mute Click: Is volume > 0? Yes: Save prev volume, set to 0. No: Restore saved volume. -> updateVolumeIcon(vol)

updateVolumeIcon(vol):
- vol === 0 -> "volume-x"
- vol < 0.5 -> "volume-1"
- vol >= 0.5 -> "volume-2"
- lucide.createIcons()

## 7. Shuffle and Repeat Flow

### 7.1 Shuffle Toggle

User clicks shuffle button -> isShuffle = !isShuffle, Toggle .active class on button.

### 7.2 Shuffle All

User clicks "Shuffle All" button -> isShuffle = true, Add .active to shuffle button, nextTrack() picks random track.

### 7.3 Repeat Cycle

User clicks repeat button -> repeatMode = (repeatMode + 1) % 3:
- Mode 0: Off (remove .active)
- Mode 1: All (add .active, set tooltip)
- Mode 2: One (add .active, set tooltip)

## 8. Playback Speed Flow

User clicks speed button -> currentSpeedIndex = (index + 1) % 4 -> audio.playbackRate = speedOptions[newIndex] -> Update button text (e.g., "1.5x").

## 9. Visualizer Initialization Flow

First play interaction detected -> initVisualizer():
1. Check if already initialized
2. Create AudioContext (with webkit fallback)
3. Create AnalyserNode (fftSize=64, 32 frequency bins)
4. Create MediaElementSource from audio element
5. Connect: source -> analyser -> destination
6. Set visualizerInitialized = true
7. Start renderVisualizerFrame()

renderVisualizerFrame() loop:
- requestAnimationFrame loop
- Get frequency data
- Clear canvas
- Draw gradient bars for each frequency bin
- Repeat

## 10. Keyboard Shortcut Flow

User presses a key:
- Is target an INPUT element? Yes -> Ignore (allow typing in search). No -> Continue.
- Space -> togglePlay()
- ArrowRight -> Seek +5s + preventDefault()
- ArrowLeft -> Seek -5s + preventDefault()
- KeyM -> Click mute button
- All arrow keys use e.preventDefault() to block scrolling

## 11. Seek Bar Interaction

User clicks on progress bar:
1. Get click position relative to bar
2. clickX / barWidth * audio.duration
3. audio.currentTime = calculated time
4. timeupdate event fires -> Updates: current-time label, progress-fill width, seek-thumb position

## 12. State Diagram Summary

States: STOPPED, PLAYING, PAUSED, NEXT/PREV

- STOPPED -> click play -> PLAYING
- PLAYING -> click pause -> PAUSED
- PAUSED -> click play -> PLAYING
- PLAYING -> track ends (repeat off, last track) -> STOPPED
- PLAYING -> next/prev -> loadTrack() -> playTrack() -> PLAYING
