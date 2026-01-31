import type { Scene } from "../app/Scene";
import { store } from "../state/store";
import { BattleSystem } from "../domain/battleSystem";
import type { AppState, BattleState, Enemy } from "../domain/model";

export class BattleScene implements Scene {
    private container: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;

    mount(container: HTMLElement): void {
        this.container = container;

        // Initialize Battle if not active
        const state = store.getState();
        if (!state.currentBattle || !state.currentBattle.isActive) {
            this.startNewBattle(state);
        }

        this.unsubscribe = store.subscribe((s) => this.render(s));
        this.render(store.getState());
    }

    unmount(): void {
        if (this.unsubscribe) this.unsubscribe();
        if (this.container) this.container.innerHTML = "";
    }

    private startNewBattle(state: AppState) {
        // Generate enemy based on player level
        // A bit harder than current level to challenge
        const enemyLevel = Math.max(1, state.character.level);
        const enemy = BattleSystem.generateEnemy(enemyLevel);

        const pStats = BattleSystem.getPlayerStats(state.character);

        const initialBattle: BattleState = {
            isActive: true,
            turn: 1,
            enemy: enemy,
            playerHp: pStats.maxHp,
            playerMaxHp: pStats.maxHp,
            logs: [`野生の ${enemy.name} があらわれた！`],
            result: null
        };

        store.setState({ currentBattle: initialBattle });
    }

    private render(state: AppState) {
        if (!this.container) return;
        const battle = state.currentBattle;
        if (!battle) return;

        const char = state.character;
        const pStats = BattleSystem.getPlayerStats(char);

        // Template
        this.container.innerHTML = `
      <div class="scene battle-scene anim-fade-in" style="padding-bottom: 80px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button id="back-home-btn" style="background: transparent; border: 1px solid var(--glass-border); padding: 8px 16px; border-radius: 20px; color: var(--color-text-muted);">
            ← 逃げる
          </button>
          <div style="font-weight: 800; color: var(--color-accent);">BATTLE MODE</div>
        </div>

        <!-- Enemy Area -->
        <div class="pulse-anim" style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 80px; margin-bottom: 10px;">${battle.enemy.image}</div>
          <h2 style="margin-bottom: 5px;">${battle.enemy.name}</h2>
          
          <!-- Enemy HP Bar -->
          <div style="width: 200px; height: 10px; background: rgba(0,0,0,0.3); margin: 0 auto; border-radius: 5px; overflow: hidden; position: relative;">
            <div style="width: ${(battle.enemy.hp / battle.enemy.maxHp) * 100}%; background: var(--color-accent); height: 100%; transition: width 0.3s ease;"></div>
          </div>
          <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 5px;">HP: ${battle.enemy.hp} / ${battle.enemy.maxHp}</p>
        </div>

        <!-- Log Area -->
        <div id="battle-log" class="glass-panel" style="height: 150px; overflow-y: auto; padding: 15px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid var(--glass-border); display: flex; flex-direction: column-reverse;">
           ${battle.logs.map(log => `<div style="margin-bottom: 4px;">${log}</div>`).join('')}
        </div>

        <!-- Player Status -->
        <div class="glass-panel" style="padding: 15px; margin-bottom: 20px; border-left: 4px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: bold;">YOU (Lv.${char.level})</span>
                <span>HP: <span style="color: ${battle.playerHp < battle.playerMaxHp * 0.3 ? 'var(--color-accent)' : 'var(--color-success)'};">${battle.playerHp}</span> / ${battle.playerMaxHp}</span>
            </div>
             <!-- Player HP Bar -->
            <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
                <div style="width: ${(battle.playerHp / battle.playerMaxHp) * 100}%; background: var(--color-primary); height: 100%; transition: width 0.3s ease;"></div>
            </div>
        </div>

        <!-- Controls -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
           ${!battle.result ? `
             <button id="atk-btn" class="battle-btn" style="background: linear-gradient(135deg, var(--color-primary), #4f46e5); color: white; padding: 15px; border-radius: 12px; font-weight: bold; border: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                ⚔️ 攻撃 (ATK: ${pStats.attack})
             </button>
             <button id="heal-btn" class="battle-btn" style="background: rgba(255,255,255,0.1); color: var(--color-text-main); padding: 15px; border-radius: 12px; font-weight: bold; border: 1px solid var(--glass-border);">
                💊 回復
             </button>
           ` : `
             <button id="next-battle-btn" style="grid-column: span 2; background: var(--color-success); color: white; padding: 15px; border-radius: 12px; font-weight: bold;">
                ${battle.result === 'win' ? '次の戦いへ' : '再挑戦'}
             </button>
           `}
        </div>

      </div>
    `;

        // Events
        this.container.querySelector('#back-home-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }));
        });

        if (!battle.result) {
            this.container.querySelector('#atk-btn')?.addEventListener('click', () => this.handleAttack());
            this.container.querySelector('#heal-btn')?.addEventListener('click', () => this.handleHeal());
        } else {
            this.container.querySelector('#next-battle-btn')?.addEventListener('click', () => {
                if (battle.result === 'win') {
                    // Next fight immediately for arcade feel
                    this.startNewBattle(store.getState());
                } else {
                    // Restart
                    this.startNewBattle(store.getState());
                }
            });
        }
    }

    private handleAttack() {
        const state = store.getState();
        const battle = state.currentBattle;
        if (!battle || battle.result) return;

        const char = state.character;
        const pStats = BattleSystem.getPlayerStats(char);
        const newLogs = [...battle.logs];

        // 1. Player Attack
        const pResult = BattleSystem.playerAttack(pStats, battle.enemy);
        newLogs.unshift(pResult.log); // Add to top

        let newEnemyHp = battle.enemy.hp - pResult.damage;
        let newResult = battle.result;
        let newPlayerHp = battle.playerHp;

        if (newEnemyHp <= 0) {
            newEnemyHp = 0;
            newResult = 'win';
            newLogs.unshift(`🏆 勝利！ ${battle.enemy.name} を倒した！`);
            newLogs.unshift(`経験値 ${battle.enemy.expReward} を獲得！`);

            // Apply Rewards
            const newExp = char.exp + battle.enemy.expReward;
            const newLevel = Math.floor(newExp / 100) + 1;

            // Update character stats directly in store
            // Note: For cleaner architecture, should be in appActions, but simplifying here for step
            store.setState({
                character: {
                    ...char,
                    exp: newExp,
                    level: newLevel,
                    lastUpdatedAt: Date.now()
                }
            });

        } else {
            // 2. Enemy Turn (only if alive)
            // Delay slightly for effect? For now instant for responsiveness
            const eResult = BattleSystem.enemyAttack(battle.enemy, pStats);
            newLogs.unshift(eResult.log);
            newPlayerHp -= eResult.damage;

            if (newPlayerHp <= 0) {
                newPlayerHp = 0;
                newResult = 'lose';
                newLogs.unshift(`💀 敗北... ${battle.enemy.name} に負けてしまった...`);
            }
        }

        // Update State
        store.setState({
            currentBattle: {
                ...battle,
                enemy: { ...battle.enemy, hp: newEnemyHp },
                playerHp: newPlayerHp,
                logs: newLogs,
                result: newResult
            }
        });
    }

    private handleHeal() {
        // Simple heal mechanic: Heal 30% of max HP, but take damage
        const state = store.getState();
        const battle = state.currentBattle;
        if (!battle || battle.result) return;

        const newLogs = [...battle.logs];
        const healAmount = Math.floor(battle.playerMaxHp * 0.3);
        let newPlayerHp = Math.min(battle.playerMaxHp, battle.playerHp + healAmount);

        newLogs.unshift(`あなたは回復薬を使った！ HPが${healAmount}回復！`);

        // Enemy still attacks
        const char = state.character;
        const pStats = BattleSystem.getPlayerStats(char);
        const eResult = BattleSystem.enemyAttack(battle.enemy, pStats);

        newLogs.unshift(eResult.log);
        newPlayerHp -= eResult.damage;

        let newResult = battle.result;
        if (newPlayerHp <= 0) {
            newPlayerHp = 0;
            newResult = 'lose';
            newLogs.unshift(`💀 敗北... 回復中にやられてしまった...`);
        }

        store.setState({
            currentBattle: {
                ...battle,
                playerHp: newPlayerHp,
                logs: newLogs,
                result: newResult
            }
        });
    }
}
