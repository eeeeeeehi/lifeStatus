import type { Scene } from "./Scene";
import { HomeScene } from "../scenes/HomeScene";
import { StatusScene } from "../scenes/StatusScene";
import { LogScene } from "../scenes/LogScene";
import { SettingsScene } from "../scenes/SettingsScene";

export type SceneType = 'home' | 'status' | 'log' | 'settings';

export class SceneRouter {
    private container: HTMLElement;
    private currentScene: Scene | null = null;
    private scenes: Record<SceneType, Scene>;
    private navButtons: NodeListOf<HTMLButtonElement> | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.scenes = {
            home: new HomeScene(),
            status: new StatusScene(),
            log: new LogScene(),
            settings: new SettingsScene()
        };
    }

    navigate(type: SceneType) {
        if (this.currentScene) {
            this.currentScene.unmount();
        }

        this.currentScene = this.scenes[type];
        this.currentScene.mount(this.container);

        this.updateNavHighlight(type);
    }

    // Helper to attach navigation events if the nav bar is external to the router's container
    attachNav(navElement: HTMLElement) {
        this.navButtons = navElement.querySelectorAll('button[data-scene]');
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.scene as SceneType;
                this.navigate(target);
            });
        });
    }

    private updateNavHighlight(activeType: SceneType) {
        if (!this.navButtons) return;
        this.navButtons.forEach(btn => {
            if (btn.dataset.scene === activeType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
