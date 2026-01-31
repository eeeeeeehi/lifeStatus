import { createInitialState } from "../domain/model";
import type { AppState } from "../domain/model";
import type { StorageAdapter } from "../persistence/Storage";
import { LocalStorageAdapter } from "../persistence/LocalStorageAdapter";

type Listener = (state: AppState) => void;

export class Store {
    private state: AppState;
    private listeners: Set<Listener> = new Set();
    private storage: StorageAdapter;
    private autoSave: boolean = true;

    constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
        this.storage = storage;
        this.state = createInitialState();
    }

    async init() {
        try {
            const loaded = await this.storage.load();
            if (loaded) {
                // Use setState to notify listeners/UI
                this.setState((prev) => ({ ...prev, ...loaded }));
            }
        } catch (e) {
            console.error("Store load failed", e);
        }
    }

    getState(): AppState {
        // Return a shallow copy to prevent direct mutation if possible, 
        // though deep copy is better but slower. 
        // For MVP performant read, we just return reference but advise against mutation.
        return this.state;
    }

    setState(partial: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) {
        const changes = typeof partial === 'function' ? partial(this.state) : partial;
        this.state = { ...this.state, ...changes };

        this.notify();

        if (this.autoSave) {
            this.storage.save(this.state);
        }
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        // Return unsubscribe function
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach(l => l(this.state));
    }
}

// Singleton instance
export const store = new Store();
