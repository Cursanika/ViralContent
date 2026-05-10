import styles from './Trends.module.css';

const AUDIO_TRENDS = [
  { id: 1, title: 'Pedro Pedro Pedro', uses: '2.5M usos', status: 'hot' },
  { id: 2, title: 'Funny Background Music', uses: '890K usos', status: 'up' },
  { id: 3, title: 'Cinematic Epic Trailer', uses: '450K usos', status: 'up' },
  { id: 4, title: 'LoFi Chill Vibes', uses: '1.1M usos', status: '' },
];

const TOPIC_TRENDS = [
  { id: 1, title: 'Inteligencia Artificial en 2026', views: '15M vistas', status: 'hot' },
  { id: 2, title: 'Rutina de Mañana', views: '5.2M vistas', status: 'up' },
  { id: 3, title: 'Setup Minimalista', views: '3.8M vistas', status: 'up' },
  { id: 4, title: 'Finanzas Personales', views: '8M vistas', status: '' },
];

export default function Trends() {
  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tendencias</h1>
          <p className={styles.subtitle}>Descubre qué está funcionando ahora mismo</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          <h3 className={styles.colTitle}>🎵 Audios Virales</h3>
          {AUDIO_TRENDS.map((t, i) => (
            <div key={t.id} className={`${styles.trendCard} glass ${styles[t.status]}`}>
              <div className={styles.rank}>{i + 1}</div>
              <div className={styles.content}>
                <div className={styles.trendTitle}>{t.title}</div>
                <div className={styles.trendMeta}>{t.uses}</div>
              </div>
              <div>{t.status === 'hot' ? '🔥' : t.status === 'up' ? '📈' : ''}</div>
            </div>
          ))}
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>💡 Temas del momento</h3>
          {TOPIC_TRENDS.map((t, i) => (
            <div key={t.id} className={`${styles.trendCard} glass ${styles[t.status]}`}>
              <div className={styles.rank}>{i + 1}</div>
              <div className={styles.content}>
                <div className={styles.trendTitle}>{t.title}</div>
                <div className={styles.trendMeta}>{t.views}</div>
              </div>
              <div>{t.status === 'hot' ? '🔥' : t.status === 'up' ? '📈' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
