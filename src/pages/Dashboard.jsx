import { useState } from 'react';
import { useStore } from '../store/useStore';
import { today } from '../utils/toast';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { state } = useStore();
  const [filter, setFilter] = useState('Todo');

  const upcomingEvents = state.events
    .filter(e => e.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 2);

  const recentIdeas = state.ideas.slice(0, 2);

  // Fecha actual formateada
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = new Date().toLocaleDateString('es-ES', dateOptions);

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Buenos días Creador</h1>
        <p className={styles.date}>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
      </div>

      <div className={styles.filters}>
        {['Todo', 'Instagram', 'TikTok'].map(f => (
          <button 
            key={f} 
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'Todo' ? '📊' : f === 'Instagram' ? '📸' : '🎵'} {f}
          </button>
        ))}
      </div>

      <div className={styles.highlightCard}>
        <div className={styles.highlightIcon}>🔥</div>
        <div>
          <div className={styles.highlightTitle}>Tu último post está rompiendo</div>
          <div className={styles.highlightSub}>737.8K vistas en Instagram · 125% sobre la media</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>⚡ ESTO TE TOCA HOY</div>
        {recentIdeas.length === 0 ? (
          <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>No tienes tareas pendientes.</p>
        ) : recentIdeas.map(idea => (
          <div key={idea.id} className={styles.listCard}>
            <div className={styles.listIcon}>💡</div>
            <div className={styles.listContent}>
              <div className={styles.listTitle}>{idea.title}</div>
              <div className={styles.listSub}>Tu audiencia pidió: "{idea.title}..."</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>📅 EN TU AGENDA</div>
        {upcomingEvents.length === 0 ? (
           <p style={{color:'var(--text-secondary)', fontSize:'0.85rem'}}>Tu agenda está libre.</p>
        ) : upcomingEvents.map(ev => (
          <div key={ev.id} className={styles.listCard} style={{borderLeft: '4px solid var(--success)'}}>
            <div className={styles.listIcon} style={{background:'rgba(52, 199, 89, 0.15)', color:'var(--success)'}}>📱</div>
            <div className={styles.listContent}>
              <div className={styles.listTitle}>{ev.title}</div>
              <div className={styles.listSub}>{ev.platform} · {ev.date}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>📊 MIS REDES</div>
        <div className={styles.socialGrid}>
          
          <div className={styles.socialCard}>
            <div className={styles.socialHeader}>
              <span className={styles.socialIcon} style={{color: 'var(--danger)'}}>▶</span> YouTube
            </div>
            <div className={styles.socialValue}>{state.social?.youtube?.stats?.subs || '0'}</div>
            <div className={styles.socialLabel}>suscriptores</div>
            <div className={styles.socialGrowth}>+12 esta semana</div>
            <div className={styles.socialER}>Views: {state.social?.youtube?.stats?.views || '0'}</div>
          </div>

          <div className={styles.socialCard}>
            <div className={styles.socialHeader}>
              <span className={styles.socialIcon}>📸</span> Instagram
            </div>
            <div className={styles.socialValue}>{state.social?.instagram?.stats?.followers || '1.9M'}</div>
            <div className={styles.socialLabel}>seguidores</div>
            <div className={styles.socialGrowth}>+116 esta semana</div>
            <div className={styles.socialER}>ER: 10.69%</div>
          </div>

          <div className={styles.socialCard}>
            <div className={styles.socialHeader}>
              <span className={styles.socialIcon}>🎵</span> TikTok
            </div>
            <div className={styles.socialValue}>{state.social?.tiktok?.stats?.followers || '2.2M'}</div>
            <div className={styles.socialLabel}>seguidores</div>
            <div className={styles.socialGrowth}>+840 esta semana</div>
            <div className={styles.socialER}>ER: 14.6%</div>
          </div>

        </div>
      </div>

      {/* Mejor hora para publicar section */}
      <div className={styles.section} style={{marginTop: 40}}>
        <div className={styles.sectionTitle}>⏰ MEJOR HORA PARA PUBLICAR</div>
        <div style={{display: 'flex', gap: '32px', marginTop: '16px'}}>
          <div>
            <div style={{color: 'var(--accent)', fontSize: '3rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-1px'}}>
              06:00 <span style={{fontSize: '1rem', fontWeight: '600'}}>PM</span>
            </div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px'}}>Basado en tus últimos 30 posts</div>
          </div>
        </div>
      </div>

    </div>
  );
}
