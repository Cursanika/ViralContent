import styles from './Constancy.module.css';

export default function Constancy() {
  // Generate random heatmap data for visual purposes
  const days = Array.from({ length: 364 }, () => Math.floor(Math.random() * 4));

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Constancia</h1>
          <p className={styles.subtitle}>Mide tu consistencia y mantén la racha</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statValue}>12</div>
          <div className={styles.statLabel}>Racha actual (Días) 🔥</div>
        </div>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statValue}>45</div>
          <div className={styles.statLabel}>Mejor Racha 🏆</div>
        </div>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statValue}>128</div>
          <div className={styles.statLabel}>Posts este año 📈</div>
        </div>
      </div>

      <div className={`${styles.graphCard} glass`}>
        <h3 className={styles.graphHeader}>Actividad de publicación (Último año)</h3>
        <div className={styles.heatmap}>
          {days.map((level, i) => (
            <div key={i} className={`${styles.day} ${level > 0 ? styles['lvl'+level] : ''}`} title={`Nivel de actividad: ${level}`} />
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, marginTop: 16, fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
          Menos <div className={styles.day} style={{width: 12, height: 12}} />
          <div className={`${styles.day} ${styles.lvl1}`} style={{width: 12, height: 12}} />
          <div className={`${styles.day} ${styles.lvl2}`} style={{width: 12, height: 12}} />
          <div className={`${styles.day} ${styles.lvl3}`} style={{width: 12, height: 12}} /> Más
        </div>
      </div>
    </div>
  );
}
