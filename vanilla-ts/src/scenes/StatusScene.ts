import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import type { AppState, StatsKey } from "../domain/model";
import { RadarChartRenderer } from "../ui/charts/RadarChartRenderer";

export class StatusScene implements Scene {
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: RadarChartRenderer | null = null;
  private unsubscribe: (() => void) | null = null;

  mount(container: HTMLElement): void {
    this.container = container;

    // Initial Render Structure
    this.container.innerHTML = `
      <div class="scene status-scene anim-fade-in">
        <h1 style="margin-bottom: 24px;">ステータス</h1>
        
        <div class="glass-panel" style="padding: 32px 24px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden;">
          <!-- BG Glow -->
          <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%); pointer-events: none;"></div>

          <!-- Character Icon -->
          <div style="margin: 0 auto 20px; position: relative;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); opacity: 0.5; filter: blur(8px);"></div>
            <img src="/character.png" alt="Character" style="
              width: 110px; height: 110px; 
              border-radius: 50%; 
              position: relative;
              object-fit: cover;
              border: 3px solid rgba(255,255,255,0.1);
              z-index: 1;
            ">
          </div>
          
          <h2 id="level-display" class="text-gradient" style="font-size: 2.5rem; margin-bottom: 4px; line-height: 1.2;">Lv.1</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 16px; letter-spacing: 0.05em; font-size: 0.9rem;">ADVENTURER</p>

          <!-- EXP Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 6px;">
            <span>EXP</span>
            <span id="exp-text">0 / 100</span>
          </div>
          <div style="position: relative; height: 8px; background: rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden;">
            <div id="exp-bar" style="height: 100%; width: 0%; background: var(--color-success); border-radius: 4px; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);"></div>
          </div>
        </div>

        <!-- Radar Chart Container -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: center; align-items: center; flex-direction: column; margin-bottom: 20px;">
          <h3 style="margin-bottom: 20px; align-self: flex-start; font-size: 1.1rem;">能力パラメータ</h3>
          <canvas id="radar-canvas" width="320" height="320"></canvas>
        </div>
        
        <!-- Stats List -->
        <div id="stats-list" style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        </div>

      </div>
    `;

    // Setup Canvas
    this.canvas = this.container.querySelector('#radar-canvas');
    if (this.canvas) {
      const statsKeys: StatsKey[] = ["action", "consistency", "focus", "planning", "selfControl", "learning", "social"];
      this.renderer = new RadarChartRenderer(this.canvas, statsKeys);
    }

    // Subscribe
    this.unsubscribe = store.subscribe((state) => {
      this.renderState(state);
    });

    // Initial Update
    this.renderState(store.getState());
  }

  unmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  private renderState(state: AppState) {
    if (!this.container) return;

    // Update Level/EXP
    const levelEl = this.container.querySelector('#level-display');
    const expBar = this.container.querySelector('#exp-bar') as HTMLElement;
    const expText = this.container.querySelector('#exp-text');

    if (levelEl) levelEl.textContent = `Lv.${state.character.level}`;

    const currentLevelExp = state.character.exp % 100;
    if (expBar) expBar.style.width = `${currentLevelExp}%`;
    if (expText) expText.textContent = `${currentLevelExp} / 100`;

    // Update Chart
    if (this.renderer) {
      this.renderer.draw(state.character.stats);
    }

    // Update List
    const list = this.container.querySelector('#stats-list');

    // Japanese mappings
    const labelMap: Record<string, string> = {
      action: "行動力",
      consistency: "継続力",
      focus: "集中力",
      planning: "計画力",
      selfControl: "自制心",
      learning: "学習力",
      social: "社交性"
    };

    if (list) {
      list.innerHTML = Object.entries(state.character.stats).map(([k, v]) => `
            <div class="glass-panel" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--color-text-muted); font-size: 0.9rem;">${labelMap[k] || k}</span>
                <span style="font-weight: 700; color: var(--color-text-main);">${v}</span>
            </div>
        `).join('');
    }
  }
}
