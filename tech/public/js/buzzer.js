// ═══════════════════════════════════════════════════════════════════
//  ROAD TO DOOMSDAY — Mobile Team Buzzer & Pounce Client
// ═══════════════════════════════════════════════════════════════════

(() => {
  'use strict';

  // ─── Extract Team ID ─────────────────────────────────────────────
  function getTeamId() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'buzzer') {
      return decodeURIComponent(pathParts[1]);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('team')) {
      return params.get('team');
    }
    let stored = localStorage.getItem('r2d_team_id');
    if (!stored) {
      stored = 'team_' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('r2d_team_id', stored);
    }
    return stored;
  }

  const teamId = getTeamId();

  // ─── DOM Elements ────────────────────────────────────────────────
  const teamNameEl = document.getElementById('team-name');
  const connDot = document.getElementById('conn-dot');
  const statusText = document.getElementById('status-text');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');

  // Mode Panels
  const modeBuzzer = document.getElementById('mode-buzzer');
  const modePounce = document.getElementById('mode-pounce');

  // Buzzer Button
  const buzzBtn = document.getElementById('buzz-btn');
  const buzzSubtext = document.getElementById('buzz-subtext');
  const buzzMaintext = document.getElementById('buzz-maintext');

  // Pounce Inputs
  const pounceTimerCount = document.getElementById('pounce-timer-count');
  const pounceInput = document.getElementById('pounce-input');
  const pounceSubmitBtn = document.getElementById('pounce-submit-btn');
  const pounceConfirmation = document.getElementById('pounce-confirmation');
  const pounceSubmittedVal = document.getElementById('pounce-submitted-val');

  // ─── Local State ─────────────────────────────────────────────────
  let armed = false;
  let hasBuzzed = false;
  let myOrder = null;
  let cooldown = false;
  let ws = null;
  let teamName = teamId.replace(/_/g, ' ').toUpperCase();
  let soundEnabled = true;
  let lastScore = null;

  teamNameEl.textContent = teamName;

  // ─── Web Audio API Buzzer Synthesizer ────────────────────────────
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playBuzzerSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      if (!ctx) return;
      const now = ctx.currentTime;

      switch (type) {
        case 'press': {
          // Sharp, satisfying arcade buzz
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(320, now);
          osc1.frequency.exponentialRampToValueAtTime(540, now + 0.12);

          osc2.type = 'square';
          osc2.frequency.setValueAtTime(480, now);
          osc2.frequency.exponentialRampToValueAtTime(720, now + 0.12);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.24);
          osc2.stop(now + 0.24);
          break;
        }

        case 'first': {
          // Triumphant victory double-ping for #1 buzz
          [783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.35, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
          });
          break;
        }

        case 'locked': {
          // Locked-out low thud
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }

        case 'armed': {
          // Sharp arming chirp
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }
      }
    } catch (e) {
      console.warn('[audio] Error playing sound:', e);
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.onclick = () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundToggleBtn.textContent = '🔊 SFX ON';
        soundToggleBtn.classList.remove('muted');
        playBuzzerSound('armed');
      } else {
        soundToggleBtn.textContent = '🔇 MUTED';
        soundToggleBtn.classList.add('muted');
      }
    };
  }

  // ─── Haptics ─────────────────────────────────────────────────────
  function vibrate(pattern) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }

  // ─── WebSocket Connection ────────────────────────────────────────
  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      connDot.className = 'conn-dot online';
      statusText.textContent = 'CONNECTED • WAITING FOR QUIZMASTER';
      ws.send(JSON.stringify({
        type: 'register',
        payload: {
          role: 'buzzer',
          teamId: teamId,
          teamName: teamName
        }
      }));
    };

    ws.onmessage = (evt) => {
      let msg;
      try { msg = JSON.parse(evt.data); } catch (e) { return; }
      const { type, payload } = msg;

      switch (type) {
        case 'state_sync': {
          if (payload) {
            if (payload.teams && payload.teams[teamId]) {
              teamName = payload.teams[teamId].teamName;
              teamNameEl.textContent = teamName;
            }
            if (payload.buzzer) {
              setArmedState(payload.buzzer.armed);
            }
            if (payload.pounce && payload.pounce.open) {
              openPounceUI(payload.pounce.duration || 30);
            }
          }
          break;
        }

        case 'teams_updated': {
          if (payload && payload.teams) {
            const me = payload.teams.find(t => t.teamId === teamId);
            if (me) {
              teamName = me.teamName;
              teamNameEl.textContent = teamName;
            }
          }
          break;
        }

        case 'buzzer_armed': {
          setArmedState(true);
          vibrate(50);
          playBuzzerSound('armed');
          break;
        }

        case 'buzzer_disarmed': {
          setArmedState(false);
          break;
        }

        case 'buzz_locked': {
          if (payload) {
            myOrder = payload.yourOrder;
            if (myOrder === 1) {
              setBuzzedFirst();
            } else {
              setBuzzedLocked(myOrder);
            }
          }
          break;
        }

        case 'buzz_result': {
          if (payload) {
            if (payload.teamId !== teamId && !hasBuzzed) {
              statusText.textContent = `${payload.teamName || payload.teamId} BUZZED FIRST!`;
            }
          }
          break;
        }

        case 'pounce_opened': {
          openPounceUI((payload && payload.duration) || 30);
          vibrate([80, 40, 80]);
          break;
        }

        case 'pounce_closed': {
          closePounceUI();
          break;
        }

        case 'timer_tick': {
          if (payload && modePounce.classList.contains('active')) {
            const rem = Math.ceil(payload.remaining);
            pounceTimerCount.textContent = `${rem}s`;
          }
          break;
        }

        case 'score_updated': {
          if (payload && payload.scores && payload.scores[teamId] !== undefined) {
            const newScore = payload.scores[teamId];
            if (lastScore !== null) {
              const diff = newScore - lastScore;
              if (diff > 0) {
                statusText.textContent = `★ ANSWER ACCEPTED! (+${diff} PTS) ★`;
                playBuzzerSound('first');
                vibrate([100, 50, 100]);
              } else if (diff < 0) {
                statusText.textContent = `ANSWER INCORRECT (${diff} PTS)`;
                playBuzzerSound('locked');
                vibrate(120);
              }
            }
            lastScore = newScore;
          }
          break;
        }
      }
    };

    ws.onclose = () => {
      connDot.className = 'conn-dot offline';
      statusText.textContent = 'DISCONNECTED • RECONNECTING...';
      setArmedState(false);
      setTimeout(connect, 2000);
    };
  }

  // ─── Buzzer UI States ────────────────────────────────────────────

  function setArmedState(isArmed) {
    armed = isArmed;
    if (isArmed) {
      hasBuzzed = false;
      myOrder = null;
      buzzBtn.disabled = false;
      buzzBtn.className = 'arcade-btn armed';
      buzzSubtext.textContent = 'READY';
      buzzMaintext.textContent = 'BUZZ IN!';
      statusText.textContent = '⚡ BUZZER IS LIVE! TAP NOW!';
    } else {
      if (!hasBuzzed) {
        buzzBtn.disabled = true;
        buzzBtn.className = 'arcade-btn stand-by';
        buzzSubtext.textContent = 'STAND BY';
        buzzMaintext.textContent = 'WAITING';
        statusText.textContent = 'Buzzer locked by Quizmaster';
      }
    }
  }

  function setBuzzedFirst() {
    hasBuzzed = true;
    buzzBtn.disabled = true;
    buzzBtn.className = 'arcade-btn buzzed-first';
    buzzSubtext.textContent = 'LOCKED IN';
    buzzMaintext.textContent = '#1 BUZZ!';
    statusText.textContent = '★ YOU ARE FIRST! ANSWER THE QUESTION! ★';
    vibrate([150, 50, 150]);
    playBuzzerSound('first');
  }

  function setBuzzedLocked(order) {
    hasBuzzed = true;
    buzzBtn.disabled = true;
    buzzBtn.className = 'arcade-btn buzzed-locked';
    buzzSubtext.textContent = 'LOCKED OUT';
    buzzMaintext.textContent = `#${order}`;
    statusText.textContent = `You buzzed in position #${order}`;
    vibrate(100);
    playBuzzerSound('locked');
  }

  // ─── Pounce UI States ────────────────────────────────────────────

  function openPounceUI(duration) {
    modeBuzzer.classList.remove('active');
    modePounce.classList.add('active');
    pounceTimerCount.textContent = `${duration}s`;
    pounceInput.value = '';
    pounceInput.disabled = false;
    pounceSubmitBtn.disabled = false;
    pounceSubmitBtn.textContent = 'LOCK IN ANSWER';
    pounceConfirmation.classList.add('hidden');
    statusText.textContent = 'POUNCE WINDOW OPEN! SUBMIT YOUR ANSWER!';
    pounceInput.focus();
  }

  function closePounceUI() {
    modePounce.classList.remove('active');
    modeBuzzer.classList.add('active');
    setArmedState(false);
  }

  // ─── Interaction Handlers ────────────────────────────────────────

  function handleBuzz() {
    if (!armed || hasBuzzed || cooldown) return;

    cooldown = true;
    setTimeout(() => { cooldown = false; }, 500);

    vibrate(100);
    playBuzzerSound('press');

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'buzz',
        payload: { teamId: teamId }
      }));
    }

    buzzSubtext.textContent = 'SENDING...';
    buzzMaintext.textContent = 'BUZZED!';
    statusText.textContent = 'Transmitting buzz signal...';
  }

  // Click & Touch events for maximum responsiveness
  buzzBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleBuzz();
  }, { passive: false });

  buzzBtn.addEventListener('click', () => {
    handleBuzz();
  });

  // Pounce Submit
  pounceSubmitBtn.addEventListener('click', () => {
    const answer = pounceInput.value.trim();
    if (!answer) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'pounce_answer',
        payload: {
          teamId: teamId,
          answer: answer
        }
      }));
    }

    pounceInput.disabled = true;
    pounceSubmitBtn.disabled = true;
    pounceSubmitBtn.textContent = 'SUBMITTED ✓';
    pounceSubmittedVal.textContent = answer;
    pounceConfirmation.classList.remove('hidden');
    statusText.textContent = 'Pounce answer locked in!';
    vibrate(100);
  });

  pounceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      pounceSubmitBtn.click();
    }
  });

  // Start connection
  connect();
})();
