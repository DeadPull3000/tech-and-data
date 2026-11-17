// ═══════════════════════════════════════════════════════════════════
//  ROAD TO DOOMSDAY — Projector Display Engine
//  Retro Marvel Comics + 16-bit Console HUD Controller
// ═══════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  // ─── DOM Elements ────────────────────────────────────────────────
  const scenes = {
    attract: document.getElementById('scene-attract'),
    prelims_timer: document.getElementById('scene-prelims_timer'),
    team_reveal: document.getElementById('scene-team_reveal'),
    question: document.getElementById('scene-question'),
    grid: document.getElementById('scene-grid'),
    scoreboard: document.getElementById('scene-scoreboard'),
    doom_clock: document.getElementById('scene-doomsday_clock') || document.getElementById('scene-doom_clock'),
    doomsday_clock: document.getElementById('scene-doomsday_clock') || document.getElementById('scene-doom_clock'),
    victory: document.getElementById('scene-victory')
  };

  const prelimsTimerText = document.getElementById('prelims-timer-text');
  const revealImpact = document.getElementById('reveal-impact');
  const revealName = document.getElementById('reveal-name');
  const revealedTeams = document.getElementById('revealed-teams');
  
  const qCategory = document.getElementById('q-category');
  const qPoints = document.getElementById('q-points');
  const qText = document.getElementById('q-text');
  const qImage = document.getElementById('q-image');
  const qTimerBar = document.getElementById('q-timer-bar');
  const questionPanel = document.getElementById('question-panel');
  const comicSfxWord = document.getElementById('comic-sfx-word');
  const qHintCard = document.getElementById('q-hint-card');
  const qHintText = document.getElementById('q-hint-text');

  const COMIC_ACTION_WORDS = ['POW!', 'BAM!', 'SNIKT!', 'THWIP!', 'KRAK!', 'ZAP!', 'WHAM!', 'BOOM!'];
  let actionWordIdx = 0;

  const gridBody = document.getElementById('grid-body');
  const scoreboardList = document.getElementById('scoreboard-list');
  const doomsdaySvg = document.getElementById('doomsday-svg');
  const victoryName = document.getElementById('victory-name');
  const sfxPlayer = document.getElementById('sfx-player');

  // ─── State ───────────────────────────────────────────────────────
  let state = {
    teams: {},
    scores: {},
    currentQuestionIndex: -1,
    currentScene: 'attract',
    timer: { remaining: 0, total: 30 },
    doomClock: { level: 0, maxLevel: 12 },
    grid: null,
    revealedTeamsList: []
  };

  const GRID_CATEGORIES = [
    'AVENGERS',
    'X-MEN',
    'COSMIC',
    'STREET-LEVEL',
    'BEHIND THE PANEL'
  ];

  // ─── Audio Synthesis (Retro Web Audio API Chiptune/SFX) ──────────
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthSFX(type) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      switch (type) {
        case 'correct': {
          // 16-bit victorious fanfare: Arpeggio C5 -> E5 -> G5 -> C6
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.15, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
          });
          break;
        }

        case 'wrong':
        case 'doom_laugh': {
          // Low menacing sawtooth buzzer + slide down
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.65);
          break;
        }

        case 'buzz': {
          // Punchy Game-Show Hall Buzzer Sound
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(260, now);
          osc1.frequency.setValueAtTime(320, now + 0.08);

          osc2.type = 'square';
          osc2.frequency.setValueAtTime(390, now);
          osc2.frequency.setValueAtTime(480, now + 0.08);

          osc3.type = 'triangle';
          osc3.frequency.setValueAtTime(780, now);
          osc3.frequency.setValueAtTime(960, now + 0.08);

          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

          osc1.connect(gain);
          osc2.connect(gain);
          osc3.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc3.start(now);
          osc1.stop(now + 0.5);
          osc2.stop(now + 0.5);
          osc3.stop(now + 0.5);
          break;
        }

        case 'dramatic': {
          // Low resonant impact (G2 -> D2)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(98, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.25);
          break;
        }

        case 'tick': {
          // Clock tick woodblock
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'thwam': {
          // Comic impact noise blast
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }
      }
    } catch (e) {
      console.warn('[audio] Error synthesizing SFX:', e);
    }
  }

  // ─── Scene Management ─────────────────────────────────────────────
  function switchScene(sceneName) {
    if (!sceneName) return;
    const key = sceneName === 'doom_clock' ? 'doomsday_clock' : sceneName;
    
    // Hide all scenes
    Object.values(scenes).forEach(el => {
      if (el) el.classList.remove('active');
    });

    const target = scenes[key] || scenes[sceneName];
    if (target) {
      target.classList.add('active');
      state.currentScene = sceneName;
    }

    if (sceneName === 'scoreboard') {
      renderScoreboard();
    } else if (sceneName === 'grid') {
      renderGrid();
    } else if (sceneName === 'doom_clock' || sceneName === 'doomsday_clock') {
      renderDoomClock();
    } else if (sceneName === 'victory') {
      renderVictory();
    }
  }

  // ─── Renderers ───────────────────────────────────────────────────

  // 1. Question Display
  function renderQuestion(q, index) {
    // Hide hint card on new question
    if (qHintCard) {
      qHintCard.classList.add('hidden');
    }

    if (!q) {
      qCategory.textContent = 'ROAD TO DOOMSDAY';
      qPoints.textContent = '10 PTS';
      qText.innerHTML = 'Stand by for next mission...';
      qImage.innerHTML = '';
      return;
    }

    // Trigger Deck Transition Animation
    if (questionPanel) {
      questionPanel.classList.remove('deck-enter');
      void questionPanel.offsetWidth; // Reflow
      questionPanel.classList.add('deck-enter');
    }

    // Trigger Comic SFX Pop Word
    if (comicSfxWord) {
      const word = COMIC_ACTION_WORDS[actionWordIdx % COMIC_ACTION_WORDS.length];
      actionWordIdx++;
      comicSfxWord.textContent = word;
      comicSfxWord.classList.remove('pop');
      void comicSfxWord.offsetWidth;
      comicSfxWord.classList.add('pop');
      playSynthSFX('thwam');
    }

    qCategory.textContent = (q.category || 'GENERAL').toUpperCase();
    qPoints.textContent = `${q.points || 10} PTS`;
    qText.innerHTML = `<p>${q.text || ''}</p>`;

    if (q.image) {
      qImage.innerHTML = `<img src="${q.image}" alt="Clue Image" class="comic-img-clue">`;
      qImage.style.display = 'block';
    } else {
      qImage.innerHTML = '';
      qImage.style.display = 'none';
    }

    // Reset timer bar to full
    if (qTimerBar) {
      qTimerBar.style.width = '100%';
      qTimerBar.style.backgroundColor = '#2D6A4F';
    }
  }

  // 2. Scoreboard
  function renderScoreboard() {
    if (!scoreboardList) return;
    scoreboardList.innerHTML = '';

    const teamEntries = Object.entries(state.teams).map(([id, t]) => ({
      id,
      name: t.teamName || id,
      color: t.color || '#C41230',
      score: state.scores[id] || 0
    }));

    // Sort descending by score
    teamEntries.sort((a, b) => b.score - a.score);

    const maxScore = Math.max(50, ...teamEntries.map(t => t.score));

    teamEntries.forEach((team) => {
      const card = document.createElement('div');
      card.className = 'score-row';

      const pct = Math.max(5, Math.min(100, Math.round((team.score / maxScore) * 100)));

      card.innerHTML = `
        <div class="score-name" style="color: ${team.color}">${team.name}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${pct}%; background-color: ${team.color};"></div>
        </div>
        <div class="score-value">${team.score}</div>
      `;
      scoreboardList.appendChild(card);
    });

    if (teamEntries.length === 0) {
      scoreboardList.innerHTML = '<div class="empty-state" style="text-align:center;font-size:1.5rem;color:#888;">NO TEAMS REGISTERED YET</div>';
    }
  }

  // 3. Grid (Incursion Protocol)
  function renderGrid() {
    if (!gridBody) return;
    gridBody.innerHTML = '';

    const grid = state.grid || [];

    GRID_CATEGORIES.forEach((catName, rowIdx) => {
      const tr = document.createElement('tr');
      
      // Category Name Header Cell
      const catTh = document.createElement('td');
      catTh.className = 'grid-cat';
      catTh.textContent = catName;
      tr.appendChild(catTh);

      // Col 0: Earth-616 (10 pts)
      const td616 = document.createElement('td');
      const cell616Used = grid[0] && grid[0][rowIdx] && grid[0][rowIdx].used;
      if (cell616Used) td616.classList.add('used');
      td616.textContent = '10';
      tr.appendChild(td616);

      // Col 1: Earth-838 (20 pts)
      const td838 = document.createElement('td');
      const cell838Used = grid[1] && grid[1][rowIdx] && grid[1][rowIdx].used;
      if (cell838Used) td838.classList.add('used');
      td838.textContent = '20';
      tr.appendChild(td838);

      gridBody.appendChild(tr);
    });
  }

  // 4. Doomsday Clock (SVG Radial)
  function renderDoomClock() {
    if (!doomsdaySvg) return;
    doomsdaySvg.innerHTML = '';

    const totalSegments = state.doomClock.maxLevel || 12;
    const currentLevel = state.doomClock.level || 0;
    const center = 200;
    const radius = 160;
    const innerRadius = 90;

    // Outer background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', center);
    bgCircle.setAttribute('cy', center);
    bgCircle.setAttribute('r', radius + 15);
    bgCircle.setAttribute('fill', '#111122');
    bgCircle.setAttribute('stroke', '#F5C518');
    bgCircle.setAttribute('stroke-width', '8');
    doomsdaySvg.appendChild(bgCircle);

    // Center Doom mask badge
    const maskText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    maskText.setAttribute('x', center);
    maskText.setAttribute('y', center - 15);
    maskText.setAttribute('text-anchor', 'middle');
    maskText.setAttribute('fill', currentLevel >= totalSegments ? '#C41230' : '#2D6A4F');
    maskText.setAttribute('font-family', 'Bangers');
    maskText.setAttribute('font-size', '42');
    maskText.textContent = 'DOOM';
    doomsdaySvg.appendChild(maskText);

    const levelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    levelText.setAttribute('x', center);
    levelText.setAttribute('y', center + 30);
    levelText.setAttribute('text-anchor', 'middle');
    levelText.setAttribute('fill', '#FAFAFA');
    levelText.setAttribute('font-family', 'Space Mono');
    levelText.setAttribute('font-size', '28');
    levelText.setAttribute('font-weight', 'bold');
    levelText.textContent = `${currentLevel} / ${totalSegments}`;
    doomsdaySvg.appendChild(levelText);

    // Draw radial segments
    const angleStep = (2 * Math.PI) / totalSegments;

    for (let i = 0; i < totalSegments; i++) {
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = (i + 1) * angleStep - Math.PI / 2 - 0.05;

      const x1 = center + innerRadius * Math.cos(startAngle);
      const y1 = center + innerRadius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(startAngle);
      const y2 = center + radius * Math.sin(startAngle);

      const x3 = center + radius * Math.cos(endAngle);
      const y3 = center + radius * Math.sin(endAngle);
      const x4 = center + innerRadius * Math.cos(endAngle);
      const y4 = center + innerRadius * Math.sin(endAngle);

      const d = `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);

      const isActive = i < currentLevel;
      const isCritical = currentLevel >= 9;

      path.setAttribute('fill', isActive ? (isCritical ? '#C41230' : '#2D6A4F') : '#222238');
      path.setAttribute('stroke', '#0B0B14');
      path.setAttribute('stroke-width', '4');

      if (isActive) {
        path.setAttribute('class', 'doom-active-segment');
      }

      doomsdaySvg.appendChild(path);
    }
  }

  // 5. Team Reveal Sequence
  function triggerTeamReveal(teamName) {
    if (!revealImpact || !revealName) return;
    revealName.textContent = teamName;
    revealImpact.classList.remove('show');
    void revealImpact.offsetWidth; // Trigger reflow
    revealImpact.classList.add('show');
    playSynthSFX('thwam');

    if (revealedTeams && !state.revealedTeamsList.includes(teamName)) {
      state.revealedTeamsList.push(teamName);
      const chip = document.createElement('div');
      chip.className = 'team-chip';
      chip.textContent = teamName;
      revealedTeams.appendChild(chip);
    }
  }

  // 6. Victory Screen
  function renderVictory() {
    if (!victoryName) return;
    const teamEntries = Object.entries(state.teams).map(([id, t]) => ({
      name: t.teamName || id,
      score: state.scores[id] || 0
    }));

    if (teamEntries.length > 0) {
      teamEntries.sort((a, b) => b.score - a.score);
      victoryName.textContent = teamEntries[0].name.toUpperCase();
    } else {
      victoryName.textContent = 'CHAMPIONS';
    }
    playSynthSFX('correct');
  }

  // ─── WebSocket Client ─────────────────────────────────────────────
  let ws = null;
  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('[display] Connected to quiz server');
      ws.send(JSON.stringify({
        type: 'register',
        payload: { role: 'display' }
      }));
    };

    ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (e) {
        return;
      }

      const { type, payload } = msg;

      switch (type) {
        case 'state_sync': {
          if (payload) {
            Object.assign(state, payload);
            if (payload.currentScene) switchScene(payload.currentScene);
            if (payload.questions && typeof payload.currentQuestionIndex === 'number') {
              renderQuestion(payload.questions[payload.currentQuestionIndex], payload.currentQuestionIndex);
            }
            renderScoreboard();
            renderGrid();
            renderDoomClock();
          }
          break;
        }

        case 'scene_changed': {
          if (payload && payload.scene) switchScene(payload.scene);
          break;
        }

        case 'question_changed': {
          if (payload) {
            renderQuestion(payload.question, payload.index);
          }
          break;
        }

        case 'timer_tick': {
          if (payload) {
            const { remaining, total } = payload;
            state.timer.remaining = remaining;
            state.timer.total = total || 30;

            const displayRem = Math.ceil(remaining);
            if (prelimsTimerText) prelimsTimerText.textContent = displayRem;

            if (qTimerBar) {
              const pct = Math.max(0, Math.min(100, (remaining / state.timer.total) * 100));
              qTimerBar.style.width = `${pct}%`;
              if (pct < 25) {
                qTimerBar.style.backgroundColor = '#C41230';
              } else if (pct < 50) {
                qTimerBar.style.backgroundColor = '#F5C518';
              } else {
                qTimerBar.style.backgroundColor = '#2D6A4F';
              }
            }
          }
          break;
        }

        case 'timer_done': {
          playSynthSFX('tick');
          break;
        }

        case 'score_updated': {
          if (payload && payload.scores) {
            state.scores = payload.scores;
            renderScoreboard();
          }
          break;
        }

        case 'teams_updated': {
          if (payload && payload.teams) {
            state.teams = {};
            payload.teams.forEach(t => { state.teams[t.teamId] = t; });
            renderScoreboard();
          }
          break;
        }

        case 'buzz_result': {
          if (payload) {
            playSynthSFX('buzz');
            // Brief visual flash on question panel
            if (qText) {
              qText.classList.add('buzz-flash');
              setTimeout(() => qText.classList.remove('buzz-flash'), 600);
            }
          }
          break;
        }

        case 'team_revealed': {
          if (payload && payload.teamName) {
            triggerTeamReveal(payload.teamName);
          }
          break;
        }

        case 'grid_updated': {
          if (payload && payload.grid) {
            state.grid = payload.grid;
            renderGrid();
          }
          break;
        }

        case 'doom_clock_advanced': {
          if (payload) {
            state.doomClock.level = payload.level;
            state.doomClock.maxLevel = payload.maxLevel;
            renderDoomClock();
            playSynthSFX('doom_laugh');
          }
          break;
        }

        case 'play_sfx': {
          if (payload && payload.sfx) {
            playSynthSFX(payload.sfx);
          }
          break;
        }

        case 'hint_revealed': {
          if (payload && payload.hint && qHintCard && qHintText) {
            qHintText.textContent = payload.hint;
            qHintCard.classList.remove('hidden');
            playSynthSFX('buzz');
          }
          break;
        }
      }
    };

    ws.onclose = () => {
      console.warn('[display] Disconnected, reconnecting in 2s...');
      setTimeout(connect, 2000);
    };

    ws.onerror = (err) => {
      console.error('[display] WS error:', err);
      ws.close();
    };
  }

  // Allow audio on first user interaction with screen
  window.addEventListener('click', () => { getAudioCtx(); }, { once: true });
  window.addEventListener('keydown', () => { getAudioCtx(); }, { once: true });

  // Boot
  const joinUrlText = document.getElementById('join-url-text');
  fetch('/api/network')
    .then(r => r.json())
    .then(data => {
      if (data && data.ip && joinUrlText) {
        joinUrlText.textContent = `http://${data.ip}:${data.port || 3000}/buzzer/<your_team>`;
      }
    })
    .catch(() => {});

  connect();
  renderGrid();
  renderDoomClock();
})();
