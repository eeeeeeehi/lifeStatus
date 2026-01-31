import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import type { AppState, DailyActionLog } from "../domain/model";
import { getTodayISODate } from "../state/appActions";

export class LogScene implements Scene {
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  mount(container: HTMLElement): void {
    this.container = container;

    this.unsubscribe = store.subscribe((state) => {
      this.render(state);
    });

    this.render(store.getState());
  }

  unmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  private render(state: AppState) {
    if (!this.container) return;

    // Calculate Streak
    const streak = this.calculateStreak(state.logs);

    // Weekly Summary Logic
    const thisWeekLogs = this.getThisWeekLogs(state.logs);
    const weeklyTotal = thisWeekLogs.length;

    this.container.innerHTML = `
      <div class="scene log-scene anim-fade-in">
        <h1 style="margin-bottom: 24px;">冒険の記録</h1>
        
        <div class="glass-panel" style="padding: 32px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden;">
             <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%); pointer-events: none;"></div>
          <h2 class="text-gradient" style="font-size: 3.5rem; font-weight: 800; line-height: 1; margin-bottom: 8px; letter-spacing: -2px;">${streak}</h2>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;">Days Streak</p>
          <p style="font-size: 0.8rem; margin-top: 8px; color: var(--color-success); font-weight: bold;">✨ 継続は力なり！</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px;">
             <div class="glass-panel" style="padding: 16px; text-align: center;">
                <p style="font-size: 0.8rem; color: var(--color-text-muted);">今週の達成</p>
                <p style="font-size: 1.5rem; font-weight: 700;">${weeklyTotal}</p>
             </div>
             <div class="glass-panel" style="padding: 16px; text-align: center;">
                <p style="font-size: 0.8rem; color: var(--color-text-muted);">総レベル</p>
                <p style="font-size: 1.5rem; font-weight: 700;">${state.character.level}</p>
             </div>
        </div>

        <h3 style="margin-bottom: 16px; font-size: 1.1rem;">最近の活動</h3>
        <div class="log-list" style="padding-bottom: 40px;">
          ${this.renderRecentLogs(state.logs)}
        </div>
      </div>
    `;
  }

  private getThisWeekLogs(logs: DailyActionLog[]): DailyActionLog[] {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    return logs.filter(l => l.done && new Date(l.date) >= oneWeekAgo);
  }

  private calculateStreak(logs: DailyActionLog[]): number {
    const doneDates = Array.from(new Set(
      logs.filter(l => l.done).map(l => l.date)
    )).sort();

    if (doneDates.length === 0) return 0;

    let streak = 0;
    const today = getTodayISODate();
    const d = new Date(today);

    if (doneDates.includes(today)) {
      streak++;
    }

    while (true) {
      d.setDate(d.getDate() - 1);
      const iso = d.toISOString().split('T')[0];
      if (doneDates.includes(iso)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private renderRecentLogs(logs: DailyActionLog[]): string {
    const grouped: Record<string, DailyActionLog[]> = {};
    logs.forEach(l => {
      if (!grouped[l.date]) grouped[l.date] = [];
      grouped[l.date].push(l);
    });

    const dates = Object.keys(grouped).sort().reverse().slice(0, 7);

    if (dates.length === 0) {
      return `<p style="color: var(--color-text-muted); text-align: center; padding: 20px;">まだ記録がありません。</p>`;
    }

    return dates.map(date => {
      const dayLogs = grouped[date];
      const doneCount = dayLogs.filter(l => l.done).length;
      return `
        <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 500; font-family: monospace; font-size: 1.1rem;">${date}</span>
          <span style="color: var(--color-success); font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: 20px;">${doneCount} クエスト達成</span>
        </div>
      `;
    }).join('');
  }
}
