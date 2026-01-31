import './style.css';
import { GameApp } from './app/GameApp';

const root = document.querySelector<HTMLElement>('#app');
if (root) {
  const app = new GameApp(root);
  app.init().catch(console.error);
}
