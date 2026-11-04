import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { registerGlobalFilmAPI } from './animation/renderer';

// Expose immédiatement window.drawFrame(frame), window.seek(t) et window.getFilmMeta()
registerGlobalFilmAPI();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
