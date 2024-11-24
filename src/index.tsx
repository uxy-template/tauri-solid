import { render } from 'solid-js/web';
import { App } from '@/App';

const root = document.getElementById('root');
if (root) {
  root.classList.add('uxy-tauri-solid-application');
  render(() => <App />, root);
}
