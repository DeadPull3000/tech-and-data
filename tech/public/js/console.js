// ═══════════════════════════════════════════════════════════════════
//  ROAD TO DOOMSDAY — Quizmaster Console Controller
// ═══════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  // ─── DOM Elements ────────────────────────────────────────────────
  const connStatus = document.getElementById('conn-status');
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

  function renderPounceAnswers(answers) {
    pounceAnswers.innerHTML = '';
    if (!answers || answers.length === 0) {
      pounceAnswers.innerHTML = '<p class="empty-msg">No pounce answers received</p>';
      return;
    }

    answers.forEach(item => {
      const team = state.teams[item.teamId];
      const tName = team ? team.teamName : item.teamId;
      const row = document.createElement('div');
      row.className = 'pounce-row';
      row.innerHTML = `
        <div>
          <strong>${tName}:</strong> <span>"${item.answer}"</span>
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
        btn.disabled = true;
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

  // Start WebSocket
  connect();
})();
