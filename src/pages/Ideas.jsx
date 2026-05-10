import { useState } from 'react';
import { useStore, uid } from '../store/useStore';
import { generateHooks } from '../services/gemini';
import { showToast } from '../utils/toast';
import styles from './Ideas.module.css';

const TYPES = ['hook','concept','trending','series'];
const TYPE_COLORS = { hook:'var(--accent3)', concept:'var(--accent2)', trending:'var(--success)', series:'var(--accent)' };

export default function Ideas() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState('all');
  const [showPanel, setShowPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', type:'hook', desc:'' });
  const [hookForm, setHookForm] = useState({ niche:'tech', topic:'', platform:'tiktok' });
  const [hooks, setHooks] = useState([]);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [hooksError, setHooksError] = useState('');

  const filtered = filter === 'all' ? state.ideas : state.ideas.filter(i => i.type === filter);

  const saveIdea = () => {
    if (!form.title.trim()) return;
    dispatch({ type: 'ADD_IDEA', payload: { ...form, id: uid(), date: new Date().toLocaleDateString('es-MX') } });
    setShowModal(false);
    setForm({ title:'', type:'hook', desc:'' });
    showToast('Idea guardada ✓');
  };

  const genHooks = async () => {
    setHooksLoading(true); setHooksError(''); setHooks([]);
    try {
      const h = await generateHooks(hookForm.niche, hookForm.topic||'contenido general', hookForm.platform, state.apiKey);
      setHooks(h);
    } catch(e) { setHooksError(e.message); }
    setHooksLoading(false);
  };

  const saveHook = (h) => {
    dispatch({ type: 'ADD_IDEA', payload: { id: uid(), title: h, type: 'hook', desc: '', date: new Date().toLocaleDateString('es-MX') } });
    showToast('Hook guardado ✓');
  };

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ideas & Hooks</h1>
          <p className={styles.subtitle}>Tu banco de ideas y ganchos virales</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn-ghost" onClick={()=>setShowPanel(p=>!p)}>🔥 Hooks con IA</button>
          <button className="btn-primary" onClick={()=>setShowModal(true)}>+ Nueva Idea</button>
        </div>
      </div>

      <div className={styles.filters}>
        {['all',...TYPES].map(f => (
          <button key={f} className={`${styles.chip} ${filter===f?styles.active:''}`} onClick={()=>setFilter(f)}>
            {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0
          ? <p className={styles.empty}>No hay ideas en esta categoría. ¡Crea una!</p>
          : filtered.map(idea => (
            <div key={idea.id} className={`${styles.card} glass`}>
              <div className={styles.typeBadge} style={{color:TYPE_COLORS[idea.type],borderColor:TYPE_COLORS[idea.type]+'44',background:TYPE_COLORS[idea.type]+'12'}}>
                {idea.type}
              </div>
              <div className={styles.ideaTitle}>{idea.title}</div>
              {idea.desc && <div className={styles.ideaDesc}>{idea.desc}</div>}
              <div className={styles.ideaDate}>{idea.date}</div>
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={()=>{ dispatch({type:'SET_PAGE',payload:'scripts'}); sessionStorage.setItem('vc_topic',idea.title); }}>→ Guion</button>
                <button className={styles.actionBtn} onClick={()=>{ dispatch({type:'SET_PAGE',payload:'analyzer'}); sessionStorage.setItem('vc_analyze',idea.title+' '+idea.desc); }}>→ Analizar</button>
                <button className={styles.actionBtn} style={{color:'var(--danger)'}} onClick={()=>{ dispatch({type:'DELETE_IDEA',payload:idea.id}); showToast('Idea eliminada','info'); }}>✕</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Hooks side panel */}
      {showPanel && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>🔥 Generador de Hooks</h3>
            <button className="btn-ghost" onClick={()=>setShowPanel(false)}>✕</button>
          </div>
          <select className="glass-select" value={hookForm.niche} onChange={e=>setHookForm(f=>({...f,niche:e.target.value}))}>
            {['tech','lifestyle','finance','fitness','food','travel','education'].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
          <input className="glass-input" placeholder="Tema específico..." value={hookForm.topic} onChange={e=>setHookForm(f=>({...f,topic:e.target.value}))} />
          <select className="glass-select" value={hookForm.platform} onChange={e=>setHookForm(f=>({...f,platform:e.target.value}))}>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram Reels</option>
            <option value="youtube-short">YouTube Shorts</option>
          </select>
          <button className="btn-primary" style={{width:'100%'}} onClick={genHooks} disabled={hooksLoading}>
            {hooksLoading ? 'Generando...' : 'Generar 5 Hooks ✦'}
          </button>
          {hooksLoading && <div style={{display:'flex',justifyContent:'center',padding:16}}><div className="loading-ring"/></div>}
          {hooksError && <p style={{color:'var(--danger)',fontSize:'0.8rem'}}>❌ {hooksError}</p>}
          {hooks.map((h,i) => (
            <div key={i} className={styles.hookItem} onClick={()=>saveHook(h)} title="Click para guardar">
              "{h}"
            </div>
          ))}
        </div>
      )}

      {/* Add idea modal */}
      {showModal && (
        <div style={overlayStyle} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={modalStyle}>
            <h2 style={{fontFamily:'Outfit,sans-serif'}}>Nueva Idea</h2>
            <input className="glass-input" placeholder="Título de la idea" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            <select className="glass-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
            <textarea className="glass-textarea" placeholder="Descripción..." rows={4} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} />
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn-ghost" onClick={()=>setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveIdea}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center'};
const modalStyle = {background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:24,padding:32,width:'100%',maxWidth:440,display:'flex',flexDirection:'column',gap:12,boxShadow:'var(--shadow-md)',color:'var(--text-primary)'};
