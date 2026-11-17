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

  teamNameEl.textContent = teamName;

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
  }

  function setBuzzedLocked(order) {
    hasBuzzed = true;
    buzzBtn.disabled = true;
    buzzBtn.className = 'arcade-btn buzzed-locked';
    buzzSubtext.textContent = 'LOCKED OUT';
    buzzMaintext.textContent = `#${order}`;
    statusText.textContent = `You buzzed in position #${order}`;
    vibrate(100);
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
