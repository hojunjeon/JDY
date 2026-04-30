import { expect, test } from '@playwright/test';

test('DOM menu flow reaches gameplay', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/');
  await expect(page.locator('.jds-menu-root [data-screen="start"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/phase1-dom-start-1440x900.png', fullPage: true });

  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root [data-screen="stage-select"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/phase1-dom-stage-1440x900.png', fullPage: true });

  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root [data-screen="weapon-select"]')).toBeVisible();
  await page.keyboard.press('Digit2');
  await expect(page.locator('.jds-menu-root [data-screen="weapon-select"]')).toBeVisible();
  await expect(page.locator('.jds-file.active')).toContainText('C_Cpp.c');
  await page.screenshot({ path: 'test-results/phase1-dom-weapon-1440x900.png', fullPage: true });

  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/runtime-overlay-1440x900.png', fullPage: true });
});

test('runtime HUD remains readable on a small viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/');
  await expect(page.locator('.jds-menu-root [data-screen="start"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root [data-screen="stage-select"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root [data-screen="weapon-select"]')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.jds-menu-root')).toHaveCount(0);
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/runtime-overlay-390x844.png', fullPage: true });
});

test('decision overlays do not break canvas flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await expect(page.locator('canvas')).toBeVisible();
  await page.evaluate(async () => {
    const { showStageClearOverlay } = await import('/src/ui/runDecisionOverlay.ts');
    showStageClearOverlay({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 125,
      kills: 72,
      unlockedText: 'reward weapon unlocked',
      onContinue: () => undefined,
      onMenu: () => undefined,
      onCodex: () => undefined,
    });
  });
  await expect(page.locator('[data-decision="stage-clear"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/decision-result-1440x900.png', fullPage: true });
});

test('Quick Fix overlay renders in the browser', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/');
  await page.evaluate(async () => {
    const { showQuickFixOverlay } = await import('/src/ui/runDecisionOverlay.ts');
    showQuickFixOverlay({ weapon: 'python', onSelect: () => undefined });
  });

  await expect(page.locator('[data-decision="quick-fix"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/quick-fix-1440x900.png', fullPage: true });
});

test('opens DOM codex from the start screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/');
  await expect(page.locator('.jds-menu-root [data-screen="start"]')).toBeVisible();
  await page.getByRole('button', { name: /open codex/i }).click();
  await expect(page.locator('.jds-codex-root [data-screen="codex"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/codex-1440x900.png', fullPage: true });
  await page.getByRole('button', { name: /esc close/i }).click();
  await expect(page.locator('.jds-codex-root')).toHaveCount(0);
});
