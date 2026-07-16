# Family Boards — the agent's guide

> **What a board is in one line:** a shared, ongoing family play-space — one canvas (the game) plus a living wall of everyone's plays, projected into a family chat room the kids and parents both see.

If a **canvas** is a game cartridge and a **skill** is a solo assignment, a **board** is the family game night: persistent, multiplayer, visible to its members, and alive across days or weeks. Chess Club, a doodle wall, Fridge Notes, Birthday HQ — each is a board over some canvas.

## The mental model

```
canvas (sandbox artifact)      the game definition — HTML the kids play
  └─ canvas project            the family's instance of that artifact
       └─ board                one ongoing "table" of that game
            ├─ members         who's playing (kids + parents; the AI is never a member)
            ├─ wall            board_state rows — every play/move/note, in rounds
            └─ room            a family chat thread; plays project into it as cards
```

Three facts drive everything else:

1. **Agents stage; parents start.** You cannot create a general board. You make a canvas *startable* (`board_add_canvas`) and the parent physically starts it on their device, from the "Start something new" picker — which also shows them a privacy notice and asks who's in. The one exception: `board_create` exists but is hard-tenanted to the canonical Family Heart publication (health flows own their consent); for anything else it refuses with steering.
2. **Members = visibility.** Everything played onto a board is visible to *all* of its members — including members added later. That is the consent basis the parent acknowledged at start. Never treat a board as a private channel to one child.
3. **The wall is the truth; the room is a projection.** Plays land as `board_state` rows; the app projects each revealed row into the board's chat room as a card and notifies members like a chat message. You never write chat messages — you post to the wall and the projection does the rest.

## Lifecycle, from your side of the table

```
canvas_create (build the game)            you author the HTML
   → board_add_canvas {canvasId, vocab}   you stage it: now it appears in the family's picker
   → [parent starts it on-device]         notice → who's in → board exists
   → board_list / board_get               you discover boards you can play into
   → board_post {boardId, ...}            you make plays / GM moves / highlights
   → board_data {boardId}                 you read the room: board + manifest + wall
   → board_remove_canvas {canvasId}       you withdraw the offer (existing boards live on)
```

## Verb reference

| Verb | What it really does |
|---|---|
| `board_add_canvas {canvasId, vocab?}` | Stages a canvas as board-eligible and stores its **manifest** (display vocabulary + rules — see below). Idempotent; restaging updates the manifest. `canvasId` is the id `canvas_create` returned. |
| `board_remove_canvas {canvasId}` | Withdraws eligibility. Boards already started from it keep playing; the picker stops offering it and new starts refuse. |
| `board_list` | The family's boards you can see, newest first. |
| `board_get {boardId}` | One board: status, members, canvas, config (the sealed birth-rules), round. |
| `board_post {boardId, collection, payload}` | Lands a play on the wall. It projects into the room as a card and notifies members like a chat message — post **on request**, never autonomously. `collection` is a lowercase literal key (e.g. `moves`, `highlights`). |
| `board_data {boardId}` | The whole room in one call: board core + canvas manifest + type-tagged wall items (`'key'` = current-state cells, `'move'` = the running log, keyset-cursored). This is your read loop. |
| `board_create` | **Family-Heart only.** Any other canvas project → PERMISSION_DENIED with steering to `board_add_canvas`. |

Errors steer: a refusal names the verb to call next. An opaque `DOMAIN_NOT_FOUND` means the thing isn't yours to see — don't probe.

## The canvas manifest (`vocab` on `board_add_canvas`)

The manifest is how the *game* declares its nature; the board seals a copy at start so instances keep their birth rules.

```jsonc
{
  "playLabel": "두기!",          // the play button's verb, in the family's language
  "playEmoji": "♟️",
  "boardEmoji": "♟️",
  "players": { "min": 2, "max": 2 }   // game's player count (chess = exactly 2)
}
```

- `players` caps membership at start: the picker disables extra members at `max` and blocks Start below `min`; the server enforces the same bounds at create. Undeclared = unbounded (a doodle wall). A "4-player chess variant" is a *different canvas* (or a wider declaration) — never a per-board override.
- Because members = visibility, a `{min:2,max:2}` chess board is seen by exactly its two players. Another pairing starts their own board.

## Rounds, visibility modes, and what your plays look like

- **Rounds**: the wall groups plays into rounds; settlement stamps `round_key`. Canvases that are turn-based read the running `move` log and render whose turn it is themselves (honor-turns; there is no server turn enforcement today).
- **`visibility: "owner_release"`** (gift-box boards): contributions stay hidden (no card, no notification) until the board owner releases them — then they project and notify. Your `board_post` into such a board may be invisible for a while; that's the design, don't repost.
- Each revealed play produces: a wall row (yours to read back via `board_data`), a card in the room, a silent feed row for the parents, and a chat-style push to members not in the room. The **start** of a board also lands a family-feed event ("Han started Word Garden").

## What you must never do

- **Don't try to start boards.** Stage and tell the parent it's ready in their picker.
- **Don't post autonomously.** A play is something a human asked for (game-master moves during an active game the family set up with you count as asked-for).
- **Don't treat held (`owner_release`) content as failed** and never leak it in chat before release.
- **Don't assume a member list is stable** — read `board_get` before reasoning about who sees what.

## Authoring a board canvas (the game itself)

A board canvas is a normal Sprout canvas (see [canvas/sdk.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/sdk.md) and the design/ archetypes ([llms.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/llms.md) indexes them)) that reads the board's wall to render shared state and lands plays as wall rows. Design rules that make board canvases feel right:

- Render the *shared* state from the wall (`move` log filtered to the current round), not from local memory — several devices play the same board.
- Poll modestly (the app's room push keeps members fresh; your canvas refresh is for the open player) and skip refreshing mid-interaction (a selected piece, a pending stroke).
- Declare your verb honestly in the manifest — the play button says what a play *is* ("심기!", "두기!", "Bake!").
- One play per turn where the game demands it: gate your own submit button off the log's last actor. The platform will not do it for you.

## Worked example: staging a two-player game

```
1. canvas_create        → { canvasId: "ba03…" }        // your chess variant
2. board_add_canvas     { canvasId: "ba03…",
                          vocab: { playLabel: "두기!", playEmoji: "♟️",
                                   boardEmoji: "♟️", players: { min: 2, max: 2 } } }
3. → tell the parent: "Chess is ready — start it from Start something new
     and pick the two players."
4. [parent starts it]
5. board_list           → find the new board
6. board_data           → read the wall; game-master or coach as asked
```
