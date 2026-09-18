#!/usr/bin/env python3
"""Append-only capture of user prompts and final agent responses to .agent-logs/.

Wired to three Cursor hook events in .cursor/hooks.json:

  beforeSubmitPrompt  -> writes the PROMPT entry verbatim
  afterAgentResponse  -> buffers the assistant text (fires once per assistant
                         message, so the buffer keeps overwriting and ends up
                         holding the *last* one)
  stop                -> flushes the buffer as the RESPONSE entry for the turn

Only the last assistant message of a turn is written, so thinking blocks, tool
calls and intermediate chatter never reach the log. Subagent traffic is dropped.

The hook must never break the session: every failure path still returns a
permissive JSON body and exit code 0, with the traceback sent to
.cursor/hooks/state/errors.log.
"""

import fcntl
import json
import os
import re
import sys
import traceback
from datetime import datetime, timezone

HOOK_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_DIR = os.path.join(HOOK_DIR, "state")
CONFIG_PATH = os.path.join(HOOK_DIR, "capture.config.json")
LOG_DIR_NAME = ".agent-logs"
NOT_CAPTURED = "[NOT CAPTURED BY HOOK]"


def now_iso():
    dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + "%03dZ" % (dt.microsecond // 1000)


def log_error(message):
    try:
        os.makedirs(STATE_DIR, exist_ok=True)
        with open(os.path.join(STATE_DIR, "errors.log"), "a") as fh:
            fh.write("%s %s\n" % (now_iso(), message))
    except Exception:
        pass


def load_config():
    config = {"author": "unknown", "project": "project", "tool": "cursor"}
    try:
        with open(CONFIG_PATH) as fh:
            config.update(json.load(fh))
    except Exception:
        pass
    return config


def workspace_root(payload):
    roots = payload.get("workspace_roots") or []
    if roots and isinstance(roots[0], str) and os.path.isdir(roots[0]):
        return roots[0]
    return os.getcwd()


def is_subagent(payload):
    return bool(payload.get("parent_conversation_id") or payload.get("subagent_id"))


def state_path(session_id):
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", session_id) or "unknown"
    return os.path.join(STATE_DIR, safe + ".json")


def read_state(session_id):
    try:
        with open(state_path(session_id)) as fh:
            return json.load(fh)
    except Exception:
        return None


def write_state(session_id, state):
    path = state_path(session_id)
    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(state, fh, indent=2)
    os.replace(tmp, path)


def init_state(session_id, payload, config):
    started = datetime.now(timezone.utc)
    short = session_id.split("-")[0][:8] or "unknown"
    filename = "%s_%s.md" % (started.strftime("%Y-%m-%d_%H-%M-%S"), session_id)
    return {
        "session_id": session_id,
        "short": short,
        "date": started.strftime("%Y-%m-%d"),
        "log_file": os.path.join(LOG_DIR_NAME, filename),
        "author": config["author"],
        "project": config["project"],
        "tool": config["tool"],
        "models": [],
        "count": 0,
        "first_prompt_time": None,
        "last_prompt_time": None,
        "awaiting_response": False,
        "pending_num": 0,
        "pending_text": None,
        "pending_text_time": None,
        "pending_model": None,
    }


def header(state):
    models = ", ".join(state["models"]) or "unknown"
    return (
        "---\n"
        "session_id: %s\n"
        "date: %s\n"
        "author: %s\n"
        "model: %s\n"
        "tool: %s\n"
        "project: %s\n"
        "total_exchanges: %d\n"
        "first_prompt_time: %s\n"
        "last_prompt_time: %s\n"
        "---\n"
        "\n"
        "# Session Log - %s\n"
        "\n"
        "Session: `%s` | Project: `%s` | Author: `%s`\n"
        "\n"
        "---\n"
        % (
            state["session_id"],
            state["date"],
            state["author"],
            models,
            state["tool"],
            state["project"],
            state["count"],
            state["first_prompt_time"] or "unknown",
            state["last_prompt_time"] or "unknown",
            state["date"],
            state["short"],
            state["project"],
            state["author"],
        )
    )


def append_entry(root, state, kind, num, timestamp, model, body):
    """Append one entry, then refresh only the frontmatter block above it.

    Entry bodies are never rewritten once on disk.
    """
    path = os.path.join(root, state["log_file"])
    os.makedirs(os.path.dirname(path), exist_ok=True)

    existing = ""
    if os.path.exists(path):
        with open(path) as fh:
            existing = fh.read()

    # The preamble owns the first two "---" separators (frontmatter close and
    # the rule under the session line). Everything after the second is body,
    # even if an entry itself contains a line of dashes.
    marker = "\n---\n"
    body_so_far = ""
    if existing:
        first = existing.find(marker)
        second = existing.find(marker, first + 1) if first != -1 else -1
        body_so_far = existing[second + len(marker):] if second != -1 else existing

    entry = "\n[LOG_ENTRY type=%s num=%d session=%s]\ntimestamp: %s\nmodel: %s\n\n%s\n\n" % (
        kind,
        num,
        state["short"],
        timestamp,
        model or "unknown",
        body.rstrip("\n") if body else NOT_CAPTURED,
    )

    tmp = path + ".tmp"
    with open(tmp, "w") as fh:
        fh.write(header(state) + body_so_far + entry)
    os.replace(tmp, path)


def note_model(state, model):
    if model and model not in state["models"]:
        state["models"].append(model)


def trace(event, session_id, detail=""):
    """Record every event the hook sees, so gaps in .agent-logs/ are diagnosable.

    Scratch data, not log data - lives in the gitignored state dir.
    """
    try:
        os.makedirs(STATE_DIR, exist_ok=True)
        with open(os.path.join(STATE_DIR, "events.log"), "a") as fh:
            fh.write("%s %-20s %s %s\n" % (now_iso(), event, session_id[:8], detail))
    except Exception:
        pass


def handle(payload):
    event = payload.get("hook_event_name") or ""
    session_id = payload.get("conversation_id") or payload.get("session_id") or "unknown"
    trace(
        event,
        session_id,
        "subagent=%s textlen=%s status=%s"
        % (
            bool(is_subagent(payload)),
            len(payload.get("text") or ""),
            payload.get("status") or "-",
        ),
    )
    if is_subagent(payload):
        return
    if event not in ("beforeSubmitPrompt", "afterAgentResponse", "stop"):
        return

    config = load_config()
    root = workspace_root(payload)
    os.makedirs(STATE_DIR, exist_ok=True)

    with open(os.path.join(STATE_DIR, ".lock"), "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        state = read_state(session_id) or init_state(session_id, payload, config)
        model = payload.get("model")
        stamp = now_iso()

        if event == "beforeSubmitPrompt":
            note_model(state, model)
            state["count"] += 1
            state["last_prompt_time"] = stamp
            if not state["first_prompt_time"]:
                state["first_prompt_time"] = stamp
            state["awaiting_response"] = True
            state["pending_num"] = state["count"]
            state["pending_text"] = None
            state["pending_text_time"] = None
            state["pending_model"] = None
            append_entry(
                root, state, "PROMPT", state["count"], stamp, model, payload.get("prompt") or ""
            )

        elif event == "afterAgentResponse":
            text = payload.get("text") or ""
            if not text.strip():
                return
            state["pending_text"] = text
            state["pending_text_time"] = stamp
            state["pending_model"] = model

        elif event == "stop":
            if not state["awaiting_response"]:
                # The turn's prompt predates hook installation (or was already
                # flushed). Record the gap rather than silently dropping it.
                if not state["pending_text"]:
                    return
                state["count"] += 1
                state["pending_num"] = state["count"]
                if not state["first_prompt_time"]:
                    state["first_prompt_time"] = stamp
                state["last_prompt_time"] = stamp
                note_model(state, model or state["pending_model"])
                append_entry(
                    root,
                    state,
                    "PROMPT",
                    state["count"],
                    stamp,
                    model,
                    NOT_CAPTURED + " - hook was not active when this prompt was submitted.",
                )
            note_model(state, state["pending_model"] or model)
            text = state["pending_text"]
            if not text:
                text = "%s - agent loop ended with status '%s' and no assistant text." % (
                    NOT_CAPTURED,
                    payload.get("status") or "unknown",
                )
            append_entry(
                root,
                state,
                "RESPONSE",
                state["pending_num"],
                state["pending_text_time"] or stamp,
                state["pending_model"] or model,
                text,
            )
            state["awaiting_response"] = False
            state["pending_text"] = None
            state["pending_text_time"] = None
            state["pending_model"] = None

        write_state(session_id, state)


def main():
    raw = ""
    try:
        raw = sys.stdin.read()
        handle(json.loads(raw) if raw.strip() else {})
    except Exception:
        log_error(traceback.format_exc().replace("\n", " | "))
        log_error("payload: " + raw[:2000])
    print(json.dumps({"continue": True}))
    sys.exit(0)


if __name__ == "__main__":
    main()
