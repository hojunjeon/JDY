# Test Spec: Codex Examples Screen Composition Alignment Closeout

## Focused TDD Checks
- `npm test -- tests/runDecisionOverlay.test.ts` after adding decision shell test should fail before statusbar markup, then pass after implementation.
- `npm test -- tests/runDecision.test.ts tests/runDecisionOverlay.test.ts` verifies decision view/model compatibility.
- `npm test -- tests/runtimeOverlay.test.ts` verifies compact HUD text and runtime view copy.
- `npm test -- tests/codexModel.test.ts tests/codexOverlay.test.ts` verifies codex model/DOM shell behavior.

## Full Regression Checks
- `npm test`
- `npm run build`
- `npm run e2e`

## Screenshot Evidence
Confirm these 1440x900 screenshots exist and visually pass:
- `test-results/phase1-dom-start-1440x900.png`
- `test-results/phase1-dom-stage-1440x900.png`
- `test-results/phase1-dom-weapon-1440x900.png`
- `test-results/runtime-overlay-1440x900.png`
- `test-results/quick-fix-1440x900.png`
- `test-results/decision-result-1440x900.png`
- `test-results/codex-1440x900.png`
