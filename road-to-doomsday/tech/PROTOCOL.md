# WebSocket Protocol — Road to Doomsday

All messages are JSON: `{ "type": "...", "payload": { ... } }`

## Client → Server

| type | payload | sender |
|---|---|---|
| `register` | `{ role: "display" \| "console" \| "buzzer", teamId?: string, teamName?: string }` | all |
| `buzz` | `{ teamId: string }` | buzzer |
| `pounce_answer` | `{ teamId: string, answer: string }` | buzzer |
| `next_question` | `{}` | console |
| `show_question` | `{ questionIndex: number }` | console |
| `arm_buzzer` | `{}` | console |
| `disarm_buzzer` | `{}` | console |
| `judge` | `{ teamId: string, correct: boolean, points?: number }` | console |
| `update_score` | `{ teamId: string, delta: number }` | console |
| `set_scene` | `{ scene: string }` | console |
| `start_timer` | `{ duration: number }` | console |
| `pause_timer` | `{}` | console |
| `reset_timer` | `{ duration?: number }` | console |
| `open_pounce` | `{ duration: number }` | console |
| `close_pounce` | `{}` | console |
| `select_grid_cell` | `{ row: number, col: number }` | console |
| `set_round` | `{ round: number }` | console |
| `add_team` | `{ teamId: string, teamName: string, color: string }` | console |
| `remove_team` | `{ teamId: string }` | console |
| `play_sfx` | `{ sfx: string }` | console |
| `reveal_team` | `{ teamId: string }` | console |
| `advance_doom_clock` | `{}` | console |
| `reset_state` | `{}` | console |

## Server → Client (broadcast or targeted)

| type | payload | target |
|---|---|---|
| `state_sync` | `{ ...fullState }` | newly connected client |
| `buzzer_armed` | `{}` | all |
| `buzzer_disarmed` | `{}` | all |
| `buzz_result` | `{ teamId: string, teamName: string, order: number, timestamp: number }` | all |
| `buzz_locked` | `{ yourOrder: number }` | specific buzzer |
| `question_changed` | `{ question: object, index: number }` | display |
| `scene_changed` | `{ scene: string }` | display |
| `score_updated` | `{ scores: object }` | all |
| `timer_tick` | `{ remaining: number, total: number }` | all |
| `timer_done` | `{}` | all |
| `pounce_opened` | `{ duration: number }` | all |
| `pounce_closed` | `{}` | all |
| `pounce_answers` | `{ answers: { teamId: string, answer: string }[] }` | console |
| `pounce_locked` | `{ teamId: string }` | display |
| `grid_updated` | `{ grid: object }` | all |
| `round_changed` | `{ round: number }` | all |
| `team_revealed` | `{ teamId: string, teamName: string }` | display |
| `doom_clock_advanced` | `{ level: number, maxLevel: number }` | all |
| `play_sfx` | `{ sfx: string }` | display |
| `teams_updated` | `{ teams: object[] }` | all |
