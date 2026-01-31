export interface Scene {
    mount(container: HTMLElement): void;
    unmount(): void;
    // Optional: update method if we have a frame loop
    update?(deltaTime: number): void;
}
