# 🔥 ROAD TO DOOMSDAY — Official Live Quiz Package

> **Event Theme**: Retro Marvel Comics (Ink, Kirby Krackle, Ben-Day Halftones) & 16-Bit Console Gaming  
> **Built by**: Quizzing Club • Tech & Data Vertical  
> **Runtime**: Offline Local Network (Laptop Hotspot + Phones)

---

## ⚡ Quick Start (Event Day)

### 1. Launch the Server & Views
Double-click `start.bat` in this folder, or run:
```bash
cd tech
node server.js
```

The server will automatically boot and display the local IP address (e.g., `192.168.1.45:3000`).

### 2. Open the Views
- **Projector Display Screen**: Open `http://localhost:3000/` in Chrome/Edge and press **F11** for full-screen.
- **Quizmaster Console**: Open `http://localhost:3000/console` on the QM's laptop or tablet.
- **Team Buzzers (Phones)**: Have each team join your Wi-Fi hotspot and navigate to:
  `http://<YOUR-IP>:3000/buzzer/<teamId>`  
  *(e.g., `http://192.168.1.45:3000/buzzer/avengers`)*

---

## 🎮 System Architecture & Views

### 1. Projector Display (`/`)
- **Retro Marvel Comic Aesthetic**: 8 distinct animated scenes including CRT scanlines, Ben-Day dot overlays, Kirby Krackle energy borders, and comic speech-bubble question cards.
- **Scenes Included**:
  - `attract`: Pre-event loop with pulsing "INSERT COIN" & retro Marvel masthead.
  - `prelims_timer`: Large countdown ring for the written prelims round.
  - `team_reveal`: Dramatic "THWAM!" comic impact reveals for advancing finalist teams.
  - `question`: Full-screen multimedia question card with category badge, points, and timer bar.
  - `grid`: Round 2 *Incursion Protocol* 5×2 category draft grid with animated incursion collapse.
  - `scoreboard`: Real-time pixel-art health-bar leaderboard.
  - `doom_clock`: 12-segment radial Doomsday Clock that advances on wrong answers with Doom laugh audio.
  - `victory`: Grand comic cover celebration screen displaying the winning team as `#1 CHAMPIONS`.
- **Audio Engine**: Synthesizes authentic 8-bit / 16-bit sound effects (arpeggios, player select chimes, comic impacts, woodblock timer ticks) directly via Web Audio API.

### 2. Quizmaster Console (`/console`)
- **Scene Switcher**: One-click switching of projector display views.
- **Question Controller**: Next/Prev question stepper with answer previews and an instant JSON question loader.
- **Buzzer Management**: Big "ARM / DISARM BUZZER" button with sub-50ms lockout detection, live buzz order queue, and +10/-10 grading buttons.
- **Pounce Management**: Set 30s countdown, collect typed pounce answers in real-time, and award pounce points (+10 / -5).
- **Scoreboard Manager**: Real-time scores, team color indicators, manual overrides, and dynamic team registration.
- **Grid Controller**: 10 clickable cells across *Earth-616* (10 pts) and *Earth-838* (20 pts).
- **SFX Soundboard**: Quick trigger buttons for correct fanfares, dramatic stings, and Doom laughs.

### 3. Mobile Buzzer (`/buzzer/:teamId`)
- **Zero-Install Phone UI**: Designed for mobile touch screens (`100dvh`, zero zoom latency, haptic feedback).
- **Arcade Buzz Button**: Massive crimson push-button that glows when armed, turns gold upon winning the buzz (#1), and locks out trailing buzzers.
- **Pounce Terminal**: Automatically transforms into a text-input card when the QM initiates a pounce question.

---

## 📜 Quiz Format & Content Included

All questions are pre-packaged in `content/`:

1. **Prelims (`content/prelims/questions.json`)**: 25 written questions across 5 genres:
   - *Heroes & Origins* (Q1–5)
   - *Villains & Conflicts* (Q6–10)
   - *Behind the Panel* (Q11–15)
   - *Screen & Adaptations* (Q16–20)
   - *Wildcard & Crossovers* (Q21–25 + Tiebreaker)
2. **Round 1 — The Multiverse Files (`content/finals/round1-multiverse.json`)**: 10 visual & lateral pounce/bounce questions.
3. **Round 2 — Incursion Protocol (`content/finals/round2-incursion.json`)**: 10 strategic draft questions across 5 categories (*Avengers, X-Men, Cosmic, Street-Level, Behind the Panel*) in two universal tiers.
4. **Round 3 — The Doomsday Gauntlet (`content/finals/round3-gauntlet.json`)**: 20 rapid-fire buzzer questions with escalating stakes (+10 to +15) culminating in the +25 pt final Doomsday Question.

---

## 🛠 Event Day Hotspot Setup Tips
1. Turn on your phone's personal hotspot (or use a pocket router).
2. Connect the host laptop to the hotspot.
3. Find the laptop's IPv4 address (`ipconfig` in terminal).
4. Have participants connect their phones to the same hotspot and open `http://<IP>:3000/buzzer/<teamId>`.
5. No active internet connection is required during the event!
