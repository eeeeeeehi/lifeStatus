import { store } from "../state/store";
import type { Scene } from "./Scene";
import { HomeScene } from "../scenes/HomeScene";
import { BattleScene } from "../scenes/BattleScene";
import { RankingScene } from "../scenes/RankingScene";
import { StatusScene } from "../scenes/StatusScene";
import { LogScene } from "../scenes/LogScene";
import { SettingsScene } from "../scenes/SettingsScene";

export class GameApp {
  private currentScene: Scene | null = null;
  private appContainer: HTMLElement;
  private contentArea: HTMLElement | null = null;
  private navBar: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    this.appContainer = root;

    // Listen for global navigation events
    window.addEventListener('navigate', (e: any) => {
      const route = e.detail;
      this.navigate(route);
    });
  }

  async init() {
    try {
      // 1. Initialize Store (Non-blocking to show UI immediately)
      store.init().catch(e => console.error("Store init error:", e));

      // 2. Render App Shell
      this.renderShell();

      // 3. Start at Home
      this.navigate('home');
    } catch (e: any) {
      console.error("App init failed:", e);
      this.appContainer.innerHTML = `<div style="padding:20px; color:red;">
        <h1>Error</h1>
        <p>アプリの起動に失敗しました。</p>
        <pre>${e.message}\n${e.stack}</pre>
        </div>`;
    }
  }

  private renderShell() {
    this.appContainer.innerHTML = `
      <div class="app-shell">
        <main id="content-area" class="content-area"></main>
        
        <nav id="nav-bar" class="nav-bar glass-panel">
          <button data-scene="home" class="nav-btn active">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>ホーム</span>
          </button>
          
          <button data-scene="status" class="nav-btn">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>ステータス</span>
          </button>
          
          <button data-scene="log" class="nav-btn">
             <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             <span>記録</span>
          </button>
          
          <button data-scene="settings" class="nav-btn">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>設定</span>
          </button>
        </nav>
      </div>
    `;

    this.contentArea = this.appContainer.querySelector('#content-area');
    this.navBar = this.appContainer.querySelector('#nav-bar');

    // Attach Nav Events
    const buttons = this.navBar?.querySelectorAll('.nav-btn');
    buttons?.forEach(btn => {
      btn.addEventListener('click', () => {
        const scene = (btn as HTMLElement).dataset.scene;
        if (scene) this.navigate(scene);
      });
    });
  }

  private navigate(route: string) {
    if (!this.contentArea) return;

    if (this.currentScene) {
      this.currentScene.unmount();
    }

    // Switch Scene
    switch (route) {
      case 'home':
        this.currentScene = new HomeScene();
        break;
      case 'status':
        this.currentScene = new StatusScene();
        break;
      case 'log':
        this.currentScene = new LogScene();
        break;
      case 'settings':
        this.currentScene = new SettingsScene();
        break;
      case 'battle':
        this.currentScene = new BattleScene();
        break;
      case 'ranking':
        this.currentScene = new RankingScene();
        break;
      default:
        this.currentScene = new HomeScene();
    }

    this.currentScene.mount(this.contentArea);

    // Update Nav Active State
    // Battle and Ranking are not in the bottom nav, so we might remove active state or keep 'home' roughly
    this.navBar?.querySelectorAll('.nav-btn').forEach(btn => {
      const scene = (btn as HTMLElement).dataset.scene;

      if (scene === route) {
        btn.classList.add('active');
        // Simple animation for nav
        btn.animate([
          { transform: 'scale(0.95)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ], { duration: 300, easing: 'ease-out' });
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
