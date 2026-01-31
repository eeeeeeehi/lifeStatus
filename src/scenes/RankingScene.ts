import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import type { RankingEntry } from "../domain/model";

// Mock Data for now
const MOCK_RANKING: RankingEntry[] = [
    { userId: '1', userName: '勇者ヒロト', level: 45, score: 15400 },
    { userId: '2', userName: 'タスクマスター', level: 32, score: 9800 },
    { userId: '3', userName: '三日坊主', level: 5, score: 400 },
];

export class RankingScene implements Scene {
    private container: HTMLElement | null = null;

    mount(container: HTMLElement): void {
        this.container = container;
        this.render();
    }

    unmount(): void {
        if (this.container) {
            this.container.innerHTML = "";
        }
    }

    private render() {
        if (!this.container) return;

        const state = store.getState();
        const myScore = state.character.exp; // Simple score for now

        this.container.innerHTML = `
            <div class="scene ranking-scene anim-fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <button id="back-home-btn" style="background: transparent; border: none; font-size: 1.5rem; color: var(--color-text-main); margin-right: 16px; cursor: pointer;">
                        ←
                    </button>
                    <h1>冒険者ランキング (Online)</h1>
                </div>

                <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
                     <div style="text-align: center; margin-bottom: 20px;">
                        <p style="color: var(--color-text-muted); font-size: 0.9rem;">あなたの現在の順位</p>
                        <div style="font-size: 2rem; font-weight: 800; color: var(--color-primary);">圏外</div>
                        <p>Lv.${state.character.level} / Score: ${myScore}</p>
                     </div>
                     <p style="text-align: center; font-size: 0.8rem; color: var(--color-text-muted);">
                        ※ オンライン機能は現在準備中です。以下は開発中のイメージです。
                     </p>
                </div>

                <div class="ranking-list">
                    ${MOCK_RANKING.map((entry, index) => `
                        <div class="glass-panel" style="padding: 16px; margin-bottom: 8px; display: flex; align-items: center; border-left: 4px solid ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'transparent'};">
                            <div style="width: 40px; font-weight: bold; font-size: 1.2rem; color: var(--color-text-muted);">#${index + 1}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${entry.userName}</div>
                                <div style="font-size: 0.8rem; color: var(--color-text-muted);">Lv.${entry.level}</div>
                            </div>
                            <div style="font-weight: bold; font-family: monospace; font-size: 1.1rem;">${entry.score.toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.querySelector('#back-home-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });
    }
}
