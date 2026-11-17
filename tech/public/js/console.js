// ═══════════════════════════════════════════════════════════════════
//  ROAD TO DOOMSDAY — Quizmaster Console Controller
// ═══════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  // ─── DOM Elements ────────────────────────────────────────────────
  const connStatus = document.getElementById('conn-status');
  const phoneConnectUrl = document.getElementById('phone-connect-url');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const sceneBtns = document.querySelectorAll('.scene-btn');
  const roundBtns = document.querySelectorAll('.round-btn');

  // Question Controls
  const qCounter = document.getElementById('q-counter');
  const qCategory = document.getElementById('q-category');
  const qPoints = document.getElementById('q-points');
  const qText = document.getElementById('q-text');
  const qAnswer = document.getElementById('q-answer');
  const qHint = document.getElementById('q-hint');
  const btnPrevQ = document.getElementById('btn-prev-q');
  const btnShowQ = document.getElementById('btn-show-q');
  const btnRevealHint = document.getElementById('btn-reveal-hint');
  const btnNextQ = document.getElementById('btn-next-q');
  const qJson = document.getElementById('q-json');
  const btnLoadQ = document.getElementById('btn-load-q');

  // Answer Key Elements
  const btnToggleAk = document.getElementById('btn-toggle-ak');
  const btnCloseAk = document.getElementById('btn-close-ak');
  const panelAnswerKey = document.getElementById('panel-answer-key');
  const akCardsContainer = document.getElementById('ak-cards-container');
  const akTabs = document.querySelectorAll('.ak-tab-btn');
  const akSearchInput = document.getElementById('ak-search-input');
  const akTotalCount = document.getElementById('ak-total-count');

  // Timer Controls
  const timerDisplay = document.getElementById('timer-display');
  const timerDuration = document.getElementById('timer-duration');
  const btnTimerStart = document.getElementById('btn-timer-start');
  const btnTimerPause = document.getElementById('btn-timer-pause');
  const btnTimerReset = document.getElementById('btn-timer-reset');

  // Buzzer Controls
  const btnArmBuzzer = document.getElementById('btn-arm-buzzer');
  const buzzOrderList = document.getElementById('buzz-order');
  const btnClearBuzzes = document.getElementById('btn-clear-buzzes');

  // Pounce Controls
  const pounceDuration = document.getElementById('pounce-duration');
  const btnOpenPounce = document.getElementById('btn-open-pounce');
  const btnClosePounce = document.getElementById('btn-close-pounce');
  const btnAutoGradePounce = document.getElementById('btn-auto-grade-pounce');
  const pounceTimer = document.getElementById('pounce-timer');
  const pounceAnswers = document.getElementById('pounce-answers');

  // Scoreboard Controls
  const scoreTbody = document.getElementById('score-tbody');
  const newTeamName = document.getElementById('new-team-name');
  const newTeamColor = document.getElementById('new-team-color');
  const btnAddTeam = document.getElementById('btn-add-team');

  // Grid Controls
  const gridContainer = document.getElementById('grid-container');

  // Doom Controls
  const doomLevel = document.getElementById('doom-level');
  const doomBar = document.getElementById('doom-bar');
  const btnAdvanceDoom = document.getElementById('btn-advance-doom');
  const btnResetDoom = document.getElementById('btn-reset-doom');

  // SFX & Reveal
  const sfxBtns = document.querySelectorAll('.sfx-btn');
  const revealList = document.getElementById('reveal-list');

  // ─── Console Audio Alert ─────────────────────────────────────────
  let consoleAudioCtx = null;
  function playConsoleBuzzChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!consoleAudioCtx && AudioContext) consoleAudioCtx = new AudioContext();
      if (consoleAudioCtx && consoleAudioCtx.state === 'suspended') consoleAudioCtx.resume();
      if (!consoleAudioCtx) return;
      const now = consoleAudioCtx.currentTime;
      const osc = consoleAudioCtx.createOscillator();
      const gain = consoleAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(consoleAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // ─── Local State ─────────────────────────────────────────────────
  let state = {
    teams: {},
    scores: {},
    currentQuestionIndex: -1,
    questions: [],
    buzzer: { armed: false, buzzOrder: [] },
    pounce: { open: false, answers: {} },
    timer: { remaining: 0, total: 30, running: false },
    doomClock: { level: 0, maxLevel: 12 },
    grid: Array.from({ length: 2 }, () => Array(5).fill({ used: false })),
    currentScene: 'attract',
    currentRound: 'prelims'
  };

  const GRID_CATEGORIES = [
    'Avengers',
    'X-Men',
    'Cosmic',
    'Street-Level',
    'Behind the Panel'
  ];

  // ─── WebSocket Client ─────────────────────────────────────────────
  let ws = null;

  function send(type, payload = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      connStatus.className = 'conn-connected';
      connStatus.textContent = '⬤ CONNECTED';
      send('register', { role: 'console' });
    };

    ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }
      const { type, payload } = msg;

      switch (type) {
        case 'state_sync':
          if (payload) {
            Object.assign(state, payload);
            updateAllUI();
          }
          break;

        case 'timer_tick':
          if (payload) {
            state.timer.remaining = payload.remaining;
            state.timer.total = payload.total;
            updateTimerDisplay(payload.remaining);
          }
          break;

        case 'timer_done':
          state.timer.running = false;
          updateTimerDisplay(0);
          break;

        case 'buzzer_armed':
          state.buzzer.armed = true;
          state.buzzer.buzzOrder = [];
          updateBuzzerUI();
          break;

        case 'buzzer_disarmed':
          state.buzzer.armed = false;
          updateBuzzerUI();
          break;

        case 'buzz_result':
          if (payload) {
            state.buzzer.buzzOrder.push(payload);
            updateBuzzOrderUI();
            playConsoleBuzzChime();
          }
          break;

        case 'pounce_opened':
          state.pounce.open = true;
          btnOpenPounce.disabled = true;
          btnClosePounce.disabled = false;
          pounceAnswers.innerHTML = '<p class="empty-msg">Waiting for team submissions...</p>';
          break;

        case 'pounce_closed':
          state.pounce.open = false;
          btnOpenPounce.disabled = false;
          btnClosePounce.disabled = true;
          break;

        case 'pounce_answers':
          if (payload && payload.answers) {
            renderPounceAnswers(payload.answers);
          }
          break;

        case 'score_updated':
          if (payload && payload.scores) {
            state.scores = payload.scores;
            renderScoreTable();
          }
          break;

        case 'teams_updated':
          if (payload && payload.teams) {
            state.teams = {};
            payload.teams.forEach(t => { state.teams[t.teamId] = t; });
            renderScoreTable();
            renderRevealList();
          }
          break;

        case 'grid_updated':
          if (payload && payload.grid) {
            state.grid = payload.grid;
            renderGridUI();
          }
          break;

        case 'doom_clock_advanced':
          if (payload) {
            state.doomClock.level = payload.level;
            state.doomClock.maxLevel = payload.maxLevel;
            updateDoomUI();
          }
          break;

        case 'scene_changed':
          if (payload && payload.scene) {
            highlightScene(payload.scene);
          }
          break;

        case 'question_changed':
          if (payload) {
            state.currentQuestionIndex = payload.index;
            renderQuestionUI();
            if (panelAnswerKey && !panelAnswerKey.classList.contains('hidden')) {
              renderAnswerKey();
            }
          }
          break;
      }
    };

    ws.onclose = () => {
      connStatus.className = 'conn-disconnected';
      connStatus.textContent = '⬤ DISCONNECTED';
      setTimeout(connect, 2000);
    };
  }

  // ─── UI Renderers ────────────────────────────────────────────────

  function updateAllUI() {
    highlightScene(state.currentScene);
    renderQuestionUI();
    renderScoreTable();
    renderRevealList();
    renderGridUI();
    updateBuzzerUI();
    updateDoomUI();
    updateTimerDisplay(state.timer.remaining);
    renderAnswerKey();
  }

  function highlightScene(scene) {
    sceneBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scene === scene);
    });
  }

  function updateTimerDisplay(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }

  function renderQuestionUI() {
    const list = state.questions || [];
    const idx = state.currentQuestionIndex;

    qCounter.textContent = `${list.length > 0 && idx >= 0 ? idx + 1 : 0} / ${list.length}`;

    if (idx >= 0 && idx < list.length) {
      const q = list[idx];
      qCategory.textContent = q.category || 'GENERAL';
      qPoints.textContent = `${q.points || 10} pts`;
      qText.textContent = q.text || 'No question text';
      qAnswer.textContent = `Answer: ${q.answer || 'Not specified'}`;
      if (qHint) {
        qHint.textContent = `💡 Hint: ${q.hint || 'No hint provided'}`;
      }
    } else {
      qCategory.textContent = '—';
      qPoints.textContent = '— pts';
      qText.textContent = list.length === 0 ? 'No questions loaded' : 'No active question selected';
      qAnswer.textContent = 'Answer: —';
      if (qHint) qHint.textContent = '💡 Hint: —';
    }
  }

  function updateBuzzerUI() {
    if (state.buzzer.armed) {
      btnArmBuzzer.className = 'btn btn-buzzer armed';
      btnArmBuzzer.textContent = 'BUZZER ARMED (Click to Disarm)';
    } else {
      btnArmBuzzer.className = 'btn btn-buzzer disarmed';
      btnArmBuzzer.textContent = 'ARM BUZZER';
    }
    updateBuzzOrderUI();
  }

  function updateBuzzOrderUI() {
    buzzOrderList.innerHTML = '';
    const orders = state.buzzer.buzzOrder || [];

    if (orders.length === 0) {
      buzzOrderList.innerHTML = '<p class="empty-msg">No buzzes yet</p>';
      return;
    }

    orders.forEach((b, i) => {
      const div = document.createElement('div');
      div.className = `buzz-item ${i === 0 ? 'first' : ''}`;
      div.innerHTML = `
        <div>
          <strong>#${b.order}</strong> ${b.teamName || b.teamId}
        </div>
        <div class="buzz-item-actions">
          <button class="btn btn-sm btn-green judge-btn" data-team="${b.teamId}" data-correct="true">✓ Correct (+10)</button>
          <button class="btn btn-sm btn-red judge-btn" data-team="${b.teamId}" data-correct="false">✗ Wrong</button>
        </div>
      `;
      buzzOrderList.appendChild(div);
    });

    buzzOrderList.querySelectorAll('.judge-btn').forEach(btn => {
      btn.onclick = () => {
        const teamId = btn.dataset.team;
        const correct = btn.dataset.correct === 'true';
        send('judge', { teamId, correct, points: 10 });
        if (!correct) {
          send('advance_doom_clock', {});
        }
      };
    });
  }

  // ─── Smart / Fuzzy Answer Matching ──────────────────────────────
  function cleanAnswer(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\[.*?\]/g, ' ')
      .replace(/\(.*?\)/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\bmr\b/g, 'mister')
      .replace(/\bdr\b/g, 'doctor')
      .replace(/\bprof\b/g, 'professor')
      .replace(/\bcapt\b/g, 'captain')
      .replace(/\b(the|a|an|is|of|and|or)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function levDistance(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function isAnswerMatch(userAnswer, officialAnswer, aliases = []) {
    const u = cleanAnswer(userAnswer);
    if (!u) return { matched: false };

    const rawTargets = [...(aliases || [])];
    if (officialAnswer) {
      rawTargets.push(officialAnswer);
      officialAnswer.split(/[\/,]|\bor\b/i).forEach(chunk => {
        rawTargets.push(chunk);
      });
      const parens = officialAnswer.match(/\((.*?)\)/g);
      if (parens) {
        parens.forEach(p => rawTargets.push(p.replace(/[\(\)]/g, '')));
      }
    }

    for (let raw of rawTargets) {
      const c = cleanAnswer(raw);
      if (!c) continue;

      if (u === c) return { matched: true, reason: 'exact' };

      if (u.includes(c) || (c.length >= 4 && c.includes(u))) {
        return { matched: true, reason: 'contains' };
      }

      const cTokens = c.split(' ').filter(Boolean);
      const uTokens = u.split(' ').filter(Boolean);
      if (cTokens.length > 1 && cTokens.every(t => u.includes(t))) {
        return { matched: true, reason: 'tokens' };
      }
      if (uTokens.length > 1 && uTokens.every(t => c.includes(t))) {
        return { matched: true, reason: 'tokens' };
      }

      const dist = levDistance(u, c);
      const maxLen = Math.max(u.length, c.length);
      if (maxLen <= 5 && dist <= 1) return { matched: true, reason: 'typo' };
      if (maxLen <= 8 && dist <= 2) return { matched: true, reason: 'typo' };
      if (maxLen > 8 && dist <= 3) return { matched: true, reason: 'typo' };
    }

    return { matched: false };
  }

  let currentPounceList = [];

  function renderPounceAnswers(answers) {
    pounceAnswers.innerHTML = '';
    currentPounceList = answers || [];
    if (!answers || answers.length === 0) {
      pounceAnswers.innerHTML = '<p class="empty-msg">No pounce answers received</p>';
      return;
    }

    const q = state.questions[state.currentQuestionIndex];
    const offAnswer = q ? q.answer : '';
    const aliases = (q && q.aliases) || [];

    answers.forEach(item => {
      const team = state.teams[item.teamId];
      const tName = team ? team.teamName : item.teamId;
      const matchResult = isAnswerMatch(item.answer, offAnswer, aliases);
      item._matched = matchResult.matched;

      const row = document.createElement('div');
      row.className = `pounce-row ${matchResult.matched ? 'matched' : 'unmatched'}`;
      row.dataset.team = item.teamId;

      const badgeHtml = matchResult.matched
        ? `<span class="match-badge match-yes">MATCH ✓</span>`
        : `<span class="match-badge match-no">NO MATCH ✗</span>`;

      row.innerHTML = `
        <div>
          <strong>${tName}:</strong> <span>"${item.answer}"</span>
          ${badgeHtml}
        </div>
        <div class="buzz-item-actions">
          <button class="btn btn-sm btn-green pounce-judge" data-team="${item.teamId}" data-delta="10">✓ (+10)</button>
          <button class="btn btn-sm btn-red pounce-judge" data-team="${item.teamId}" data-delta="-5">✗ (-5)</button>
        </div>
      `;
      pounceAnswers.appendChild(row);
    });

    pounceAnswers.querySelectorAll('.pounce-judge').forEach(btn => {
      btn.onclick = () => {
        const teamId = btn.dataset.team;
        const delta = parseInt(btn.dataset.delta, 10);
        send('update_score', { teamId, delta });
        const actions = btn.parentElement;
        actions.innerHTML = `<span style="font-size:12px; font-weight:bold; color:${delta > 0 ? '#38b000' : '#c41230'}">${delta > 0 ? '✓ GRADED (+10)' : '✗ GRADED (-5)'}</span>`;
      };
    });
  }

  function renderScoreTable() {
    scoreTbody.innerHTML = '';
    const teams = Object.values(state.teams);

    if (teams.length === 0) {
      scoreTbody.innerHTML = '<tr><td colspan="6" class="empty-msg">No teams yet. Add one below!</td></tr>';
      return;
    }

    teams.forEach(t => {
      const currentScore = state.scores[t.teamId] || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="team-color-dot" style="background:${t.color || '#C41230'}"></span></td>
        <td><strong>${t.teamName}</strong> <small style="color:#666">(${t.teamId})</small></td>
        <td><strong style="color:var(--gold); font-size:16px;">${currentScore}</strong></td>
        <td>
          <button class="btn btn-sm btn-green score-delta-btn" data-team="${t.teamId}" data-delta="10">+10</button>
          <button class="btn btn-sm btn-red score-delta-btn" data-team="${t.teamId}" data-delta="-10">-10</button>
        </td>
        <td>
          <input type="number" class="input-sm score-manual-input" style="width:70px" value="${currentScore}" data-team="${t.teamId}">
          <button class="btn btn-sm score-set-btn" data-team="${t.teamId}">Set</button>
        </td>
        <td>
          <button class="btn btn-sm btn-red remove-team-btn" data-team="${t.teamId}">✕</button>
        </td>
      `;
      scoreTbody.appendChild(tr);
    });

    scoreTbody.querySelectorAll('.score-delta-btn').forEach(btn => {
      btn.onclick = () => {
        send('update_score', { teamId: btn.dataset.team, delta: parseInt(btn.dataset.delta, 10) });
      };
    });

    scoreTbody.querySelectorAll('.score-set-btn').forEach(btn => {
      btn.onclick = () => {
        const input = scoreTbody.querySelector(`.score-manual-input[data-team="${btn.dataset.team}"]`);
        if (input) {
          const newTotal = parseInt(input.value, 10) || 0;
          const current = state.scores[btn.dataset.team] || 0;
          send('update_score', { teamId: btn.dataset.team, delta: newTotal - current });
        }
      };
    });

    scoreTbody.querySelectorAll('.remove-team-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm(`Remove team ${btn.dataset.team}?`)) {
          send('remove_team', { teamId: btn.dataset.team });
        }
      };
    });
  }

  function renderRevealList() {
    revealList.innerHTML = '';
    const teams = Object.values(state.teams);
    if (teams.length === 0) {
      revealList.innerHTML = '<p class="empty-msg">No teams added yet</p>';
      return;
    }
    teams.forEach(t => {
      const div = document.createElement('div');
      div.className = 'reveal-row';
      div.innerHTML = `
        <span>${t.teamName}</span>
        <button class="btn btn-sm btn-gold reveal-team-btn" data-team="${t.teamId}">THWAM! Reveal</button>
      `;
      revealList.appendChild(div);
    });

    revealList.querySelectorAll('.reveal-team-btn').forEach(btn => {
      btn.onclick = () => {
        send('reveal_team', { teamId: btn.dataset.team });
      };
    });
  }

  function renderGridUI() {
    gridContainer.innerHTML = '';
    const grid = state.grid || [];

    GRID_CATEGORIES.forEach((cat, rowIdx) => {
      // Col 0: Earth-616
      const used616 = grid[0] && grid[0][rowIdx] && grid[0][rowIdx].used;
      const btn616 = document.createElement('button');
      btn616.className = `grid-cell-btn ${used616 ? 'used' : ''}`;
      btn616.innerHTML = `<strong>${cat}</strong><br><small>Earth-616 (10 pts)</small>`;
      btn616.onclick = () => {
        send('select_grid_cell', { row: 0, col: rowIdx });
      };
      gridContainer.appendChild(btn616);

      // Col 1: Earth-838
      const used838 = grid[1] && grid[1][rowIdx] && grid[1][rowIdx].used;
      const btn838 = document.createElement('button');
      btn838.className = `grid-cell-btn ${used838 ? 'used' : ''}`;
      btn838.innerHTML = `<strong>${cat}</strong><br><small>Earth-838 (20 pts)</small>`;
      btn838.onclick = () => {
        send('select_grid_cell', { row: 1, col: rowIdx });
      };
      gridContainer.appendChild(btn838);
    });
  }

  function updateDoomUI() {
    const level = state.doomClock.level || 0;
    const max = state.doomClock.maxLevel || 12;
    doomLevel.textContent = `${level} / ${max}`;
    const pct = Math.min(100, Math.round((level / max) * 100));
    doomBar.style.width = `${pct}%`;
  }

  // ─── Answer Key Controller ─────────────────────────────────────────
  let currentAkRoundFilter = 'all';
  let currentAkSearchQuery = '';

  function renderAnswerKey() {
    if (!akCardsContainer) return;
    const allQuestions = (state.questions && state.questions.length > 0)
      ? state.questions
      : [];

    if (akTotalCount) {
      akTotalCount.textContent = `${allQuestions.length} Questions Loaded across All Rounds`;
    }

    // Update tab labels with live counts
    if (akTabs) {
      akTabs.forEach(btn => {
        const r = btn.dataset.round;
        let count = 0;
        if (r === 'all') count = allQuestions.length;
        else if (r === 'prelims') count = allQuestions.filter(q => q.round === 'prelims' || !q.round).length;
        else if (r === 'round1') count = allQuestions.filter(q => q.round === 'round1').length;
        else if (r === 'round2') count = allQuestions.filter(q => q.round === 'round2').length;
        else if (r === 'round3') count = allQuestions.filter(q => q.round === 'round3').length;

        const baseLabel = r === 'all' ? 'All' :
                          r === 'prelims' ? 'Prelims' :
                          r === 'round1' ? 'R1 — Multiverse' :
                          r === 'round2' ? 'R2 — Incursion Grid' : 'R3 — Gauntlet';
        btn.textContent = `${baseLabel} (${count})`;
      });
    }

    // Filter questions
    const filtered = allQuestions.map((q, origIdx) => ({ ...q, _originalIndex: origIdx }))
      .filter(q => {
        // Round filter
        if (currentAkRoundFilter !== 'all') {
          const qRound = q.round || 'prelims';
          if (qRound !== currentAkRoundFilter) return false;
        }

        // Search query filter
        if (currentAkSearchQuery) {
          const text = (q.text || '').toLowerCase();
          const ans = (q.answer || '').toLowerCase();
          const hint = (q.hint || '').toLowerCase();
          const cat = (q.category || '').toLowerCase();
          const alts = (q.acceptableAnswers || []).join(' ').toLowerCase();
          const qNum = `q${q._originalIndex + 1}`;
          if (!text.includes(currentAkSearchQuery) &&
              !ans.includes(currentAkSearchQuery) &&
              !hint.includes(currentAkSearchQuery) &&
              !cat.includes(currentAkSearchQuery) &&
              !alts.includes(currentAkSearchQuery) &&
              !qNum.includes(currentAkSearchQuery)) {
            return false;
          }
        }
        return true;
      });

    akCardsContainer.innerHTML = '';

    if (filtered.length === 0) {
      akCardsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 10px; font-size: 14px;">No questions found matching your filter or search query.</div>';
      return;
    }

    filtered.forEach(q => {
      const card = document.createElement('div');
      card.className = 'ak-card';
      const isCurrent = state.currentQuestionIndex === q._originalIndex;
      if (isCurrent) {
        card.style.border = '2px solid var(--gold)';
        card.style.background = '#1b1b32';
      }

      const roundClass = `ak-round-${q.round || 'prelims'}`;
      const roundLabel = q.round === 'prelims' ? 'Prelims' :
                         q.round === 'round1' ? 'R1: Multiverse' :
                         q.round === 'round2' ? 'R2: Incursion' :
                         q.round === 'round3' ? 'R3: Gauntlet' : (q.round || 'Quiz');

      const altAnswersHtml = (q.acceptableAnswers && q.acceptableAnswers.length > 0)
        ? `<div style="font-size: 11px; color: #8bb; margin-top: 5px;"><strong>Accepted Variations:</strong> ${q.acceptableAnswers.map(a => `<span style="background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 3px; margin-right: 4px; display:inline-block;">${a}</span>`).join('')}</div>`
        : '';

      card.innerHTML = `
        <div class="ak-card-meta">
          <span class="ak-round-badge ${roundClass}">${roundLabel}</span>
          <span style="font-weight:bold; color:var(--text-muted);">#${q._originalIndex + 1}</span>
          <span class="q-tag" style="margin: 0 4px;">${q.category || 'General'}</span>
          <span class="q-tag q-tag-gold">${q.points || 10} pts</span>
        </div>
        <div class="ak-qtext"><strong>Q${q._originalIndex + 1}:</strong> ${q.text || '—'}</div>
        <div class="ak-answer-box">
          <strong>ANSWER:</strong> ${q.answer || '—'}
          ${altAnswersHtml}
        </div>
        <div class="ak-hint-box">
          💡 <strong>Hint:</strong> ${q.hint || 'No hint provided'}
        </div>
        <div class="ak-card-actions">
          <button class="btn btn-sm ${isCurrent ? 'btn-green' : 'btn-gold'} ak-jump-btn" data-qindex="${q._originalIndex}">
            ${isCurrent ? '★ Active on Display' : '▶ Jump on Display'}
          </button>
        </div>
      `;

      akCardsContainer.appendChild(card);
    });

    akCardsContainer.querySelectorAll('.ak-jump-btn').forEach(btn => {
      btn.onclick = () => {
        const qIdx = parseInt(btn.dataset.qindex, 10);
        if (!isNaN(qIdx)) {
          send('show_question', { questionIndex: qIdx });
          send('set_scene', { scene: 'question' });
          highlightScene('question');
          state.currentQuestionIndex = qIdx;
          renderQuestionUI();
          renderAnswerKey();
        }
      };
    });
  }

  // ─── Event Listeners ─────────────────────────────────────────────

  // Scene Buttons
  sceneBtns.forEach(btn => {
    btn.onclick = () => {
      send('set_scene', { scene: btn.dataset.scene });
    };
  });

  // Round Selector
  roundBtns.forEach(btn => {
    btn.onclick = () => {
      roundBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      send('set_round', { round: btn.dataset.round });
    };
  });

  // Question Navigation
  btnPrevQ.onclick = () => {
    if (state.currentQuestionIndex > 0) {
      send('show_question', { questionIndex: state.currentQuestionIndex - 1 });
    }
  };

  btnNextQ.onclick = () => {
    send('next_question', {});
  };

  btnShowQ.onclick = () => {
    send('show_question', { questionIndex: state.currentQuestionIndex });
  };

  if (btnRevealHint) {
    btnRevealHint.onclick = () => {
      const q = state.questions[state.currentQuestionIndex];
      if (q && q.hint) {
        send('reveal_hint', { hint: q.hint });
      } else {
        send('reveal_hint', { hint: "Here's a hint: Use your brain before Doom steals it!" });
      }
    };
  }

  btnLoadQ.onclick = () => {
    try {
      const parsed = JSON.parse(qJson.value);
      if (Array.isArray(parsed)) {
        state.questions = parsed;
        state.currentQuestionIndex = 0;
        renderQuestionUI();
        send('show_question', { questionIndex: 0 });
        alert(`Loaded ${parsed.length} questions successfully!`);
      } else {
        alert('Invalid format: JSON must be an array of question objects.');
      }
    } catch (e) {
      alert(`JSON Parse Error: ${e.message}`);
    }
  };

  // Timer Controls
  btnTimerStart.onclick = () => {
    const dur = parseInt(timerDuration.value, 10) || 30;
    send('start_timer', { duration: dur });
  };

  btnTimerPause.onclick = () => {
    send('pause_timer', {});
  };

  btnTimerReset.onclick = () => {
    const dur = parseInt(timerDuration.value, 10) || 30;
    send('reset_timer', { duration: dur });
  };

  // Buzzer Controls
  btnArmBuzzer.onclick = () => {
    if (state.buzzer.armed) {
      send('disarm_buzzer', {});
    } else {
      send('arm_buzzer', {});
    }
  };

  btnClearBuzzes.onclick = () => {
    send('arm_buzzer', {});
  };

  // Pounce Controls
  btnOpenPounce.onclick = () => {
    const dur = parseInt(pounceDuration.value, 10) || 30;
    send('open_pounce', { duration: dur });
  };

  btnClosePounce.onclick = () => {
    send('close_pounce', {});
  };

  if (btnAutoGradePounce) {
    btnAutoGradePounce.onclick = () => {
      if (!currentPounceList || currentPounceList.length === 0) {
        alert('No pounce answers to grade!');
        return;
      }
      currentPounceList.forEach(item => {
        const delta = item._matched ? 10 : -5;
        send('update_score', { teamId: item.teamId, delta });
        const row = pounceAnswers.querySelector(`.pounce-row[data-team="${item.teamId}"]`);
        if (row) {
          const actions = row.querySelector('.buzz-item-actions');
          if (actions) {
            actions.innerHTML = `<span style="font-size:12px; font-weight:bold; color:${delta > 0 ? '#38b000' : '#c41230'}">${delta > 0 ? '✓ AUTO-ACCEPTED (+10)' : '✗ AUTO-REJECTED (-5)'}</span>`;
          }
        }
      });
      playConsoleBuzzChime();
    };
  }

  // Add Team Form
  btnAddTeam.onclick = () => {
    const name = newTeamName.value.trim();
    if (!name) return;
    const teamId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    send('add_team', {
      teamId,
      teamName: name,
      color: newTeamColor.value
    });
    newTeamName.value = '';
  };

  // Doom Controls
  btnAdvanceDoom.onclick = () => {
    send('advance_doom_clock', {});
  };

  btnResetDoom.onclick = () => {
    state.doomClock.level = 0;
    updateDoomUI();
  };

  // SFX Buttons
  sfxBtns.forEach(btn => {
    btn.onclick = () => {
      send('play_sfx', { sfx: btn.dataset.sfx });
    };
  });

  // Fetch Network Info
  fetch('/api/network')
    .then(r => r.json())
    .then(data => {
      if (data && data.ip && phoneConnectUrl) {
        phoneConnectUrl.textContent = `http://${data.ip}:${data.port || 3000}/buzzer/<team>`;
      }
    })
    .catch(() => {});

  if (btnCopyUrl) {
    btnCopyUrl.onclick = () => {
      const url = phoneConnectUrl ? phoneConnectUrl.textContent : '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          btnCopyUrl.textContent = 'Copied!';
          setTimeout(() => { btnCopyUrl.textContent = 'Copy'; }, 1500);
        });
      }
    };
  }

  // ─── Answer Key Event Listeners ──────────────────────────────────
  if (btnToggleAk && panelAnswerKey) {
    btnToggleAk.onclick = () => {
      const isHidden = panelAnswerKey.classList.toggle('hidden');
      if (!isHidden) {
        renderAnswerKey();
        if (akSearchInput) akSearchInput.focus();
        panelAnswerKey.scrollIntoView({ behavior: 'smooth' });
      }
    };
  }

  if (btnCloseAk && panelAnswerKey) {
    btnCloseAk.onclick = () => {
      panelAnswerKey.classList.add('hidden');
    };
  }

  if (akTabs) {
    akTabs.forEach(tab => {
      tab.onclick = () => {
        akTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAkRoundFilter = tab.dataset.round || 'all';
        renderAnswerKey();
      };
    });
  }

  if (akSearchInput) {
    akSearchInput.oninput = (e) => {
      currentAkSearchQuery = e.target.value.trim().toLowerCase();
      renderAnswerKey();
    };
  }

  // Hotkey: 'A' toggles Answer Key (when not focused on text input), 'Escape' closes it
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape' && panelAnswerKey && !panelAnswerKey.classList.contains('hidden')) {
        panelAnswerKey.classList.add('hidden');
      }
      return;
    }
    if (e.key === 'a' || e.key === 'A') {
      if (btnToggleAk) btnToggleAk.click();
    } else if (e.key === 'Escape') {
      if (panelAnswerKey && !panelAnswerKey.classList.contains('hidden')) {
        panelAnswerKey.classList.add('hidden');
      }
    }
  });

  // Fetch Questions Repository on boot
  fetch('/api/questions')
    .then(r => r.json())
    .then(data => {
      if (data && data.questions) {
        if (!state.questions || state.questions.length === 0) {
          state.questions = data.questions;
          renderQuestionUI();
        }
        renderAnswerKey();
      }
    })
    .catch(() => {});

  // Start WebSocket
  connect();
})();
