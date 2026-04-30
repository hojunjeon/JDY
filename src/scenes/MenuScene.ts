import Phaser from 'phaser';
import { starterWeaponConfigs } from '../data/gameData';
import { clearCodexOverlay, showCodexOverlay } from '../ui/codexOverlay';
import { createMenuFlowState, reduceMenuFlow, type MenuFlowEvent, type MenuFlowState } from '../ui/menuFlow';
import { mountMenuOverlay, type MenuOverlayController } from '../ui/menuOverlay';
import { uiColors } from '../ui/theme';

export class MenuScene extends Phaser.Scene {
  private flow: MenuFlowState = createMenuFlowState();
  private overlay: MenuOverlayController | null = null;
  private lastHandledEnterTimeStamp = -1;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.flow = createMenuFlowState();
    this.cameras.main.setBackgroundColor(uiColors.bg);
    this.overlay = mountMenuOverlay({
      state: this.flow,
      dispatch: (event) => this.dispatch(event),
      openCodex: () => showCodexOverlay({ onClose: () => this.render() }),
    });
    this.registerKeyboard();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyOverlay());
  }

  private render(): void {
    this.overlay?.update(this.flow);
  }

  private registerKeyboard(): void {
    this.input.keyboard?.on('keydown-ENTER', this.handleEnter, this);
    this.input.keyboard?.on('keydown-ESC', this.handleBack, this);
    this.input.keyboard?.on('keydown-ONE', () => this.handleNumber(1));
    this.input.keyboard?.on('keydown-TWO', () => this.handleNumber(2));
    this.input.keyboard?.on('keydown-THREE', () => this.handleNumber(3));
    this.input.keyboard?.on('keydown-FOUR', () => this.handleNumber(4));
    this.input.keyboard?.on('keydown-FIVE', () => this.handleNumber(5));
    this.input.keyboard?.on('keydown-SIX', () => this.handleNumber(6));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ENTER', this.handleEnter, this);
      this.input.keyboard?.off('keydown-ESC', this.handleBack, this);
      this.input.keyboard?.off('keydown-ONE');
      this.input.keyboard?.off('keydown-TWO');
      this.input.keyboard?.off('keydown-THREE');
      this.input.keyboard?.off('keydown-FOUR');
      this.input.keyboard?.off('keydown-FIVE');
      this.input.keyboard?.off('keydown-SIX');
    });
  }

  private handleEnter(event: KeyboardEvent): void {
    if (event.timeStamp === this.lastHandledEnterTimeStamp) return;
    this.lastHandledEnterTimeStamp = event.timeStamp;

    if (this.flow.screen === 'start') {
      this.dispatch({ type: 'start.confirm' });
      return;
    }
    if (this.flow.screen === 'stage-select') {
      this.dispatch({ type: 'stage.confirm' });
      return;
    }
    if (this.flow.screen === 'weapon-select') {
      this.dispatch({ type: 'weapon.confirm' });
    }
  }

  private handleBack(): void {
    this.dispatch({ type: 'back' });
  }

  private handleNumber(value: number): void {
    if (this.flow.screen === 'stage-select') {
      this.dispatch({ type: 'stage.select', stageId: value });
      return;
    }
    if (this.flow.screen === 'weapon-select') {
      const weapon = starterWeaponConfigs[value - 1];
      if (weapon) this.dispatch({ type: 'weapon.select', weapon: weapon.id });
    }
  }

  private dispatch(event: MenuFlowEvent): void {
    this.flow = reduceMenuFlow(this.flow, event);
    if (this.flow.screen === 'game-start') {
      this.startGame();
      return;
    }
    this.render();
  }

  private startGame(): void {
    this.destroyOverlay();
    this.scene.start('GameScene', { stageId: this.flow.selectedStageId, weapon: this.flow.selectedWeapon });
  }

  private destroyOverlay(): void {
    clearCodexOverlay();
    this.overlay?.destroy();
    this.overlay = null;
  }
}
