# CAPTURE-TEST

## 1. Tool and model

- **Tool:** Cursor (IDE agent chat)
- **Model:** `claude-opus-5-thinking-high` — a single model both plans and executes.
  There is no separate planner/executor split. Any mid-build model switch is visible
  per-entry in the log, because every `[LOG_ENTRY]` carries its own `model:` line and the
  session frontmatter lists every distinct model seen in that session.
- **Automatic mechanism available?** Yes. Cursor has a first-class hook system
  (documented at <https://cursor.com/docs/agent/hooks>) that runs a command on agent
  lifecycle events. It is not a manual export and not a rules-file convention — the
  events fire on their own, including in sessions started after the config was written.

## 2. Mechanism and config files changed

| File | Role |
| --- | --- |
| `.cursor/hooks.json` | Registers the three hook events (this is the config file that turns capture on) |
| `.cursor/hooks/capture.py` | The capture script — reads the hook JSON on stdin, appends to `.agent-logs/` |
| `.cursor/hooks/capture.config.json` | Author / project / tool values written into the frontmatter |
| `.cursor/hooks/state/` | Per-session bookkeeping (entry counter, pending response buffer). Gitignored — it is scratch state, not log data |
| `.cursor/rules/agent-logs-are-immutable.mdc` | Always-applied rule telling any future agent session never to edit, tidy, or gitignore the logs |

Three events are wired, all to the same script:

- **`beforeSubmitPrompt`** — fires the moment the user hits send, and receives the prompt
  text verbatim. Writes the `PROMPT` entry immediately.
- **`afterAgentResponse`** — fires once per completed assistant message and receives that
  message's text. The script **buffers** it rather than writing it.
- **`stop`** — fires when the agent loop for the turn ends. Flushes whatever is in the
  buffer as the `RESPONSE` entry.

The buffer-then-flush design is the whole point: because `afterAgentResponse` overwrites
the buffer each time, what `stop` flushes is the **last** assistant message of the turn.
Thinking blocks, tool calls, file reads, diffs, and the model's self-corrections mid-turn
never reach the log. Subagent traffic is dropped by checking for `parent_conversation_id`
on the payload.

The script is defensive by design: every failure path still returns `{"continue": true}`
and exit code 0, so a bug in capture can never block a prompt. Exceptions go to
`.cursor/hooks/state/errors.log`.

## 3. Where the canaries landed

<!-- filled in once the canaries have run -->

- Canary 1 (this session): _pending_
- Canary 2 (fresh session): _pending_

## 4. Canary entries, raw

<!-- pasted verbatim from the log file, not retyped -->

_pending_

## 5. Things that did not work / were wrong first

1. **Nearly used `afterAgentResponse` on its own.** It looks like "the response hook", but
   it fires for *every* assistant message in a turn, so a turn with five tool calls would
   have produced five `RESPONSE` entries full of intermediate narration — exactly what the
   brief says not to capture. Reworked into the buffer + `stop`-flush design above.
2. **Frontmatter/body split bug, caught before the first real run.** The script rewrites
   the frontmatter on every append (to keep `total_exchanges` and `last_prompt_time`
   current) and appends the entry below it. My first version found the *third* `---`
   separator in the file when splitting preamble from body. That is wrong — the preamble
   only owns two — and it would have silently eaten the first log entry. Worse, any prompt
   containing a `---` line (the assignment prompt itself contains several) would have
   shifted the split point. Fixed to always take the second separator, and the dry run
   includes a prompt with a `---` line in it to prove entries survive.
3. **`chmod +x` and the hook's own writes were blocked by the agent's command sandbox.**
   Writes under `.cursor/` are not permitted from sandboxed agent commands, so the first
   dry run produced no log file and no error output at all — a silent no-op that looked
   like the script was broken. It was not; re-running the same commands outside the
   sandbox worked. Real hooks are spawned by Cursor, not by the sandbox, so this only
   affected my own testing.
4. **No `cursor-agent` CLI on this machine**, so I could not script a second session
   headlessly to prove cross-session capture. The second canary has to be a genuinely new
   chat in the IDE.
5. **The first turn of the first session has no prompt entry.** The hook did not exist yet
   when that prompt was submitted — it was the prompt that asked for the hook. The script
   detects this case and writes an explicit `[NOT CAPTURED BY HOOK]` placeholder rather
   than inventing the prompt text or hiding the gap.
