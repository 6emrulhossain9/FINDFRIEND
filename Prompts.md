# Prompts

> Living document. Every prompt template used for local-AI features
> lives here, with the model name and version that ran it. See the
> master spec, §5/§8.

## Phase 0

No AI features in Phase 0. This file exists so future phases have a
canonical place to land.

## Conventions (for future phases)

- Pin the model name + version (e.g. `llama3.1:8b-instruct-q5_K_M`,
  not just "Llama").
- Pin the Ollama version the prompt was authored against. (Ollama
  itself is 0.32.3 on the dev machine as of 2026-07-24.)
- Include the system prompt, the user prompt template, and the expected
  output schema.
- Include a "Why this shape" note: what we tried before, what failed,
  and what the prompt does to avoid the failure.
- Cost note: is this dev-time only, or does it run in production?
  If production, where does the inference live (always-free Fly.io
  sidecar, batched async, etc.) and what is the monthly ceiling?
