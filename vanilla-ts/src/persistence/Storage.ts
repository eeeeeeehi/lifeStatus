import type { AppState } from "../domain/model";

export interface StorageAdapter {
    save(state: AppState): Promise<void>;
    load(): Promise<AppState | null>;
    clear(): Promise<void>;
}
