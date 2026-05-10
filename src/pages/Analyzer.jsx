import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { analyzeVirality } from '../services/gemini';
import { showToast } from '../utils/toast';
import styles from './Analyzer.module.css';

export default function Analyzer() {
  const { state } = useStore();
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const arcRef = useRef(null);

  useEffect(() => {
    const txt = sessionStorage.getItem('vc_analyze');
    if (txt) { setInput(txt); sessionStorage.removeItem('vc_analyze'); }
  }, []);

  const analyze = async () => {
    if (!input.trim()) { alert('Por favor ingresa un guion o idea'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await analyzeVirality(input, platform, state.apiKey);
      setResult(res);
      setTimeout(() => {
        if (arcRef.current) {
          const score = Math.min(100, Math.max(0, res.score));
          const circ = 314;
          const offset = circ - (score / 100) * circ;
          arcRef.current.style.strokeDashoffset = offset;
        }
      }, 100);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const getVerdictColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 65) return 'var(--warning)';
    if (score >= 40) return '#fb923c';
    return 'var(--danger)';
  };

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analizador de Viralidad</h1>
          <p className={styles.subtitle}>Descubre el potencial viral de tu contenido</p>
        </div>
      </div>
      <div className={styles.layout}>
        {/* Left: Input */}
        <div className={`${styles.inputCard} glass`}>
          <h3 style={{marginBottom:12,fontSize:'0.95rem'}}>Tu guion o idea</h3>
          <textarea className="glass-textarea" style={{flex:1,minHeight:300,fontFamily:'Inter',lineHeight:1.6}}
            placeholder="Pega aquí tu guion, idea, título o descripción para analizar su potencial viral..."
            value={input} onChange={e=>setInput(e.target.value)} />
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <select className="glass-select" value={platform} onChange={e=>setPlatform(e.target.value)} style={{flex:1}}>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
              <option value="youtube-short">YouTube Shorts</option>
              <option value="youtube">YouTube</option>
            </select>
            <button className="btn-primary" style={{flex:2}} onClick={analyze} disabled={loading}>
              {loading ? '⏳ Analizando...' : '🔥 Analizar Viralidad'}
            </button>
          </div>
          {error && <p style={{color:'var(--danger)',fontSize:'0.8rem',marginTop:8}}>❌ {error}</p>}
        </div>

        {/* Right: Results */}
        <div className={styles.resultsCol}>
          {loading && (
            <div className="glass" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:60,color:'var(--text-muted)'}}>
              <div className="loading-ring"/>
              <p>Analizando potencial viral...</p>
            </div>
          )}
          {!loading && !result && (
            <div className="glass" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:200,color:'var(--text-muted)',gap:12}}>
              <span style={{fontSize:'2.5rem',opacity:0.25}}>◈</span>
              <p style={{textAlign:'center',fontSize:'0.875rem'}}>Los resultados del análisis aparecerán aquí.</p>
            </div>
          )}
          {result && (
            <>
              <div className={`${styles.scoreCard} glass fade-up`}>
                <h3 style={{fontSize:'0.9rem'}}>Score de Viralidad</h3>
                <div className={styles.scoreWrap}>
                  <svg className={styles.scoreSvg} viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:'var(--accent)'}}/><stop offset="100%" style={{stopColor:'var(--accent2)'}}/>
                      </linearGradient>
                    </defs>
                    <circle className={styles.scoreBg} cx="60" cy="60" r="50"/>
                    <circle ref={arcRef} className={styles.scoreArc} cx="60" cy="60" r="50" strokeDasharray="314" strokeDashoffset="314"/>
                  </svg>
                  <div className={styles.scoreLabel}>
                    <span className={styles.scoreNumber}>{result.score}</span>
                    <span className={styles.scoreSub}>/100</span>
                  </div>
                </div>
                <div className={styles.scoreVerdict} style={{color:getVerdictColor(result.score)}}>{result.verdict}</div>
              </div>

              <div className={`${styles.metricsCard} glass fade-up`} style={{animationDelay:'0.1s'}}>
                <h3 style={{marginBottom:12,fontSize:'0.9rem'}}>Métricas detalladas</h3>
                <div className={styles.metricsList}>
                  {result.metrics.map((m,i)=>(
                    <div key={i} className={styles.metricItem}>
                      <div className={styles.metricLabel}>
                        <span>{m.label}</span>
                        <span style={{color:getVerdictColor(m.value)}}>{m.value}%</span>
                      </div>
                      <div className={styles.metricBar}>
                        <div className={styles.metricFill} style={{width:m.value+'%',background:`linear-gradient(90deg,var(--accent),${getVerdictColor(m.value)})`}}/>
                      </div>
                      <div className={styles.metricComment}>{m.comment}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${styles.sugCard} glass fade-up`} style={{animationDelay:'0.2s'}}>
                <h3 style={{marginBottom:12,fontSize:'0.9rem'}}>💡 Sugerencias</h3>
                <div className={styles.sugList}>
                  {result.suggestions.map((s,i)=>(
                    <div key={i} className={styles.sugItem}>
                      <span className={styles.sugIcon}>{s.icon}</span>
                      <span>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.improved_hook && (
                <div className={`${styles.sugCard} glass fade-up`} style={{animationDelay:'0.3s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <h3 style={{fontSize:'0.9rem'}}>✨ Versión mejorada</h3>
                    <button className="btn-ghost" onClick={()=>{navigator.clipboard.writeText(result.improved_hook);showToast('Copiado ✓');}}>Copiar</button>
                  </div>
                  <div className={styles.improved}>{result.improved_hook}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
