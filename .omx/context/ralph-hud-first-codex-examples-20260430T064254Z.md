# Ralph Context Snapshot: HUD-first Codex Examples

- Task statement: Execute `.omx/plans/prd-hud-first-codex-examples.md` and `.omx/plans/test-spec-hud-first-codex-examples.md`.
- Desired outcome: Live Phaser GameScene HUD visibly resembles `codex_examples/04_in_game_hud_frontend_design.html` while preserving gameplay logic.
- Known facts/evidence: PRD/test-spec exist and are consensus approved. Current HUD is in `src/scenes/GameScene.ts`; pure HUD view model is in `src/ui/runtimeOverlay.ts`; e2e screenshots are in `tests/e2e/boot.spec.ts`.
- Constraints: HUD-only first pass; no gameplay logic changes; no new dependencies; verify with npm test/build/e2e and screenshots; mandatory 390x844 screenshot unless e2e blocked.
- Unknowns/open questions: Exact visual layout can be decided by implementation within PRD boundaries.
- Likely touchpoints: `src/ui/runtimeOverlay.ts`, `tests/runtimeOverlay.test.ts`, `src/scenes/GameScene.ts`, `tests/e2e/boot.spec.ts`, optional planning checklist doc.
