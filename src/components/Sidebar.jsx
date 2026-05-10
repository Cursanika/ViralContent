import { useStore } from '../store/useStore';
import styles from './Sidebar.module.css';

const NAV = [
  { page: 'dashboard',  icon: '🏠', label: 'Inicio' },
  { page: 'posts',      icon: '📱', label: 'Posts' },
  { page: 'constancy',  icon: '📈', label: 'Constancia' },
  { page: 'ideas',      icon: '💡', label: 'Ideas IA' },
  { page: 'scripts',    icon: '💬', label: 'Asistente' },
  { page: 'social',     icon: '👥', label: 'Mi audiencia' },
  { page: 'upcoming',   icon: '🎥', label: 'Próximos' },
  { page: 'calendar',   icon: '📅', label: 'Calendario' },
  { page: 'trends',     icon: '🔥', label: 'Tendencias' },
];

export default function Sidebar({ onSettings }) {
  const { state, dispatch } = useStore();
  
  const go = (page) => dispatch({ type: 'SET_PAGE', payload: page });
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  // Calcular score promedio de scripts
  const scripts = state.scripts || [];
  const avgScore = scripts.length ? Math.round(scripts.reduce((acc, s) => acc + (s.score||0), 0) / scripts.length) : 0;

  return (
    <aside className={styles.sidebar}>
      
      <div className={styles.profile}>
        <div className={styles.avatar}>✨</div>
        <div className={styles.name}>Creador</div>
        <div className={styles.status}>Actualizado hoy</div>
        <div className={styles.scorePill}>
          <span>★</span> Score {avgScore}/100
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(n => (
          <button
            key={n.page}
            className={`${styles.navItem} ${state.page === n.page ? styles.active : ''}`}
            onClick={() => go(n.page)}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.themeToggle} onClick={toggleTheme}>
          <span>{state.theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}</span>
        </button>
        <button className={styles.navItem} onClick={onSettings}>
          <span className={styles.navIcon}>⚙️</span>
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
