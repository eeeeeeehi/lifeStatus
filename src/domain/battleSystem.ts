import type { CharacterState, Enemy } from "./model";

// --- Parameters ---
// ステータスから戦闘パラメータへの変換係数
const HP_PER_CONSISTENCY = 10;
const BASE_HP = 50;
const ATK_PER_ACTION = 2;
const BASE_ATK = 5;
const DEF_PER_PLANNING = 1;
const CRIT_PER_FOCUS = 0.5; // %

export class BattleSystem {

    // 1. Calculate Player Battle Stats
    static getPlayerStats(char: CharacterState) {
        const stats = char.stats;

        // Stability/Health comes from Consistency
        const maxHp = BASE_HP + (stats.consistency || 0) * HP_PER_CONSISTENCY + (char.level * 5);

        // Attack power comes from Action
        const attack = BASE_ATK + (stats.action || 0) * ATK_PER_ACTION + (char.level * 2);

        // Defense comes from Planning
        const defense = (stats.planning || 0) * DEF_PER_PLANNING;

        // Critical Chance comes from Focus
        const critChance = (stats.focus || 0) * CRIT_PER_FOCUS;

        return { maxHp, attack, defense, critChance };
    }

    // 2. Generate Enemy based on player level
    static generateEnemy(level: number): Enemy {
        const scale = 1 + (level * 0.2); // 20% stronger per level

        const types: { name: string, emoji: string, hp: number, atk: number, def: number, exp: number }[] = [
            { name: "バグスライム", emoji: "🐛", hp: 30, atk: 8, def: 0, exp: 10 },
            { name: "締め切りゴースト", emoji: "👻", hp: 45, atk: 12, def: 2, exp: 20 },
            { name: "スパゲッティモンスター", emoji: "👾", hp: 80, atk: 15, def: 5, exp: 40 },
            { name: "仕様変更ドラゴン", emoji: "🐉", hp: 150, atk: 25, def: 10, exp: 100 },
        ];

        // Randomly pick based on level roughly (simple logic for now)
        const index = Math.min(types.length - 1, Math.floor(Math.random() * (level / 3 + 1)));
        const template = types[index] || types[0];

        // Add some variance
        const variance = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1

        return {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
            name: `${template.name} Lv.${level}`,
            level: level,
            hp: Math.floor(template.hp * scale * variance),
            maxHp: Math.floor(template.hp * scale * variance),
            attack: Math.floor(template.atk * scale * variance),
            defense: Math.floor(template.def * scale * variance),
            expReward: Math.floor(template.exp * scale),
            image: template.emoji
        };
    }

    // 3. Process Turn
    // Returns logs and updated state parts
    static playerAttack(playerStats: { attack: number, critChance: number }, enemy: Enemy): { damage: number, isCrit: boolean, log: string } {
        const isCrit = Math.random() * 100 < playerStats.critChance;
        let damage = Math.max(1, playerStats.attack - enemy.defense);

        if (isCrit) {
            damage = Math.floor(damage * 1.5);
        }

        // Variance
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

        const log = `あなたの攻撃！ ${enemy.name}に${damage}のダメージ！${isCrit ? ' 会心の一撃！' : ''}`;
        return { damage, isCrit, log };
    }

    static enemyAttack(enemy: Enemy, playerStats: { defense: number }): { damage: number, log: string } {
        let damage = Math.max(1, enemy.attack - playerStats.defense);
        // Variance
        damage = Math.floor(damage * (0.8 + Math.random() * 0.4));

        const log = `${enemy.name}の攻撃！ あなたは${damage}のダメージを受けた！`;
        return { damage, log };
    }
}
