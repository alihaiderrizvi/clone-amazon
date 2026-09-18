# CAPTURE-TEST

## 1. Tool and model

- **Tool:** Cursor (IDE agent chat), version 3.21.13
- **Model:** `claude-opus-5-thinking-high` for the build. One model both plans and
  executes — there is no planner/executor split.
- **Model switches are visible.** The second canary session happened to run
  `cursor-grok-4.6-high`, and that shows up unprompted in both the per-entry `model:`
  line and the session frontmatter. Every `[LOG_ENTRY]` carries its own model name, and
  the frontmatter lists every distinct model seen in that session, comma-separated.
- **Automatic mechanism available?** Yes. Cursor has a first-class hook system
  (<https://cursor.com/docs/agent/hooks>) that runs a command on agent lifecycle events.
  It is not a manual export and not a rules-file convention — the events fire on their
  own, including in sessions started long after the config was written, which canary 2
  demonstrates.

## 2. Mechanism and config files changed

| File | Role |
| --- | --- |
| `.cursor/hooks.json` | Registers the three hook events. This is the config file that turns capture on. |
| `.cursor/hooks/capture.py` | The capture script — reads hook JSON on stdin, appends to `.agent-logs/` |
| `.cursor/hooks/capture.config.json` | Author / project / tool values written into the frontmatter |
| `.cursor/hooks/state/` | Per-session bookkeeping, plus an event trace. Gitignored — scratch state, not log data |
| `.cursor/rules/agent-logs-are-immutable.mdc` | Always-applied rule telling any future agent session never to edit, tidy, or gitignore the logs |

Three events are wired, all to the same script:

- **`beforeSubmitPrompt`** — fires the moment the user hits send, and receives the prompt
  text verbatim. Writes the `PROMPT` entry immediately.
- **`afterAgentResponse`** — fires on a completed assistant message and receives its text.
  The script **buffers** it rather than writing it.
- **`stop`** — fires when the agent loop for the turn ends. Flushes the buffer as the
  `RESPONSE` entry.

The buffer-then-flush design is the whole point. Because `afterAgentResponse` overwrites
the buffer each time, what `stop` flushes is the **last** assistant message of the turn.
Thinking blocks, tool calls, file reads, diffs, and the model's mid-turn self-corrections
never reach the log. This is not theoretical: the very first captured turn in session
`2a15ee51` contained five separate assistant messages, and exactly one — the last — is in
the log. Subagent traffic is dropped by checking for `parent_conversation_id`.

The script is deliberately unable to break a session: every failure path still returns
`{"continue": true}` and exit code 0, so a bug in capture can never block a prompt.
Exceptions go to `.cursor/hooks/state/errors.log`, which is empty.

Cursor confirmed the config loaded with
`Loaded 3 project hook(s) for steps: beforeSubmitPrompt, afterAgentResponse, stop`.

## 3. Where the canaries landed

- **Canary 1** (session `2a15ee51`, the session that installed the hook):
  `.agent-logs/2026-09-18_20-00-24_2a15ee51-1033-4bbf-bd6a-6da242dbbad7.md`
- **Canary 2** (session `78a0c302`, a brand-new chat opened afterwards):
  `.agent-logs/2026-09-18_20-04-17_78a0c302-22b9-4906-bf2e-f6a57afe7f2f.md`

Two different session IDs, two different files, two different models. The hook was not
touched between them.

## 4. Canary entries, raw

Copied verbatim out of the two log files.

### Canary 1 — `2026-09-18_20-00-24_2a15ee51-1033-4bbf-bd6a-6da242dbbad7.md`

```
[LOG_ENTRY type=PROMPT num=2 session=2a15ee51]
timestamp: 2026-09-18T20:02:11.964Z
model: claude-opus-5-thinking-high

CAPTURE TEST — 8x assignment, Ali Haider Rizvi


[LOG_ENTRY type=RESPONSE num=2 session=2a15ee51]
timestamp: 2026-09-18T20:03:28.085Z
model: claude-opus-5-thinking-high

Canary 1 is captured: your prompt is in the log verbatim as `PROMPT num=2`, and the matching `RESPONSE num=2` gets written the moment this turn ends, same as last time.

Two things worth flagging honestly rather than glossing over.

**A gap I found.** The short turn that was triggered by the background-task notification — not by a prompt from you — produced an assistant message that never reached the log. My script has a path for exactly this case (an orphan response with no preceding prompt), and it didn't trigger, which means the response hook never fired for that turn. So the likely rule is that Cursor emits the capture events for user-initiated turns, not for system-initiated ones. I wanted to confirm that against Cursor's own hook log, but that lives outside this repo and reading it needed an escalation, so I added an event trace to the hook instead. It writes every event it receives to the gitignored `.cursor/hooks/state/events.log`, which answers the same question from inside the repo and keeps answering it for the rest of the build. I'll read it next turn and write the real explanation into `CAPTURE-TEST.md`.

**One canary left.** I still need the second session to satisfy step 4's "a hook that only works in the session that created it is not installed". Open a **new chat** in this repo and send `CAPTURE TEST — 8x assignment, Ali Haider Rizvi`, then come back here. That should produce a second file in `.agent-logs/` under a different session ID.

Once that lands I'll fill in both pending sections of `CAPTURE-TEST.md` with the raw entries and file paths, add the event-gap finding to the "what didn't work" list, commit, and we're clear to start building.
```

### Canary 2 — `2026-09-18_20-04-17_78a0c302-22b9-4906-bf2e-f6a57afe7f2f.md`

Note the model: this session was running `cursor-grok-4.6-high`, not Opus.

```
[LOG_ENTRY type=PROMPT num=1 session=78a0c302]
timestamp: 2026-09-18T20:04:17.141Z
model: cursor-grok-4.6-high

CAPTURE TEST — 8x assignment, Ali Haider


[LOG_ENTRY type=PROMPT num=2 session=78a0c302]
timestamp: 2026-09-18T20:04:24.004Z
model: cursor-grok-4.6-high

CAPTURE TEST — 8x assignment, Ali Haider Rizvi


[LOG_ENTRY type=RESPONSE num=2 session=78a0c302]
timestamp: 2026-09-18T20:05:41.242Z
model: cursor-grok-4.6-high

Canary 2 is captured in this new session.

The hook already wrote your prompt into `.agent-logs/2026-09-18_20-04-17_78a0c302-22b9-4906-bf2e-f6a57afe7f2f.md` as `PROMPT num=2` under session `78a0c302`. That is a different session ID from the first canary (`2a15ee51`), so capture is working outside the chat that installed the hook.

The matching `RESPONSE` entry is written when this turn ends.

Go back to the original chat so it can fill `CAPTURE-TEST.md` from both log files.
```

`PROMPT num=1` in session 2 has no matching `RESPONSE`. That is not a bug and it has been
left exactly as recorded: two prompts were sent seven seconds apart, the second before the
agent had answered the first, so there was only ever one response. The log shows what
actually happened rather than being tidied into a neat pair.

## 5. Things that did not work, or were wrong first

1. **Nearly used `afterAgentResponse` on its own.** It looks like "the response hook", but
   the docs say it fires per completed assistant message, so a turn with several tool
   calls could have produced several `RESPONSE` entries full of intermediate narration —
   exactly what the brief says not to capture. Reworked into the buffer + `stop`-flush
   design. In practice the event trace shows it firing once per turn, but the buffer makes
   last-message-wins true either way.
2. **Frontmatter/body split bug, caught on review before the first real run.** The script
   rewrites the frontmatter on every append (to keep `total_exchanges` and
   `last_prompt_time` current) and appends the entry below it. My first version found the
   *third* `---` separator when splitting preamble from body. The preamble only owns two,
   so this would have silently eaten the first log entry — and worse, any prompt
   containing a `---` line (the assignment prompt itself has several) would have moved the
   split point. Fixed to always take the second separator, and the dry run deliberately
   includes a prompt with a `---` line in it.
3. **`chmod +x` and the hook's own writes were blocked by the agent's command sandbox.**
   Writes under `.cursor/` are not permitted from sandboxed agent commands, so the first
   dry run produced no log file *and no error output at all* — a silent no-op that looked
   like a broken script. It wasn't; the same commands run outside the sandbox worked
   immediately. Real hooks are spawned by Cursor, not by that sandbox, so this only ever
   affected my own testing.
4. **I wrongly declared the hook dead.** `.agent-logs/` was still empty several minutes
   after the config loaded, and I reported that the hook wasn't firing. That was a bad
   inference from absence of output. The actual cause: asking the user a question via the
   question tool does not end the agent loop, and their reply was queued into the same
   running turn, so the whole first stretch of work was **one turn** and `stop` had simply
   never fired. It fired correctly the instant the turn really ended. The lesson was to
   check the event stream rather than the artefact.
5. **A real capture gap, still present.** One turn was triggered by a background-task
   completion notification rather than by a user prompt, and its assistant message never
   reached the log. The script has an orphan-response path for exactly that shape, and it
   did not trigger, so no response event fired for that turn at all. Cursor appears to
   emit these events for user-initiated turns only. I could not confirm this retroactively
   because I added event tracing afterwards, so this is stated as an observation rather
   than a certainty. Every user-initiated turn since has been captured.
6. **Debugging via Cursor's application logs needed an escalation.** Confirming event
   behaviour meant reading `~/Library/Application Support/Cursor/logs`, outside the repo.
   Rather than escalate, I added `.cursor/hooks/state/events.log` — the hook records every
   event it receives, which answers the same question from inside the repo and keeps
   answering it for the rest of the build.
7. **No `cursor-agent` CLI on this machine**, so I could not script a second session
   headlessly. Canary 2 had to be a genuinely new chat in the IDE, which is the stronger
   test anyway.
8. **The first turn of session 1 has no prompt text.** The hook did not exist when that
   prompt was submitted — it was the prompt asking for the hook. The script writes an
   explicit `[NOT CAPTURED BY HOOK]` placeholder rather than inventing the text or hiding
   the gap.
