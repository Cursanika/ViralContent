import { useState } from 'react';
import { useStore } from '../store/useStore';
import styles from './Posts.module.css';

export default function Posts() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? state.posts : state.posts.filter(p => p.platform === filter);

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis Posts</h1>
          <p className={styles.subtitle}>Gestiona y analiza tu contenido publicado</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select className="glass-select" style={{width: 200}} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Todas las plataformas</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="youtube-short">YouTube Shorts</option>
        </select>
        <input className="glass-input" placeholder="Buscar post..." style={{flex: 1}} />
      </div>

      <div className={styles.grid}>
        {state.posts.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)'}}>
            <div style={{fontSize: '3rem', marginBottom: 16}}>🔌</div>
            <h3 style={{fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8}}>Aún no hay posts sincronizados</h3>
            <p>Ve a "Mi audiencia" y conecta tus redes sociales para importar tus estadísticas automáticamente.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{color:'var(--text-secondary)'}}>No hay posts para este filtro.</p>
        ) : (
          filtered.map(post => (
            <div key={post.id} className={`${styles.card} glass`}>
              <div className={styles.thumbnail}>{post.icon}</div>
              <div className={styles.content}>
                <div className={styles.postMeta}>
                  <span className={`badge badge-${post.platform}`}>{post.platform}</span>
                  <span>{post.date}</span>
                </div>
                <div className={styles.postTitle}>{post.title}</div>
                <div className={styles.stats}>
                  <div className={styles.stat}><span style={{color:'var(--accent)'}}>👁</span> {post.views}</div>
                  <div className={styles.stat}><span style={{color:'var(--danger)'}}>❤️</span> {post.likes}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
