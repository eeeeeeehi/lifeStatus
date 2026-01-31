import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import { setGoal, addAction, toggleAction, getTodayISODate } from "../state/appActions";
import type { AppState } from "../domain/model";

export class HomeScene implements Scene {
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  mount(container: HTMLElement): void {
    this.container = container;

    // Subscribe to store updates
    this.unsubscribe = store.subscribe((state) => {
      this.render(state);
    });

    // Initial Render
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

    // View Routing within Home
    if (!state.goal) {
      this.renderGoalSetup();
      return;
    }

    if (state.actions.length === 0) {
      this.renderActionSetup(state);
      return;
    }

    this.renderDailyView(state);
  }

  private renderGoalSetup() {
    this.container!.innerHTML = `
      <div class="scene home-scene anim-fade-in">
        <h1 class="text-gradient">ようこそ、冒険者へ</h1>
        <p style="margin-bottom: 24px; line-height: 1.8; font-size: 0.95rem;">
          LifeStatusは、あなたの日常を「RPG」に変えるアプリです。<br>
          まずは、あなたが目指す<strong>「冒険の目的（ゴール）」</strong>を教えてください。
        </p>
        
        <div class="glass-panel" style="padding: 24px;">
          <label style="display:block; margin-bottom: 8px; font-size: 0.85rem; color: var(--color-text-muted);">メインクエスト（目標）</label>
          <input type="text" id="goal-input" placeholder="例：最強のエンジニアになる" style="margin-bottom: 20px;">
          <button id="set-goal-btn" style="width: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: white; padding: 14px; border-radius: var(--radius-m); font-weight: 700; box-shadow: 0 4px 15px var(--color-primary-glow);">
            冒険を始める
          </button>
        </div>
      </div>
    `;

    const btn = this.container!.querySelector('#set-goal-btn');
    const input = this.container!.querySelector('#goal-input') as HTMLInputElement;

    btn?.addEventListener('click', () => {
      if (input.value.trim()) {
        setGoal(input.value.trim());
      }
    });
  }

  private renderActionSetup(state: AppState) {
    this.container!.innerHTML = `
      <div class="scene home-scene anim-fade-in">
        <h1>クエストボード作成</h1>
        <p style="margin-bottom: 24px; line-height: 1.8; font-size: 0.95rem;">
          <strong>"${state.goal?.title}"</strong> を達成するために、<br>
          毎日こなす行動（デイリークエスト）を3つまで決めましょう。
        </p>
        
        <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
          <label style="display:block; margin-bottom: 8px; font-size: 0.85rem; color: var(--color-text-muted);">新しいクエスト</label>
          <input type="text" id="action-input" placeholder="例：コードを30分書く" style="margin-bottom: 16px;">
          <button id="add-action-btn" style="width: 100%; background: var(--color-primary); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
            追加する
          </button>
        </div>

        <div>
           ${state.actions.length > 0 ? '<p style="margin-bottom:10px; font-size: 0.9rem;">作成済みクエスト:</p>' : ''}
           <ul style="list-style: none; padding: 0;">
             ${state.actions.map(a => `
               <li class="glass-panel" style="padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; border-radius: var(--radius-m);">
                 <span style="color: var(--color-primary); margin-right: 10px;">◆</span>
                 ${a.title}
               </li>
             `).join('')}
           </ul>
        </div>
      </div>
    `;

    const btn = this.container!.querySelector('#add-action-btn');
    const input = this.container!.querySelector('#action-input') as HTMLInputElement;

    btn?.addEventListener('click', () => {
      if (input.value.trim()) {
        addAction(input.value.trim());
        // Input clears on re-render
      }
    });
  }

  private renderDailyView(state: AppState) {
    const today = getTodayISODate();
    const actions = state.actions;
    const completedCount = actions.filter(a => state.logs.some(l => l.actionId === a.id && l.date === today && l.done)).length;
    const total = actions.length;

    this.container!.innerHTML = `
      <div class="scene home-scene anim-fade-in">
        <h1 style="margin-bottom: 8px;">今日のクエスト</h1>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 24px; display: flex; align-items: center;">
          <span style="opacity: 0.7; margin-right:8px;">目標:</span> 
          <span style="color: var(--color-text-main); font-weight: 500;">${state.goal?.title}</span>
        </p>
        
        <div class="glass-panel" style="padding: 20px; margin-bottom: 32px; position: relative; overflow: hidden;">
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent); pointer-events: none;"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-weight: 600; font-size: 0.9rem;">進捗状況</span>
            <span class="text-gradient" style="font-weight: 800; font-size: 1.2rem;">${completedCount} / ${total}</span>
          </div>
          <!-- Progress Bar -->
          <div style="height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${(completedCount / total) * 100}%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 0 10px var(--color-primary-glow);"></div>
          </div>
        </div>

        <div class="action-list">
          ${actions.map(action => {
      const isDone = state.logs.some(l => l.actionId === action.id && l.date === today && l.done);
      return `
              <div class="action-item glass-panel" style="
                  display: flex; align-items: center; padding: 18px; margin-bottom: 16px; cursor: pointer; 
                  transition: all 0.2s ease;
                  border: 1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)'};
                  background: ${isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass-bg)'};
                " data-id="${action.id}">
                
                <div class="checkbox" style="
                  width: 28px; height: 28px; border-radius: 50%; 
                  border: 2px solid ${isDone ? 'var(--color-success)' : 'var(--color-text-muted)'}; 
                  margin-right: 16px;
                  display: flex; align-items: center; justify-content: center;
                  background: ${isDone ? 'var(--color-success)' : 'transparent'};
                  transition: all 0.3s ease;
                  box-shadow: ${isDone ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'};
                ">
                  ${isDone ? '<span style="color: white; font-weight: bold; font-size: 14px;">✓</span>' : ''}
                </div>
                
                <div style="flex: 1;">
                  <span style="
                    display: block;
                    font-weight: 500;
                    text-decoration: ${isDone ? 'none' : 'none'}; 
                    opacity: ${isDone ? '0.6' : '1'};
                    color: ${isDone ? 'var(--color-success)' : 'var(--color-text-main)'};
                    transition: color 0.3s;
                  ">${action.title}</span>
                </div>

                ${isDone ? '<span style="font-size: 0.8rem; color: var(--color-success); font-weight: bold;">COMPLETE</span>' : ''}
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;

    // Attach events
    const items = this.container!.querySelectorAll('.action-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = (item as HTMLElement).dataset.id;
        if (id) {
          toggleAction(id, today);
          // Toast Logic can go here
        }
      });
    });
  }
}
