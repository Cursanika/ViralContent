import { useStore } from '../store/useStore';
import { today, formatDate } from '../utils/toast';
import styles from './Upcoming.module.css';

export default function Upcoming() {
  const { state } = useStore();
  const upcomingEvents = state.events
    .filter(e => e.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Próximos</h1>
          <p className={styles.subtitle}>Todo el contenido que tienes programado</p>
        </div>
      </div>

      <div className={styles.timeline}>
        {upcomingEvents.length === 0 ? (
           <p style={{color:'var(--text-secondary)', textAlign: 'center', padding: 40}}>No tienes contenido programado próximamente.</p>
        ) : upcomingEvents.map((ev, i) => (
          <div key={ev.id} className={styles.item}>
            <div className={styles.marker}>
              <div className={styles.dot} />
              <div className={styles.dateLabel}>{ev.date.split('-').slice(1).reverse().join('/')}</div>
            </div>
            <div className={`${styles.card} glass`}>
              <div className={styles.itemTitle}>{ev.title}</div>
              <div className={styles.itemMeta}>
                <span className={`badge badge-${ev.platform}`}>{ev.platform}</span>
                <span style={{marginLeft: 12}}>Hora: {ev.time || 'Por definir'}</span>
              </div>
              {ev.notes && <div className={styles.itemNotes}>📝 {ev.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
