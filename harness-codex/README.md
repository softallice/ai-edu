# harness-codex — Codex-only harness (extracted from ECC)

This directory is a **faithful Codex-only extraction** of the ECC harness
(`/opt/gopath/src/github/lab/ecc-new`). It contains exactly the surface that
the OpenAI **Codex CLI** consumes — nothing from the Claude Code, Cursor,
Gemini, Qwen, Zed, or OpenCode harnesses — plus the sync/merge tooling needed
to install it into a local `~/.codex` setup.

> Provenance: ECC v`VERSION` (see `./VERSION`). All files are copied verbatim
> from `ecc-new`; only `package.json` and this `README.md` are new (minimal
> Codex-scoped manifests).

## What Codex reads

| Path | Role |
|------|------|
| `AGENTS.md` | Root agent instructions (Codex's primary context file). |
| `.codex/AGENTS.md` | Codex-specific supplement merged after the root file. |
| `.codex/config.toml` | Runtime config: `approval_policy`, `sandbox_mode`, `web_search`, MCP servers, `strict`/`yolo` profiles, and multi-agent role wiring. |
| `.codex/agents/*.toml` | Multi-agent roles: `explorer` (read-only evidence), `reviewer` (correctness/security), `docs-researcher` (API verification). |
| `.codex-plugin/plugin.json` | Codex plugin manifest (marketplace install path). |
| `.codex-plugin/README.md` | Plugin install/marketplace notes and caveats. |
| `.agents/skills/` | **37 Codex-format skills** — each has `SKILL.md` + `agents/openai.yaml` (the OpenAI/Codex interface metadata). Auto-loaded by Codex. |
| `.agents/plugins/marketplace.json` | Repo-scoped Codex marketplace entry. |
| `.mcp.json` | Default MCP servers (chrome-devtools). |
| `mcp-configs/mcp-servers.json` | Opt-in MCP server registry merged on demand. |
| `assets/` | Plugin icon (`ecc-icon.svg`) and hero (`hero.png`) referenced by `plugin.json`. |

## Sync / install tooling

| Path | Role |
|------|------|
| `scripts/sync-ecc-to-codex.sh` | Main installer — merges `AGENTS.md` (marker-based, preserves user content), generates Codex prompt files from `commands/`, installs git safety hooks, and merges MCP servers into `~/.codex/config.toml`. |
| `scripts/codex/merge-codex-config.js` | Add-only TOML merge of the ECC baseline into `~/.codex/config.toml`. |
| `scripts/codex/merge-mcp-config.js` | Add-only MCP-server merge (uses `@iarna/toml`). |
| `scripts/codex/check-codex-global-state.sh` | Post-sync regression sanity check. |
| `scripts/codex/check-plugin-cache.js` | Verifies the installed plugin manifest can resolve its skills/MCP/assets. |
| `scripts/codex/install-global-git-hooks.sh` | Installs global `pre-commit` / `pre-push` safety hooks. |
| `scripts/codex-git-hooks/` | The `pre-commit` / `pre-push` hook bodies. |
| `scripts/orchestrate-codex-worker.sh` | Multi-agent Codex worker orchestration helper. |
| `scripts/lib/` | Minimal lib closure required by the merge scripts (`mcp-config.js`, `package-manager.js`, `utils.js`, `agent-data-home.js`). |
| `commands/` | 92 ECC command prompts; `sync` converts each into a Codex prompt file under `~/.codex/prompts/`. |
| `.cursor/rules/` | Language rule-packs — `sync` turns these into optional Codex rule prompts (required input by the sync script). |

## Usage

```bash
cd harness-codex
npm install                      # installs @iarna/toml for the merge scripts

# Preview every change without writing anything
bash scripts/sync-ecc-to-codex.sh --dry-run

# Install into ~/.codex (merges AGENTS.md, prompts, MCP servers, git hooks)
bash scripts/sync-ecc-to-codex.sh

# Refresh ECC-managed MCP servers to the latest recommended config
bash scripts/sync-ecc-to-codex.sh --update-mcp
```

For project-local use, Codex also reads `.codex/config.toml` and `AGENTS.md`
directly from the repo root, so this directory works as a drop-in reference
config without running the global sync.

## Codex skills included (37)

`.agents/skills/`: agent-introspection-debugging, agent-sort, api-design,
article-writing, backend-patterns, benchmark-methodology, brand-discovery,
brand-voice, bun-runtime, coding-standards, competitive-platform-analysis,
competitive-report-structure, content-engine, crosspost, deep-research,
dmux-workflows, documentation-lookup, e2e-testing, eval-harness,
everything-claude-code, exa-search, fal-ai-media, frontend-patterns,
frontend-slides, investor-materials, investor-outreach, market-research,
mcp-server-patterns, mle-workflow, nextjs-turbopack, product-capability,
security-review, strategic-compact, tdd-workflow, verification-loop,
video-editing, x-api.

## What was intentionally excluded

Non-Codex harness surfaces from `ecc-new`: `.claude/`, `.claude-plugin/`,
`.cursor/{hooks,skills}`, `.gemini/`, `.qwen/`, `.zed/`, `.opencode/`,
`.kiro/`, `.trae/`, `hooks/` (Claude hooks — Codex has no hook support),
`agents/` (Claude subagent defs), the 277-entry Claude-format `skills/` tree,
`docs/`, and the rest of the multi-harness installer. Only the Codex-format
skills under `.agents/skills/` are carried over.
