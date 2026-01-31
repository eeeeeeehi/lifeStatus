import { store } from "../state/store";
import { SceneRouter } from "./SceneRouter";

export class GameApp {
  private root: HTMLElement;
  private router: SceneRouter | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async init() {
    // 1. Initialize Store
    await store.init();

    // 2. Render App Shell
    this.renderShell();

    // 3. Initialize Router
    const contentArea = this.root.querySelector('#content-area') as HTMLElement;
    const navBar = this.root.querySelector('#nav-bar') as HTMLElement;

    this.router = new SceneRouter(contentArea);
    this.router.attachNav(navBar);

    // 4. Start (Home or Onboarding)
    this.router.navigate('home');
  }

  private renderShell() {
    this.root.innerHTML = `
      <div class="app-shell">
        <main id="content-area" class="content-area"></main>
        
        <nav id="nav-bar" class="nav-bar">
          <button data-scene="home" class="nav-btn active">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>ホーム</span>
          </button>
          
          <button data-scene="status" class="nav-btn">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>ステータス</span>
          </button>
          
          <button data-scene="log" class="nav-btn">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               <polyline points="14 2 14 8 20 8"></polyline>
               <line x1="16" y1="13" x2="8" y2="13"></line>
               <line x1="16" y1="17" x2="8" y2="17"></line>
               <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>記録</span>
          </button>
        </nav>
      </div>
    `;
  }
}
