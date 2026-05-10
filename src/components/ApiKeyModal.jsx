import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ApiKeyModal({ onClose }) {
  const { state, dispatch } = useStore();
  const [val, setVal] = useState(state.apiKey);

  const save = () => {
    if (!val.trim()) return;
    dispatch({ type: 'SET_API_KEY', payload: val.trim() });
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ fontSize: '2rem', textAlign: 'center' }}>✦</div>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', textAlign: 'center' }}>
          Configura tu IA
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, textAlign: 'center' }}>
          Ingresa tu API key de <strong>Google Gemini</strong> para activar todas las funciones con inteligencia artificial.
        </p>
        <input
          type="password"
          className="glass-input"
          placeholder="AIzaSy..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoComplete="off"
        />
        <button className="btn-primary" onClick={save} style={{ width: '100%', padding: '13px' }}>
          Activar Dashboard
        </button>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent)', fontSize: '0.8rem', textAlign: 'center', textDecoration: 'none' }}>
          Obtener clave gratis →
        </a>
        {state.apiKey && (
          <button className="btn-ghost" onClick={onClose} style={{ width: '100%' }}>Cancelar</button>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(8px)', zIndex: 900,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '24px', padding: '36px',
  width: '100%', maxWidth: '420px',
  display: 'flex', flexDirection: 'column', gap: '14px',
  boxShadow: 'var(--shadow-md)',
  color: 'var(--text-primary)'
};
