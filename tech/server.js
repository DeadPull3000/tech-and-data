// ═══════════════════════════════════════════════════════════════════
//  ROAD TO DOOMSDAY — WebSocket + Express Server
//  Retro-Marvel-themed live quiz engine
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ─── Paths ───────────────────────────────────────────────────────
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const CONTENT_DIR = path.resolve(__dirname, '..', 'content');

// ─── Ensure data directory exists ────────────────────────────────
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Load questions from ../content/ ─────────────────────────────
function loadQuestions() {
  const questions = [];
  if (!fs.existsSync(CONTENT_DIR)) return questions;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.name.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(full, 'utf-8'));
          if (Array.isArray(data)) {
            for (const item of data) {
              if (item.questions && Array.isArray(item.questions)) {
                // Prelims grouped format
                for (const q of item.questions) {
                  questions.push({
                    ...q,
                    category: item.category || 'Prelims',
                    round: 'prelims',
                    points: q.points || 1,
                  });
                }
              } else {
                let roundName = 'round1';
                if (entry.name.includes('round2') || entry.name.includes('incursion')) roundName = 'round2';
                else if (entry.name.includes('round3') || entry.name.includes('gauntlet')) roundName = 'round3';
                else if (entry.name.includes('prelim')) roundName = 'prelims';

                questions.push({
                  ...item,
                  round: item.round || roundName,
                  points: item.points || 10,
                });
              }
            }
          }
        } catch (e) {
          console.warn(`[questions] Failed to parse ${full}: ${e.message}`);
        }
      }
    }
  }
  scanDir(CONTENT_DIR);
  return questions;
}

// ─── Default state factory ───────────────────────────────────────
function createDefaultState() {
  return {
    teams: {},           // { teamId: { teamId, teamName, color, score } }
    scores: {},          // { teamId: number }
    currentQuestionIndex: -1,
    currentRound: 'prelims', // prelims | round1 | round2 | round3
    buzzer: {
      armed: false,
      buzzOrder: [],     // [{ teamId, teamName, timestamp, order }]
    },
    pounce: {
      open: false,
      answers: {},       // { teamId: answer }
      duration: 0,
    },
    timer: {
      remaining: 0,
      total: 0,
      running: false,
    },
    doomClock: {
      level: 0,
      maxLevel: 12,
    },
    grid: Array.from({ length: 2 }, () =>
      Array.from({ length: 5 }, () => ({
        category: '',
        points: 0,
        used: false,
      }))
    ),
    currentScene: 'lobby',
    questions: [],
  };
}

// ─── Initialise state ────────────────────────────────────────────
let state;
try {
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    console.log('[state] Restored from data/state.json');
  } else {
    state = createDefaultState();
  }
} catch (e) {
  console.warn('[state] Failed to restore, starting fresh:', e.message);
  state = createDefaultState();
}

// Load questions into state
state.questions = loadQuestions();
console.log(`[questions] Loaded ${state.questions.length} question(s) from content/`);

// ─── Express ─────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// HTML routes
app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'display.html'));
});
app.get('/console', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'console.html'));
});
app.get('/buzzer/:teamId', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'buzzer.html'));
});

// Static files
app.use(express.static(PUBLIC_DIR));

// ─── WebSocket Server ────────────────────────────────────────────
const wss = new WebSocketServer({ server });

// Client registry: each ws gets metadata
const clients = new Map(); // ws → { role, teamId?, teamName? }

// ─── Broadcasting helpers ────────────────────────────────────────
function send(ws, type, payload) {
  if (ws.readyState === 1) { // WebSocket.OPEN
    ws.send(JSON.stringify({ type, payload }));
  }
}

function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  for (const [ws] of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function broadcastToRole(role, type, payload) {
  const msg = JSON.stringify({ type, payload });
  for (const [ws, meta] of clients) {
    if (meta.role === role && ws.readyState === 1) ws.send(msg);
  }
}

function sendToTeam(teamId, type, payload) {
  for (const [ws, meta] of clients) {
    if (meta.teamId === teamId && ws.readyState === 1) {
      send(ws, type, payload);
    }
  }
}

// ─── State-sync helper ──────────────────────────────────────────
function getStateSync() {
  return {
    teams: state.teams,
    scores: state.scores,
    currentQuestionIndex: state.currentQuestionIndex,
    currentRound: state.currentRound,
    buzzer: state.buzzer,
    pounce: { open: state.pounce.open, duration: state.pounce.duration },
    timer: state.timer,
    doomClock: state.doomClock,
    grid: state.grid,
    currentScene: state.currentScene,
    questions: state.questions,
  };
}

// ─── Timer engine ────────────────────────────────────────────────
let timerInterval = null;

function startTimerEngine(duration) {
  stopTimerEngine();
  state.timer.total = duration;
  state.timer.remaining = duration;
  state.timer.running = true;

  const startTime = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    state.timer.remaining = Math.max(0, duration - elapsed / 1000);

    broadcast('timer_tick', {
      remaining: Math.round(state.timer.remaining * 100) / 100,
      total: state.timer.total,
    });

    if (state.timer.remaining <= 0) {
      stopTimerEngine();
      state.timer.running = false;
      state.timer.remaining = 0;
      broadcast('timer_done', {});

      // Auto-close pounce when timer expires
      if (state.pounce.open) {
        closePounce();
      }
    }
  }, 250);
}

function stopTimerEngine() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  state.timer.running = false;
}

// ─── Pounce helpers ──────────────────────────────────────────────
let pounceTimer = null;

function openPounce(duration) {
  state.pounce.open = true;
  state.pounce.answers = {};
  state.pounce.duration = duration;
  broadcast('pounce_opened', { duration });

  // Auto-close after duration
  if (pounceTimer) clearTimeout(pounceTimer);
  pounceTimer = setTimeout(() => {
    if (state.pounce.open) {
      closePounce();
    }
  }, duration * 1000);
}

function closePounce() {
  state.pounce.open = false;
  if (pounceTimer) {
    clearTimeout(pounceTimer);
    pounceTimer = null;
  }

  // Send all pounce answers to console only
  const answersArray = Object.entries(state.pounce.answers).map(
    ([teamId, answer]) => ({ teamId, answer })
  );
  broadcastToRole('console', 'pounce_answers', { answers: answersArray });
  broadcast('pounce_closed', {});
}

// ─── Score helpers ───────────────────────────────────────────────
function updateScores() {
  broadcast('score_updated', { scores: state.scores });
}

// ─── Message handler ─────────────────────────────────────────────
function handleMessage(ws, msg) {
  let parsed;
  try {
    parsed = JSON.parse(msg);
  } catch (e) {
    console.warn('[ws] Invalid JSON:', msg);
    return;
  }

  const { type, payload } = parsed;
  if (!type) return;

  switch (type) {
    // ── Registration ──
    case 'register': {
      const { role, teamId, teamName } = payload || {};
      clients.set(ws, { role, teamId, teamName });
      console.log(`[register] ${role}${teamId ? ` (${teamId})` : ''}`);
      // Send full state on connect
      send(ws, 'state_sync', getStateSync());
      break;
    }

    // ── Buzzer ──
    case 'buzz': {
      if (!state.buzzer.armed) break;
      const { teamId } = payload || {};
      if (!teamId) break;

      // Check if this team already buzzed
      if (state.buzzer.buzzOrder.some(b => b.teamId === teamId)) break;

      const now = Date.now();
      const order = state.buzzer.buzzOrder.length + 1;
      const teamName = (state.teams[teamId] && state.teams[teamId].teamName) || teamId;

      const buzzEntry = { teamId, teamName, timestamp: now, order };
      state.buzzer.buzzOrder.push(buzzEntry);

      // If first buzz, lock after 50ms window
      if (order === 1) {
        setTimeout(() => {
          state.buzzer.armed = false;
          broadcast('buzzer_disarmed', {});
        }, 50);
      }

      broadcast('buzz_result', { teamId, teamName, order, timestamp: now });
      sendToTeam(teamId, 'buzz_locked', { yourOrder: order });
      console.log(`[buzz] ${teamName} — order #${order}`);
      break;
    }

    case 'arm_buzzer': {
      state.buzzer.armed = true;
      state.buzzer.buzzOrder = [];
      broadcast('buzzer_armed', {});
      console.log('[buzzer] Armed');
      break;
    }

    case 'disarm_buzzer': {
      state.buzzer.armed = false;
      broadcast('buzzer_disarmed', {});
      console.log('[buzzer] Disarmed');
      break;
    }

    // ── Pounce ──
    case 'pounce_answer': {
      if (!state.pounce.open) break;
      const { teamId, answer } = payload || {};
      if (!teamId) break;
      state.pounce.answers[teamId] = answer;
      broadcastToRole('display', 'pounce_locked', { teamId });
      console.log(`[pounce] Answer from ${teamId}`);
      break;
    }

    case 'open_pounce': {
      const { duration } = payload || {};
      openPounce(duration || 30);
      console.log(`[pounce] Opened for ${duration || 30}s`);
      break;
    }

    case 'close_pounce': {
      closePounce();
      console.log('[pounce] Closed');
      break;
    }

    // ── Questions ──
    case 'next_question': {
      state.currentQuestionIndex++;
      const q = state.questions[state.currentQuestionIndex] || null;
      broadcast('question_changed', {
        question: q,
        index: state.currentQuestionIndex,
      });
      console.log(`[question] → #${state.currentQuestionIndex}`);
      break;
    }

    case 'show_question': {
      const { questionIndex } = payload || {};
      if (typeof questionIndex === 'number') {
        state.currentQuestionIndex = questionIndex;
        const q = state.questions[questionIndex] || null;
        broadcast('question_changed', {
          question: q,
          index: questionIndex,
        });
        console.log(`[question] Show #${questionIndex}`);
      }
      break;
    }

    case 'reveal_hint': {
      const q = state.questions[state.currentQuestionIndex];
      const hint = (payload && payload.hint) || (q && q.hint) || null;
      broadcastToRole('display', 'hint_revealed', { hint });
      console.log(`[hint] Revealed for question #${state.currentQuestionIndex}: ${hint}`);
      break;
    }

    case 'reveal_answer': {
      const q = state.questions[state.currentQuestionIndex];
      const answer = (payload && payload.answer) || (q && q.answer) || null;
      const acceptableAnswers = (payload && payload.acceptableAnswers) || (q && q.acceptableAnswers) || [];
      broadcast('answer_revealed', {
        answer,
        acceptableAnswers,
        index: state.currentQuestionIndex,
      });
      console.log(`[answer] Revealed for question #${state.currentQuestionIndex}: ${answer}`);
      break;
    }

    // ── Judging & Scores ──
    case 'judge': {
      const { teamId, correct, points } = payload || {};
      if (!teamId) break;
      if (correct) {
        const pts = points || 10;
        state.scores[teamId] = (state.scores[teamId] || 0) + pts;
        if (state.teams[teamId]) state.teams[teamId].score = state.scores[teamId];
      }
      updateScores();
      console.log(`[judge] ${teamId} ${correct ? `+${points || 10}` : 'incorrect'}`);
      break;
    }

    case 'update_score': {
      const { teamId, delta } = payload || {};
      if (!teamId || typeof delta !== 'number') break;
      state.scores[teamId] = (state.scores[teamId] || 0) + delta;
      if (state.teams[teamId]) state.teams[teamId].score = state.scores[teamId];
      updateScores();
      console.log(`[score] ${teamId} ${delta >= 0 ? '+' : ''}${delta} → ${state.scores[teamId]}`);
      break;
    }

    // ── Timer ──
    case 'start_timer': {
      const { duration } = payload || {};
      if (typeof duration === 'number' && duration > 0) {
        startTimerEngine(duration);
        console.log(`[timer] Started: ${duration}s`);
      }
      break;
    }

    case 'pause_timer': {
      stopTimerEngine();
      console.log(`[timer] Paused at ${state.timer.remaining.toFixed(1)}s`);
      break;
    }

    case 'reset_timer': {
      stopTimerEngine();
      const { duration } = payload || {};
      state.timer.remaining = duration || state.timer.total;
      state.timer.total = duration || state.timer.total;
      state.timer.running = false;
      broadcast('timer_tick', {
        remaining: state.timer.remaining,
        total: state.timer.total,
      });
      console.log(`[timer] Reset to ${state.timer.remaining}s`);
      break;
    }

    // ── Scenes ──
    case 'set_scene': {
      const { scene } = payload || {};
      if (scene) {
        state.currentScene = scene;
        broadcastToRole('display', 'scene_changed', { scene });
        console.log(`[scene] → ${scene}`);
      }
      break;
    }

    // ── Rounds ──
    case 'set_round': {
      const { round } = payload || {};
      if (round !== undefined) {
        state.currentRound = round;
        broadcast('round_changed', { round });
        console.log(`[round] → ${round}`);
      }
      break;
    }

    // ── Teams ──
    case 'add_team': {
      const { teamId, teamName, color } = payload || {};
      if (!teamId) break;
      state.teams[teamId] = { teamId, teamName, color, score: 0 };
      state.scores[teamId] = state.scores[teamId] || 0;
      broadcast('teams_updated', { teams: Object.values(state.teams) });
      console.log(`[team] Added: ${teamName} (${teamId})`);
      break;
    }

    case 'remove_team': {
      const { teamId } = payload || {};
      if (!teamId) break;
      delete state.teams[teamId];
      delete state.scores[teamId];
      broadcast('teams_updated', { teams: Object.values(state.teams) });
      console.log(`[team] Removed: ${teamId}`);
      break;
    }

    case 'reveal_team': {
      const { teamId } = payload || {};
      if (!teamId) break;
      const team = state.teams[teamId];
      const name = team ? team.teamName : teamId;
      broadcastToRole('display', 'team_revealed', { teamId, teamName: name });
      console.log(`[reveal] ${name}`);
      break;
    }

    // ── Grid (Round 2) ──
    case 'select_grid_cell': {
      const { row, col } = payload || {};
      if (typeof row !== 'number' || typeof col !== 'number') break;
      if (state.grid[row] && state.grid[row][col]) {
        state.grid[row][col].used = true;
        broadcast('grid_updated', { grid: state.grid });
        console.log(`[grid] Cell [${row}][${col}] selected`);
      }
      break;
    }

    // ── Doom Clock ──
    case 'advance_doom_clock': {
      if (state.doomClock.level < state.doomClock.maxLevel) {
        state.doomClock.level++;
      }
      broadcast('doom_clock_advanced', {
        level: state.doomClock.level,
        maxLevel: state.doomClock.maxLevel,
      });
      console.log(`[doom] ⏰ ${state.doomClock.level}/${state.doomClock.maxLevel}`);
      break;
    }

    // ── SFX ──
    case 'play_sfx': {
      const { sfx } = payload || {};
      if (sfx) {
        broadcastToRole('display', 'play_sfx', { sfx });
        console.log(`[sfx] 🔊 ${sfx}`);
      }
      break;
    }

    // ── Reset ──
    case 'reset_state': {
      stopTimerEngine();
      if (pounceTimer) clearTimeout(pounceTimer);
      pounceTimer = null;
      const fresh = createDefaultState();
      fresh.questions = loadQuestions();
      Object.assign(state, fresh);
      broadcast('state_sync', getStateSync());
      console.log('[state] ⚡ Full reset');
      break;
    }

    default:
      console.warn(`[ws] Unknown message type: ${type}`);
  }
}

// ─── WebSocket connection handler ────────────────────────────────
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[ws] Client connected from ${ip}`);

  // Send state sync immediately (client will re-request via register)
  send(ws, 'state_sync', getStateSync());

  ws.on('message', (data) => {
    handleMessage(ws, data.toString());
  });

  ws.on('close', () => {
    const meta = clients.get(ws);
    if (meta) {
      console.log(`[ws] ${meta.role || 'unknown'}${meta.teamId ? ` (${meta.teamId})` : ''} disconnected`);
    }
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('[ws] Error:', err.message);
    clients.delete(ws);
  });
});

// ─── State backup — every 10 seconds ────────────────────────────
setInterval(() => {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('[backup] Failed to write state:', e.message);
  }
}, 10000);

// ─── Get local IP for display ────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    const isVirtual = /vethernet|wsl|virtual|hyper-v|vmware|docker/i.test(name);
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!isVirtual) {
          return iface.address;
        }
        candidates.push(iface.address);
      }
    }
  }
  return candidates[0] || 'localhost';
}

function getAllIPs() {
  const interfaces = os.networkInterfaces();
  const list = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        list.push({ name, address: iface.address });
      }
    }
  }
  return list;
}

// ─── API Routes ──────────────────────────────────────────────────
app.get('/api/network', (_req, res) => {
  res.json({
    ip: getLocalIP(),
    allIPs: getAllIPs(),
    port: PORT
  });
});

app.get('/api/questions', (_req, res) => {
  res.json({
    total: state.questions.length,
    questions: state.questions
  });
});

// ─── Start server ────────────────────────────────────────────────
server.listen(PORT, () => {
  const ip = getLocalIP();
  const all = getAllIPs();
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║         ROAD TO DOOMSDAY — Server Online         ║');
  console.log('  ╠═══════════════════════════════════════════════════╣');
  console.log(`  ║  Wi-Fi IP: http://${ip}:${PORT}/                  `);
  console.log(`  ║  Display:  http://${ip}:${PORT}/                  `);
  console.log(`  ║  Console:  http://${ip}:${PORT}/console           `);
  console.log(`  ║  Buzzer:   http://${ip}:${PORT}/buzzer/<teamId>   `);
  console.log('  ╠═══════════════════════════════════════════════════╣');
  all.forEach(item => {
    console.log(`  ║  Adapter: [${item.name}] -> http://${item.address}:${PORT}`);
  });
  console.log('  ╠═══════════════════════════════════════════════════╣');
  console.log(`  ║  Local:    http://localhost:${PORT}/              `);
  console.log(`  ║  Teams:    ${Object.keys(state.teams).length} loaded  |  Questions: ${state.questions.length}`);
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
});
