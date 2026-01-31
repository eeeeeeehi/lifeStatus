import type { AppState } from "../domain/model";
import type { StorageAdapter } from "./Storage";

const STORAGE_KEY = "lifestatus_mvp_v1";

export class LocalStorageAdapter implements StorageAdapter {
    async save(state: AppState): Promise<void> {
        try {
            const json = JSON.stringify(state);
            localStorage.setItem(STORAGE_KEY, json);
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    }

    async load(): Promise<AppState | null> {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return null;
            return JSON.parse(json) as AppState;
        } catch (e) {
            console.error("Failed to load from localStorage", e);
            return null;
        }
    }

    async clear(): Promise<void> {
        localStorage.removeItem(STORAGE_KEY);
    }
}
