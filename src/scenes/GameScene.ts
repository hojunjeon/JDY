import Phaser from 'phaser';
import { enemies, stages, weapons } from '../data/gameData';
import { EventSystem } from '../systems/EventSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import type { EnemyConfig, EnemyId, EventId, WeaponConfig, WeaponId } from '../types';
import { clearCodexOverlay, showCodexOverlay } from '../ui/codexOverlay';
import type { QuickFixId } from '../ui/runDecision';
import { clearRunDecisionOverlay, showGameOverOverlay, showQuickFixOverlay, showStageClearOverlay } from '../ui/runDecisionOverlay';
import { buildRuntimeHudView, type RuntimeEventSummary } from '../ui/runtimeOverlay';
import { clearRuntimeAlert, showBossWarning, showQuestToast } from '../ui/runtimeOverlayDom';
import { toHexColor, uiColors, uiDepths, uiFonts, uiLayout } from '../ui/theme';

interface EnemyActor {
  id: EnemyId;
  hp: number;
  sprite: Phaser.GameObjects.Arc;
  config: EnemyConfig;
}

interface ProjectileActor {
  damage: number;
  velocity: Phaser.Math.Vector2;
  sprite: Phaser.GameObjects.Arc;
  ttl: number;
}

interface BossActor {
  hp: number;
  maxHp: number;
  sprite: Phaser.GameObjects.Arc;
}

interface RuntimeHudObjects {
  hpValue: Phaser.GameObjects.Text;
  hpMeter: RuntimeHudMeter;
  upgradeValue: Phaser.GameObjects.Text;
  upgradeMeter: RuntimeHudMeter;
  timer: Phaser.GameObjects.Text;
  stage: Phaser.GameObjects.Text;
  weaponName: Phaser.GameObjects.Text;
  weaponDetail: Phaser.GameObjects.Text;
  eventLine: Phaser.GameObjects.Text;
  bossLine: Phaser.GameObjects.Text;
  bossMeter: RuntimeHudMeter;
  hint: Phaser.GameObjects.Text;
}

interface RuntimeHudMeter {
  background: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  maxWidth: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private enemies: EnemyActor[] = [];
  private projectiles: ProjectileActor[] = [];
  private boss: BossActor | null = null;
  private weaponSystem = new WeaponSystem();
  private eventSystem = new EventSystem(stages[0]);
  private elapsedSec = 0;
  private spawnTimer = 0;
  private kills = 0;
  private hp = 100;
  private hud!: RuntimeHudObjects;
  private eventLog!: Phaser.GameObjects.Text;
  private selectedWeapon: WeaponId = 'python';
  private isEnded = false;
  private isChoosingUpgrade = false;
  private nextUpgradeAtKills = 12;

  constructor() {
    super('GameScene');
  }

  init(data: { weapon?: WeaponId }): void {
    this.selectedWeapon = data.weapon ?? 'python';
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, 2200, 1600);
    this.drawWorldGrid();
    this.player = this.add.circle(1100, 800, 16, 0x4fc3f7).setStrokeStyle(2, 0x0ff0d0);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,R,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.weaponSystem.addWeapon(this.selectedWeapon);

    this.createRuntimeHud();
    this.input.keyboard?.on('keydown-R', () => this.scene.restart({ weapon: this.selectedWeapon }));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      clearRuntimeAlert();
      clearRunDecisionOverlay();
      clearCodexOverlay();
    });
  }

  private createRuntimeHud(): void {
    const root = this.add.container(14, 14).setScrollFactor(0).setDepth(uiDepths.hud);
    const hpValue = this.addHudText(226, 34, '', '20px', uiColors.white).setOrigin(1, 0);
    const hpMeter = this.addHudMeter(54, 62, 184, uiColors.red);
    const upgradeValue = this.addHudText(226, 82, '', '20px', uiColors.white).setOrigin(1, 0);
    const upgradeMeter = this.addHudMeter(78, 112, 160, uiColors.teal);
    const timer = this.addHudText(372, 16, '00:00', '52px', uiColors.white).setOrigin(0.5, 0);
    const stage = this.addHudText(372, 84, '', '18px', uiColors.comment).setOrigin(0.5, 0);
    const weaponName = this.addHudText(506, 34, '', '30px', uiColors.teal);
    const weaponDetail = this.addHudText(506, 84, '', '20px', uiColors.dim);
    const eventLine = this.addHudText(14, 552, '', '20px', uiColors.dim, 510);
    const eventLog = this.addHudText(14, 590, 'boot: Stage 1 session opened', '20px', uiColors.green, 510);
    const bossLine = this.addHudText(558, 552, '', '20px', uiColors.red, 340);
    const bossMeter = this.addHudMeter(558, 586, 340, uiColors.red);
    const hint = this.addHudText(558, 602, '', '13px', uiColors.dim, 340);

    root.add([
      this.addHudPanel(0, 0, 252, 140, uiColors.teal),
      this.addHudLabel(12, 10, 'Player Runtime'),
      this.addHudText(12, 34, 'HP', '20px', uiColors.red),
      hpValue,
      hpMeter.background,
      hpMeter.fill,
      this.addHudText(12, 82, 'Upgrade', '20px', uiColors.green),
      upgradeValue,
      upgradeMeter.background,
      upgradeMeter.fill,
      this.addHudPanel(266, 0, 212, 140, uiColors.teal),
      timer,
      stage,
      this.addHudPanel(492, 0, 336, 140, uiColors.blue),
      this.addHudLabel(506, 10, 'Selected Weapon'),
      weaponName,
      weaponDetail,
      this.addHudPanel(0, 524, 532, 92, uiColors.yellow),
      this.addHudLabel(14, 538, 'Event Queue'),
      eventLine,
      eventLog,
      this.addHudPanel(544, 524, 372, 92, uiColors.red),
      this.addHudLabel(558, 538, 'Warning State'),
      bossLine,
      bossMeter.background,
      bossMeter.fill,
      hint,
    ]);

    this.hud = {
      hpValue,
      hpMeter,
      upgradeValue,
      upgradeMeter,
      timer,
      stage,
      weaponName,
      weaponDetail,
      eventLine,
      bossLine,
      bossMeter,
      hint,
    };
    this.eventLog = eventLog;
  }

  private addHudPanel(x: number, y: number, width: number, height: number, accent: string): Phaser.GameObjects.Rectangle {
    const panel = this.add.rectangle(x, y, width, height, toHexColor('bg'), 0.9).setOrigin(0, 0);
    panel.setStrokeStyle(uiLayout.panelBorderWidth, Number.parseInt(accent.slice(1), 16), 0.36);
    return panel;
  }

  private addHudLabel(x: number, y: number, text: string): Phaser.GameObjects.Text {
    return this.addHudText(x, y, text, '16px', uiColors.comment).setAlpha(0.96);
  }

  private addHudText(
    x: number,
    y: number,
    text: string,
    fontSize: string,
    color: string,
    wrapWidth?: number,
  ): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: uiFonts.fallbackMono,
      fontSize,
      color,
      wordWrap: wrapWidth ? { width: wrapWidth } : undefined,
    });
  }

  private addHudMeter(
    x: number,
    y: number,
    width: number,
    color: string,
  ): RuntimeHudMeter {
    const background = this.add.rectangle(x, y, width, 8, 0x111111, 0.92).setOrigin(0, 0);
    background.setStrokeStyle(1, toHexColor('dim'), 0.22);
    const fill = this.add.rectangle(x + 1, y + 1, width - 2, 6, Number.parseInt(color.slice(1), 16), 0.9).setOrigin(0, 0);
    return { background, fill, maxWidth: width - 2 };
  }

  update(_time: number, deltaMs: number): void {
    if (this.isEnded) return;
    if (this.isChoosingUpgrade) return;
    const dt = deltaMs / 1000;
    this.elapsedSec += dt;
    this.updatePlayer(dt);
    this.updateSpawns(dt);
    this.updateWeapons(deltaMs);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateEvents(dt);
    this.updateHud();
    if (this.hp <= 0) this.endRun(false);
  }

  private updatePlayer(dt: number): void {
    const dir = new Phaser.Math.Vector2(0, 0);
    if (this.cursors.left.isDown || this.keys.A.isDown) dir.x -= 1;
    if (this.cursors.right.isDown || this.keys.D.isDown) dir.x += 1;
    if (this.cursors.up.isDown || this.keys.W.isDown) dir.y -= 1;
    if (this.cursors.down.isDown || this.keys.S.isDown) dir.y += 1;
    if (dir.lengthSq() > 0) dir.normalize();
    this.player.x = Phaser.Math.Clamp(this.player.x + dir.x * 220 * dt, 24, 2176);
    this.player.y = Phaser.Math.Clamp(this.player.y + dir.y * 220 * dt, 24, 1576);
  }

  private updateSpawns(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0 || this.boss) return;
    this.spawnTimer = Math.max(0.35, 1.15 - this.elapsedSec / 160);
    const activeEvent = this.eventSystem.getActiveEvents()[0];
    const stage = stages[0];
    const eventConfig = activeEvent ? stage.events.find((event) => event.id === activeEvent.id) : undefined;
    const type = eventConfig?.targetEnemy ?? Phaser.Utils.Array.GetRandom(stage.enemyPool);
    const amount = activeEvent ? 2 : 1 + Math.floor(this.elapsedSec / 35);
    for (let i = 0; i < amount; i += 1) this.spawnEnemy(type);
  }

  private spawnEnemy(id: EnemyId): void {
    const config = enemies[id];
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = 380;
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * radius, 30, 2170);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * radius, 30, 1570);
    const sprite = this.add.circle(x, y, config.radius, config.color, 0.95).setStrokeStyle(1, 0x05070d);
    this.enemies.push({ id, hp: config.hp, sprite, config });
  }

  private updateWeapons(deltaMs: number): void {
    for (const weapon of this.weaponSystem.update(deltaMs)) {
      this.fireWeapon(weapon);
    }
  }

  private fireWeapon(weapon: WeaponConfig): void {
    const targets = [...this.enemies.map((enemy) => enemy.sprite), ...(this.boss ? [this.boss.sprite] : [])];
    const target = targets.sort((a, b) => Phaser.Math.Distance.Squared(this.player.x, this.player.y, a.x, a.y) - Phaser.Math.Distance.Squared(this.player.x, this.player.y, b.x, b.y))[0];
    const base = target
      ? new Phaser.Math.Vector2(target.x - this.player.x, target.y - this.player.y).normalize()
      : new Phaser.Math.Vector2(1, 0);
    const bursts = weapon.id === 'javascript' ? 3 : weapon.id === 'django' ? 5 : 1;
    for (let i = 0; i < bursts; i += 1) {
      const spread = bursts === 1 ? 0 : Phaser.Math.DegToRad((i - (bursts - 1) / 2) * 16);
      const dir = base.clone().rotate(spread);
      const sprite = this.add.circle(this.player.x, this.player.y, weapon.id === 'sql' ? 9 : 5, weapon.color);
      this.projectiles.push({
        damage: weapon.damage,
        velocity: dir.scale(weapon.projectileSpeed),
        sprite,
        ttl: weapon.id === 'sql' ? 1.4 : 2.2,
      });
    }
    if (weapon.id === 'git') {
      this.cameras.main.shake(90, 0.003);
    }
  }

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      const dir = new Phaser.Math.Vector2(this.player.x - enemy.sprite.x, this.player.y - enemy.sprite.y);
      if (dir.lengthSq() > 0) dir.normalize();
      const sign = enemy.config.behavior === 'flee' ? -1 : 1;
      enemy.sprite.x += dir.x * enemy.config.speed * sign * dt;
      enemy.sprite.y += dir.y * enemy.config.speed * sign * dt;
      if (Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y) < enemy.config.radius + 16) {
        this.hp -= enemy.config.contactDamage * dt;
      }
    }
    if (this.boss) {
      const dir = new Phaser.Math.Vector2(this.player.x - this.boss.sprite.x, this.player.y - this.boss.sprite.y).normalize();
      this.boss.sprite.x += dir.x * 72 * dt;
      this.boss.sprite.y += dir.y * 72 * dt;
      if (Phaser.Math.Distance.Between(this.boss.sprite.x, this.boss.sprite.y, this.player.x, this.player.y) < 50) {
        this.hp -= 20 * dt;
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (const projectile of this.projectiles) {
      projectile.sprite.x += projectile.velocity.x * dt;
      projectile.sprite.y += projectile.velocity.y * dt;
      projectile.ttl -= dt;
      for (const enemy of this.enemies) {
        if (Phaser.Math.Distance.Between(projectile.sprite.x, projectile.sprite.y, enemy.sprite.x, enemy.sprite.y) < enemy.config.radius + 7) {
          enemy.hp -= projectile.damage;
          projectile.ttl = 0;
          projectile.sprite.setScale(1.8);
          break;
        }
      }
      if (this.boss && Phaser.Math.Distance.Between(projectile.sprite.x, projectile.sprite.y, this.boss.sprite.x, this.boss.sprite.y) < 42) {
        this.boss.hp -= projectile.damage;
        projectile.ttl = 0;
      }
    }

    this.projectiles = this.projectiles.filter((projectile) => {
      const keep = projectile.ttl > 0;
      if (!keep) projectile.sprite.destroy();
      return keep;
    });

    this.enemies = this.enemies.filter((enemy) => {
      const alive = enemy.hp > 0;
      if (!alive) {
        this.kills += 1;
        if (!this.isChoosingUpgrade && this.kills >= this.nextUpgradeAtKills) {
          this.openQuickFix();
        }
        const completed = this.eventSystem.notifyKill(enemy.id);
        completed.forEach((event) => {
          showQuestToast({ title: `${event.id.toUpperCase()} complete`, dialogue: event.dialogue, rewardText: event.rewardText });
        });
        if (enemy.id === 'heal_bug') this.hp = Math.min(100, this.hp + 8);
        enemy.sprite.destroy();
      }
      return alive;
    });

    if (this.boss && this.boss.hp <= 0) {
      this.boss.sprite.destroy();
      this.boss = null;
      this.endRun(true);
    }
  }

  private updateEvents(dt: number): void {
    const triggered = this.eventSystem.update(this.elapsedSec, dt);
    triggered.forEach((event) => {
      if (event.id === 'boss') {
        this.spawnBoss();
      }
      showQuestToast({ title: event.title, dialogue: event.dialogue, rewardText: event.rewardText });
      this.eventLog.setText(`event: ${event.dialogue}\nreward: ${event.rewardText}`);
    });
  }

  private spawnBoss(): void {
    if (this.boss) return;
    const bossConfig = stages[0].boss;
    const sprite = this.add.circle(this.player.x + 320, this.player.y - 260, 34, bossConfig.color).setStrokeStyle(3, 0xffffff);
    this.boss = { hp: bossConfig.hp, maxHp: bossConfig.hp, sprite };
    showBossWarning(bossConfig);
    this.enemies.forEach((enemy) => enemy.sprite.destroy());
    this.enemies = [];
    this.cameras.main.shake(260, 0.008);
  }

  private updateHud(): void {
    const eventSummaries: RuntimeEventSummary[] = ['q1', 'e1', 'e2', 'boss']
      .map((id) => this.eventSystem.getState(id as EventId));
    const bossConfig = stages[0].boss;
    const selectedOwnedWeapon = this.weaponSystem.getOwned().find((weapon) => weapon.id === this.selectedWeapon);
    const selectedWeaponConfig = weapons[this.selectedWeapon];
    const view = buildRuntimeHudView({
      stageTitle: stages[0].title,
      hp: this.hp,
      maxHp: 100,
      kills: this.kills,
      nextUpgradeAtKills: this.nextUpgradeAtKills,
      elapsedSec: this.elapsedSec,
      weaponCodeName: selectedWeaponConfig.codeName,
      weaponLevel: selectedOwnedWeapon?.level,
      cooldownLeftMs: selectedOwnedWeapon?.cooldownLeftMs,
      cooldownMs: selectedWeaponConfig.cooldownMs,
      events: eventSummaries,
      boss: this.boss ? { name: bossConfig.name, hp: this.boss.hp, maxHp: this.boss.maxHp } : null,
    });

    this.hud.hpValue.setText(view.hp.value);
    this.setMeterRatio(this.hud.hpMeter, view.hp.ratio);
    this.hud.upgradeValue.setText(view.upgrade.value);
    this.setMeterRatio(this.hud.upgradeMeter, view.upgrade.ratio);
    this.hud.timer.setText(view.timerLabel);
    this.hud.stage.setText(view.stageLabel);
    this.hud.weaponName.setText(view.weapon.label);
    this.hud.weaponDetail.setText(view.weapon.detail);
    this.hud.eventLine.setText(view.eventLine);
    this.hud.bossLine.setText(view.boss ? `${view.boss.value} | ${view.boss.detail}` : 'boss pending | events live');
    this.setMeterRatio(this.hud.bossMeter, view.boss?.ratio ?? 0.12);
    this.hud.hint.setText(view.boss ? 'CRITICAL ERROR attached' : view.hintLine);
  }

  private setMeterRatio(meter: RuntimeHudMeter, ratio: number): void {
    meter.fill.width = Math.max(2, Math.round(meter.maxWidth * ratio));
  }

  private openQuickFix(): void {
    this.isChoosingUpgrade = true;
    showQuickFixOverlay({
      weapon: this.selectedWeapon,
      onSelect: (id) => this.applyQuickFix(id),
    });
  }

  private applyQuickFix(id: QuickFixId): void {
    if (id === 'cooldown') this.weaponSystem.levelUp(this.selectedWeapon);
    if (id === 'heal') this.hp = Math.min(100, this.hp + 25);
    this.nextUpgradeAtKills += 18;
    this.isChoosingUpgrade = false;
    clearRunDecisionOverlay();
  }

  private endRun(clear: boolean): void {
    this.isEnded = true;
    if (clear) {
      showStageClearOverlay({
        stageTitle: stages[0].title,
        elapsedSec: this.elapsedSec,
        kills: this.kills,
        unlockedText: 'reward weapon unlocked',
        onContinue: () => this.scene.start('MenuScene'),
        onCodex: () => showCodexOverlay({
          onClose: () => this.endRun(true),
        }),
        onMenu: () => this.scene.start('MenuScene'),
      });
      return;
    }

    showGameOverOverlay({
      stageTitle: stages[0].title,
      elapsedSec: this.elapsedSec,
      kills: this.kills,
      onRetry: () => this.scene.restart({ weapon: this.selectedWeapon }),
      onMenu: () => this.scene.start('MenuScene'),
    });
  }

  private drawWorldGrid(): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x111827, 1);
    for (let x = 0; x <= 2200; x += 80) {
      g.lineBetween(x, 0, x, 1600);
    }
    for (let y = 0; y <= 1600; y += 80) {
      g.lineBetween(0, y, 2200, y);
    }
    g.lineStyle(2, 0x2f3b52, 1);
    g.strokeRect(0, 0, 2200, 1600);
  }
}
