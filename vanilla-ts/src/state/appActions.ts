import { store } from "./store";
import type { ActionItem, DailyActionLog } from "../domain/model";

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
    // Logic: 
    // 1. Check if already done today
    // 2. If not, add log.
    // 3. If done, remove log (or mark undone).
    // 4. Update EXP/Stats (MVP: simple addition)

    const state = store.getState();
    const existingLogIndex = state.logs.findIndex(l => l.actionId === actionId && l.date === dateStr);

    if (existingLogIndex >= 0) {
        // Already done. MVP: Toggle off? Spec says "Best not to allow undo" but for UX we might need it.
        // Let's allow undo but remove rewards.
        // For now, let's just implement toggle.
        const newLogs = [...state.logs];
        newLogs.splice(existingLogIndex, 1);

        // Decrease EXP/Stats logic would go here if we were careful, but MVP simplified:
        // Just remove the log state.

        store.setState({ logs: newLogs });

    } else {
        // Mark done
        const newLog: DailyActionLog = {
            id: crypto.randomUUID(),
            date: dateStr,
            actionId,
            done: true,
            doneAt: Date.now()
        };

        // Reward Logic (Simple MVP)
        const currentChar = state.character;
        const newExp = currentChar.exp + 10;
        const newLevel = Math.floor(newExp / 100) + 1;

        // Stats: Action + 1
        const newStats = { ...currentChar.stats };
        newStats.action = (newStats.action || 0) + 1;

        // Bonus logic can be added here

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

        // Notify/Toast would be handled by UI observing state changes
    }
}

export function getTodayISODate(): string {
    // Simple YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
