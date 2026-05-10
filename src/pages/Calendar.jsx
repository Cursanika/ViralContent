import { useState, useMemo } from 'react';
import { useStore, uid } from '../store/useStore';
import { showToast, formatDate } from '../utils/toast';
import styles from './Calendar.module.css';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const PLATFORMS = ['tiktok','instagram','youtube','twitter'];

function buildGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, curr: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, curr: true });
  const rem = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= rem; i++) cells.push({ day: i, curr: false });
  return cells;
}

export default function Calendar() {
  const { state, dispatch } = useStore();
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', platform: 'tiktok', date: '', time: '', notes: '' });

  const cells = useMemo(() => buildGrid(cur.y, cur.m), [cur]);
  const todayStr = now.toISOString().split('T')[0];

  const dateStr = (day) =>
    `${cur.y}-${String(cur.m + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

  const eventsOn = (d) => state.events.filter(e => e.date === dateStr(d));

  const selectedEvents = selected
    ? state.events.filter(e => e.date === selected).sort((a,b)=>a.time?.localeCompare(b.time||''))
    : state.events.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);

  const saveEvent = () => {
    if (!form.title.trim() || !form.date) return;
    dispatch({ type: 'ADD_EVENT', payload: { ...form, id: uid() } });
    setShowModal(false);
    setForm({ title:'', platform:'tiktok', date:'', time:'', notes:'' });
    showToast('Evento guardado ✓');
  };

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendario</h1>
          <p className={styles.subtitle}>Planifica tu contenido</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(f=>({...f,date:todayStr})); setShowModal(true); }}>
          + Programar
        </button>
      </div>

      <div className={styles.layout}>
        <div className={`${styles.calCard} glass`}>
          <div className={styles.calHeader}>
            <button className="btn-ghost" onClick={()=>setCur(c=>{ const d=new Date(c.y,c.m-1); return {y:d.getFullYear(),m:d.getMonth()}; })}>‹</button>
            <h3>{MONTHS[cur.m]} {cur.y}</h3>
            <button className="btn-ghost" onClick={()=>setCur(c=>{ const d=new Date(c.y,c.m+1); return {y:d.getFullYear(),m:d.getMonth()}; })}>›</button>
          </div>
          <div className={styles.weekdays}>
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d=><span key={d}>{d}</span>)}
          </div>
          <div className={styles.grid}>
            {cells.map((cell, i) => {
              const ds = cell.curr ? dateStr(cell.day) : null;
              const evts = cell.curr ? eventsOn(cell.day) : [];
              return (
                <div
                  key={i}
                  className={`${styles.day}
                    ${!cell.curr ? styles.other : ''}
                    ${ds === todayStr ? styles.today : ''}
                    ${ds === selected ? styles.selected : ''}
                  `}
                  onClick={() => cell.curr && setSelected(ds === selected ? null : ds)}
                >
                  <span>{cell.day}</span>
                  {evts.length > 0 && <div className={styles.dot} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${styles.eventsPanel} glass`}>
          <h3>{selected ? `Eventos — ${formatDate(selected)}` : 'Próximos eventos'}</h3>
          <div className={styles.eventsList}>
            {selectedEvents.length === 0
              ? <p className={styles.empty}>{selected ? 'Sin eventos este día' : 'No hay eventos próximos'}</p>
              : selectedEvents.map(ev => (
                <div key={ev.id} className={styles.eventItem}>
                  <div className={styles.eventTitle}>
                    {ev.title}
                    <span className={`badge badge-${ev.platform}`} style={{marginLeft:6}}>{ev.platform}</span>
                  </div>
                  <div className={styles.eventMeta}>{ev.date}{ev.time ? ' · '+ev.time : ''}</div>
                  {ev.notes && <div className={styles.eventNotes}>{ev.notes}</div>}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => { dispatch({ type: 'DELETE_EVENT', payload: ev.id }); showToast('Evento eliminado','info'); }}
                  >✕ Eliminar</button>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={modalStyle}>
            <h2 style={{fontFamily:'Outfit,sans-serif'}}>Programar contenido</h2>
            <input className="glass-input" placeholder="Título" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            <select className="glass-select" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
              {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <input className="glass-input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            <input className="glass-input" type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} />
            <textarea className="glass-textarea" placeholder="Notas..." rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn-ghost" onClick={()=>setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveEvent}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center' };
const modalStyle = { background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:24,padding:32,width:'100%',maxWidth:440,display:'flex',flexDirection:'column',gap:12,boxShadow:'var(--shadow-md)',color:'var(--text-primary)' };
