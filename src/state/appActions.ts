import { store } from "./store";
import type { ActionItem, DailyActionLog, StatsKey } from "../domain/model";

export function setGoal(title: string) {
    store.setState((_prev) => ({
        goal: {
            id: crypto.randomUUID(),
            title,
            createdAt: Date.now()
        }
    }));
}

export function addAction(title: string) {
    store.setState((prev) => {
        if (prev.actions.length >= 3) return {}; // Max 3
        const newAction: ActionItem = {
            id: crypto.randomUUID(),
            goalId: prev.goal?.id || '',
            title,
            createdAt: Date.now()
        };
        return {
            actions: [...prev.actions, newAction]
        };
    });
}

export function toggleAction(actionId: string, dateStr: string) {
    const state = store.getState();
    const existingLogIndex = state.logs.findIndex(l => l.actionId === actionId && l.date === dateStr);

    if (existingLogIndex >= 0) {
        // Undo: Revert Rewards
        const newLogs = [...state.logs];
        newLogs.splice(existingLogIndex, 1);

        const currentChar = state.character;
        // Revert EXP - prevent negative
        const newExp = Math.max(0, currentChar.exp - 10);
        // Recalculate level
        const newLevel = Math.floor(newExp / 100) + 1;

        // Revert Stats - prevent negative
        const newStats = { ...currentChar.stats };
        newStats.action = Math.max(0, (newStats.action || 0) - 1);

        store.setState({
            logs: newLogs,
            character: {
                ...currentChar,
                exp: newExp,
                level: newLevel,
                stats: newStats,
                lastUpdatedAt: Date.now()
            }
        });

    } else {
        // Mark done
        const newLog: DailyActionLog = {
            id: crypto.randomUUID(),
            date: dateStr,
            actionId,
            done: true,
            doneAt: Date.now()
        };

        // Reward Logic
        const currentChar = state.character;
        const newExp = currentChar.exp + 10;
        const newLevel = Math.floor(newExp / 100) + 1;

        // Stats: Action + 1
        const newStats = { ...currentChar.stats };
        newStats.action = (newStats.action || 0) + 1;

        store.setState({
            logs: [...state.logs, newLog],
            character: {
                ...currentChar,
                exp: newExp,
                level: newLevel,
                stats: newStats,
                lastUpdatedAt: Date.now()
            }
        });
    }
}

export function updateCharacterStats(bonusStats: Partial<Record<StatsKey, number>>) {
    const state = store.getState();
    const newStats = { ...state.character.stats };

    Object.entries(bonusStats).forEach(([key, value]) => {
        const k = key as StatsKey;
        if (typeof newStats[k] === 'number') {
            newStats[k] += value;
        }
    });

    store.setState({
        character: {
            ...state.character,
            stats: newStats
        }
    });
}

// --- Data Management ---

export function exportData(): string {
    const state = store.getState();
    return JSON.stringify(state, null, 2);
}

export function importData(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);
        if (!data || !data.character) throw new Error("Invalid Data");
        store.setState(data);
        return true;
    } catch (e) {
        console.error("Import failed:", e);
        return false;
    }
}

export function resetData() {
    localStorage.clear();
    location.reload();
}

export function getTodayISODate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
