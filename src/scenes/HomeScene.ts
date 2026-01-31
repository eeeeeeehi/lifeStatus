import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import { setGoal, addAction, toggleAction, getTodayISODate, updateCharacterStats } from "../state/appActions";
import type { AppState, StatsKey } from "../domain/model";

export class HomeScene implements Scene {
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;
  private isMatchingDone = false; // Memory flag for aptitude test

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

    // 1. Goal Setting
    if (!state.goal) {
      this.renderGoalSetup();
      return;
    }

    // 2. Aptitude Test (Only if actions not set and test not done)
    if (state.actions.length === 0 && !this.isMatchingDone) {
      this.renderAptitudeTest();
      return;
    }

    // 3. Action Setting
    if (state.actions.length === 0) {
      this.renderActionSetup(state);
      return;
    }

    // 4. Daily Dashboard
    this.renderDailyView(state);
  }

  // Helper to attach RPG buttons events
  private attachRpgButtons() {
    this.container!.querySelector('#go-battle-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'battle' }));
    });
    this.container!.querySelector('#go-ranking-btn')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'ranking' }));
    });
  }

  // --- 1. Goal Setup ---
  private renderGoalSetup() {
    this.container!.innerHTML = `
      <div class="scene home-scene anim-fade-in">
        <h1 class="text-gradient">ようこそ、冒険者へ</h1>
        <p style="margin-bottom: 24px; line-height: 1.8; font-size: 0.95rem;">
          LifeStatusは、あなたの日常を「RPG」に変えるアプリです。<br>
          まずは、あなたが目指す<strong>「冒険の目的（ゴール）」</strong>を教えてください。
        </p>

        <!-- Mode Buttons for Quick Access -->
        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <button id="go-battle-btn" style="flex: 2; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 700; border: none; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>⚔️</span> 冒険に出る (お試し)
            </button>
            <button id="go-ranking-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--color-text-main); padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                🏆 順位
            </button>
        </div>
        
        <div class="glass-panel" style="padding: 24px;">
          <label style="display:block; margin-bottom: 8px; font-size: 0.85rem; color: var(--color-text-muted);">メインクエスト（目標）</label>
          <input type="text" id="goal-input" placeholder="例：最強のエンジニアになる" style="margin-bottom: 20px;">
          <button id="set-goal-btn" style="width: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: white; padding: 14px; border-radius: var(--radius-m); font-weight: 700; box-shadow: 0 4px 15px var(--color-primary-glow);">
            冒険を始める
          </button>
        </div>
      </div>
    `;

    this.attachRpgButtons();

    const btn = this.container!.querySelector('#set-goal-btn');
    const input = this.container!.querySelector('#goal-input') as HTMLInputElement;

    const doSet = () => {
      if (input.value.trim()) {
        setGoal(input.value.trim());
      }
    };

    btn?.addEventListener('click', doSet);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSet();
    });
  }

  // --- 2. Aptitude Test (New!) ---
  private renderAptitudeTest() {
    this.container!.innerHTML = `
        <div class="scene home-scene anim-fade-in">
            <h1 style="margin-bottom: 12px;">冒険者の適性検査</h1>
            <p style="color: var(--color-text-muted); margin-bottom: 24px; font-size: 0.9rem;">
                あなたの能力（初期ステータス）を診断します。<br>
                以下の質問に答えてください。
            </p>

             <!-- Mode Buttons -->
            <div style="display: flex; gap: 10px; margin-bottom: 24px;">
                <button id="go-battle-btn" style="flex: 2; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 700; border: none; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>⚔️</span> 冒険に出る (お試し)
                </button>
                <button id="go-ranking-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--color-text-main); padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                    🏆 順位
                </button>
            </div>

            <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 12px; font-weight: 600;">Q1. あなたの強みは？</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
                    <button class="choice-btn" data-type="action" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">とりあえず行動</button>
                    <button class="choice-btn" data-type="planning" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">計画重視</button>
                    <button class="choice-btn" data-type="persistence" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">コツコツ継続</button>
                </div>

                <label style="display: block; margin-bottom: 12px; font-weight: 600;">Q2. 困難に直面したら？</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
                    <button class="choice-btn" data-type="focus" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">集中して突破</button>
                    <button class="choice-btn" data-type="social" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">仲間に相談</button>
                    <button class="choice-btn" data-type="learning" style="flex: 1; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(255,255,255,0.05);">本で調べる</button>
                </div>

                <label style="display: block; margin-bottom: 12px; font-weight: 600;">Q3. 保有資格・スキル</label>
                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 8px;">カンマ区切りで入力 (例: 英検, ITパスポート, 筋トレ)</p>
                <input type="text" id="qualification-input" placeholder="スキルや資格を入力..." style="margin-bottom: 8px;">
            </div>

            <button id="finish-test-btn" style="width: 100%; background: var(--color-success); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                診断を完了する
            </button>
        </div>
      `;

    this.attachRpgButtons();

    // Simple selection logic
    const choiceBtns = this.container!.querySelectorAll('.choice-btn');
    const bonus: Partial<Record<StatsKey, number>> = {};

    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle visual selection in row
        const parent = btn.parentElement;
        parent?.querySelectorAll('.choice-btn').forEach(b => {
          (b as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          (b as HTMLElement).style.borderColor = 'var(--glass-border)';
          b.classList.remove('selected');
        });

        (btn as HTMLElement).style.background = 'var(--color-primary)';
        (btn as HTMLElement).classList.add('selected');
      });
    });

    const finishBtn = this.container!.querySelector('#finish-test-btn');
    const qInput = this.container!.querySelector('#qualification-input') as HTMLInputElement;

    finishBtn?.addEventListener('click', () => {
      // 1. Collect from buttons
      const selected = this.container!.querySelectorAll('.choice-btn.selected');
      selected.forEach(el => {
        const type = (el as HTMLElement).dataset.type;
        if (type === 'action') bonus.action = (bonus.action || 0) + 5;
        if (type === 'planning') bonus.planning = (bonus.planning || 0) + 5;
        if (type === 'persistence') bonus.consistency = (bonus.consistency || 0) + 5;
        if (type === 'focus') bonus.focus = (bonus.focus || 0) + 5;
        if (type === 'social') bonus.social = (bonus.social || 0) + 5;
        if (type === 'learning') bonus.learning = (bonus.learning || 0) + 5;
      });

      // 2. Collect from Text (Qualifications)
      const text = qInput.value;
      if (text) {
        const keywords = text.toLowerCase().split(/[,、\s]+/);
        keywords.forEach(w => {
          if (!w) return;
          // Simple Keyword Matcher
          if (w.includes('英') || w.includes('語') || w.includes('toeic')) {
            bonus.learning = (bonus.learning || 0) + 3;
            bonus.social = (bonus.social || 0) + 2;
          }
          if (w.includes('it') || w.includes('基本') || w.includes('情報') || w.includes('プログラム') || w.includes('コード')) {
            bonus.learning = (bonus.learning || 0) + 3;
            bonus.planning = (bonus.planning || 0) + 2;
          }
          if (w.includes('簿記') || w.includes('会計') || w.includes('fp')) {
            bonus.planning = (bonus.planning || 0) + 3;
            bonus.consistency = (bonus.consistency || 0) + 2;
          }
          if (w.includes('筋トレ') || w.includes('スポーツ') || w.includes('体')) {
            bonus.action = (bonus.action || 0) + 4;
            bonus.selfControl = (bonus.selfControl || 0) + 1;
          }
          if (w.includes('デザイン') || w.includes('絵') || w.includes('書')) {
            bonus.focus = (bonus.focus || 0) + 3;
          }
          // Default small bonus for inputting something
          bonus.action = (bonus.action || 0) + 1;
        });
      }

      // Apply stats
      updateCharacterStats(bonus);

      // Complete
      this.isMatchingDone = true;
      this.render(store.getState());
    });
  }


  // --- 3. Action Setup ---
  private renderActionSetup(state: AppState) {
    this.container!.innerHTML = `
      <div class="scene home-scene anim-fade-in">
        <h1>クエストボード作成</h1>
        <p style="margin-bottom: 24px; line-height: 1.8; font-size: 0.95rem;">
          <strong>"${state.goal?.title}"</strong> を達成するために、<br>
          毎日こなす行動（デイリークエスト）を3つまで決めましょう。
        </p>

        <!-- Mode Buttons -->
        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <button id="go-battle-btn" style="flex: 2; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 700; border: none; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>⚔️</span> 冒険に出る (お試し)
            </button>
            <button id="go-ranking-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--color-text-main); padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                🏆 順位
            </button>
        </div>
        
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

    this.attachRpgButtons();

    const btn = this.container!.querySelector('#add-action-btn');
    const input = this.container!.querySelector('#action-input') as HTMLInputElement;

    const doAdd = () => {
      if (input.value.trim()) {
        addAction(input.value.trim());
      }
    };

    btn?.addEventListener('click', doAdd);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doAdd();
    });
  }

  // --- 4. Daily View ---
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

        <!-- New: Mode Buttons -->
        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <button id="go-battle-btn" style="flex: 2; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; padding: 12px; border-radius: var(--radius-m); font-weight: 700; border: none; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>⚔️</span> 冒険に出る
            </button>
            <button id="go-ranking-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--color-text-main); padding: 12px; border-radius: var(--radius-m); font-weight: 600;">
                🏆 順位
            </button>
        </div>
        
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

    this.attachRpgButtons();

    // Attach events for actions
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
