#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Runs `next` with AI-coding-agent env vars stripped so `next dev` never
// auto-writes AGENTS.md / CLAUDE.md (see next/dist/server/lib/generate-agent-files.js,
// triggered via next/dist/compiled/@vercel/detect-agent reading these vars).
const { spawnSync } = require("node:child_process");

const AGENT_ENV_VARS = [
  "AI_AGENT",
  "CURSOR_TRACE_ID",
  "CURSOR_AGENT",
  "CURSOR_EXTENSION_HOST_ROLE",
  "GEMINI_CLI",
  "CODEX_SANDBOX",
  "CODEX_CI",
  "CODEX_THREAD_ID",
  "ANTIGRAVITY_AGENT",
  "AUGMENT_AGENT",
  "OPENCODE_CLIENT",
  "CLAUDECODE",
  "CLAUDE_CODE",
  "CLAUDE_CODE_IS_COWORK",
  "REPL_ID",
  "COPILOT_MODEL",
  "COPILOT_ALLOW_ALL",
  "COPILOT_GITHUB_TOKEN",
];

const env = { ...process.env };
for (const key of AGENT_ENV_VARS) delete env[key];

const nextBin = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
