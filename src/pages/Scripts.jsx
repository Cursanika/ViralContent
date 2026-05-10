import { useState, useEffect } from 'react';
import { useStore, uid } from '../store/useStore';
import { generateScript } from '../services/gemini';
import { showToast } from '../utils/toast';
import styles from './Scripts.module.css';

const TONES = ['engaging','educational','humorous','inspirational','controversial'];
const TONE_LABELS = { engaging:'Enganchador', educational:'Educativo', humorous:'Humor', inspirational:'Inspiracional', controversial:'Controversial' };

export default function Scripts() {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState({ platform:'tiktok', niche:'tech', topic:'', audience:'', keywords:'' });
  const [tone, setTone] = useState('engaging');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [script, setScript] = useState('');
  const [selectedSaved, setSelectedSaved] = useState(null);

  useEffect(() => {
    const topic = sessionStorage.getItem('vc_topic');
    if (topic) { setForm(f=>({...f,topic})); sessionStorage.removeItem('vc_topic'); }
  }, []);

  const generate = async () => {
    if (!form.topic.trim()) { alert('Por favor ingresa el tema del video'); return; }
    setLoading(true); setError(''); setScript('');
    try {
      const result = await generateScript({ ...form, tone }, state.apiKey);
      setScript(result);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const save = () => {
    if (!script) return;
    dispatch({ type: 'ADD_SCRIPT', payload: { id: uid(), title: form.topic, platform: form.platform, content: script, score: 0, date: new Date().toLocaleDateString('es-MX') } });
    showToast('Guion guardado ✓');
  };

  const sendToAnalyzer = () => {
    if (!script) return;
    sessionStorage.setItem('vc_analyze', script);
    dispatch({ type: 'SET_PAGE', payload: 'analyzer' });
  };

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Generador de Guiones</h1>
          <p className={styles.subtitle}>Crea guiones virales con IA en segundos</p>
        </div>
      </div>
      <div className={styles.layout}>
        {/* Left: form */}
        <div className={`${styles.formCard} glass`}>
          <h3 style={{marginBottom:16,fontSize:'0.95rem'}}>Parámetros</h3>
          <label className={styles.label}>Plataforma</label>
          <select className="glass-select" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
            <option value="tiktok">TikTok (30-60s)</option>
            <option value="instagram">Instagram Reels</option>
            <option value="youtube-short">YouTube Shorts</option>
            <option value="youtube">YouTube (8-15min)</option>
          </select>
          <label className={styles.label}>Nicho</label>
          <select className="glass-select" value={form.niche} onChange={e=>setForm(f=>({...f,niche:e.target.value}))}>
            {['tech','lifestyle','finance','fitness','food','travel','education','entertainment','motivation'].map(n=>(
              <option key={n} value={n}>{n.charAt(0).toUpperCase()+n.slice(1)}</option>
            ))}
          </select>
          <label className={styles.label}>Tema del video</label>
          <input className="glass-input" placeholder="Ej: 5 herramientas de IA que nadie conoce" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} />
          <label className={styles.label}>Tono</label>
          <div className={styles.toneGrid}>
            {TONES.map(t=>(
              <button key={t} className={`${styles.toneChip} ${tone===t?styles.toneActive:''}`} onClick={()=>setTone(t)}>
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
          <label className={styles.label}>Audiencia objetivo</label>
          <input className="glass-input" placeholder="Ej: jóvenes 18-25 interesados en tech" value={form.audience} onChange={e=>setForm(f=>({...f,audience:e.target.value}))} />
          <label className={styles.label}>Keywords (opcional)</label>
          <input className="glass-input" placeholder="IA, productividad, 2026..." value={form.keywords} onChange={e=>setForm(f=>({...f,keywords:e.target.value}))} />
          <button className="btn-primary" style={{width:'100%',padding:'14px',fontSize:'1rem',marginTop:4}} onClick={generate} disabled={loading}>
            {loading ? '⏳ Generando...' : '✦ Generar Guion con IA'}
          </button>
          {error && <p style={{color:'var(--danger)',fontSize:'0.8rem'}}>❌ {error}</p>}
        </div>

        {/* Right: output */}
        <div className={`${styles.outputCard} glass`}>
          <div className={styles.outputHeader}>
            <h3>Guion generado</h3>
            {script && (
              <div style={{display:'flex',gap:8}}>
                <button className="btn-ghost" onClick={()=>{navigator.clipboard.writeText(script);showToast('Copiado ✓');}}>Copiar</button>
                <button className="btn-ghost" onClick={save}>Guardar</button>
                <button className="btn-ghost" style={{borderColor:'rgba(167,139,250,0.4)',color:'var(--accent)'}} onClick={sendToAnalyzer}>Analizar →</button>
              </div>
            )}
          </div>
          {loading && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'60px 0',color:'var(--text-muted)'}}>
              <div className="loading-ring"/>
              <p>Generando tu guion viral...</p>
            </div>
          )}
          {!loading && !script && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:220,color:'var(--text-muted)',gap:12}}>
              <span style={{fontSize:'2.5rem',opacity:0.25}}>◎</span>
              <p style={{textAlign:'center',fontSize:'0.875rem'}}>Tu guion aparecerá aquí.<br/>Completa los parámetros y pulsa "Generar".</p>
            </div>
          )}
          {script && (
            <pre className={styles.scriptText}>{script}</pre>
          )}

          {/* Saved scripts */}
          {state.scripts.length > 0 && (
            <div className={styles.savedSection}>
              <h4>Guiones guardados</h4>
              {state.scripts.map(s=>(
                <div key={s.id} className={`${styles.savedItem} ${selectedSaved===s.id?styles.savedActive:''}`}
                  onClick={()=>{ setScript(s.content); setSelectedSaved(s.id); }}>
                  <div className={styles.savedTitle}>{s.title}</div>
                  <div className={styles.savedMeta}>{s.platform} · {s.date}{s.score?` · 🔥 ${s.score}%`:''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
