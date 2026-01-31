import type { Scene } from "../app/Scene";
import { exportData, importData, resetData } from "../state/appActions";

export class SettingsScene implements Scene {
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

        this.container.innerHTML = `
      <div class="scene settings-scene anim-fade-in">
        <h1 style="margin-bottom: 24px;">設定</h1>
        
        <!-- Data Management -->
        <h2 style="font-size: 1.1rem; margin-bottom: 12px; color: var(--color-text-muted);">データ管理</h2>
        <div class="glass-panel" style="padding: 20px; margin-bottom: 24px;">
            <p style="margin-bottom: 16px; font-size: 0.9rem;">
                機種変更やバックアップのために、現在のデータを保存・復元できます。
            </p>
            
            <button id="export-btn" style="width: 100%; border: 1px solid var(--color-primary); color: var(--color-primary); padding: 12px; border-radius: var(--radius-m); font-weight: 600; margin-bottom: 12px; background: rgba(59, 130, 246, 0.1);">
                データを保存 (エクスポート)
            </button>
            
            <button id="import-btn" style="width: 100%; border: 1px solid var(--color-text-muted); color: var(--color-text-main); padding: 12px; border-radius: var(--radius-m); font-weight: 600; background: rgba(255,255,255,0.05);">
                データを復元 (インポート)
            </button>
            <input type="file" id="import-file" style="display: none;" accept=".json">
        </div>

        <!-- Danger Zone -->
        <h2 style="font-size: 1.1rem; margin-bottom: 12px; color: #ef4444;">危険な設定</h2>
        <div class="glass-panel" style="padding: 20px; border-color: rgba(239, 68, 68, 0.3);">
            <button id="reset-btn" style="width: 100%; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                データを全消去 (リセット)
            </button>
        </div>

        <div style="margin-top: 40px; text-align: center; color: var(--color-text-muted); font-size: 0.8rem;">
            <p>LifeStatus v1.0.0</p>
        </div>
      </div>
    `;

        this.attachEvents();
    }

    private attachEvents() {
        if (!this.container) return;

        // Export
        const exportBtn = this.container.querySelector('#export-btn');
        exportBtn?.addEventListener('click', () => {
            const json = exportData();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `lifestatus_backup_${date}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Import
        const importBtn = this.container.querySelector('#import-btn');
        const fileInput = this.container.querySelector('#import-file') as HTMLInputElement;

        importBtn?.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput?.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                if (content) {
                    if (confirm("現在のデータが上書きされます。よろしいですか？")) {
                        const success = importData(content);
                        if (success) {
                            alert("復元しました。");
                            location.reload();
                        } else {
                            alert("データの読み込みに失敗しました。");
                        }
                    }
                }
            };
            reader.readAsText(file);
        });

        // Reset
        const resetBtn = this.container.querySelector('#reset-btn');
        resetBtn?.addEventListener('click', () => {
            if (confirm("【警告】すべてのデータが消え、初期状態に戻ります。\n本当によろしいですか？")) {
                resetData();
            }
        });
    }
}
