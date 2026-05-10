import { useState } from 'react';
import { useStore } from '../store/useStore';
import { showToast } from '../utils/toast';
import styles from './Social.module.css';

// Helpers
const formatNum = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatRelDate = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays/7)} sem`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export default function Social() {
  const { state, dispatch } = useStore();
  const s = state.social;

  const [ytForm, setYtForm] = useState({ apiKey: s.youtube?.apiKey||'', channelId: s.youtube?.channelId||'' });
  const [igForm, setIgForm] = useState({ token: s.instagram?.accessToken||'', userId: s.instagram?.userId||'' });
  const [ttForm, setTtForm] = useState({ token: s.tiktok?.accessToken||'' });

  const [ytLoading, setYtLoading] = useState(false);
  const [igLoading, setIgLoading] = useState(false);
  const [ttLoading, setTtLoading] = useState(false);

  const connectYT = async () => {
    if(!ytForm.apiKey || !ytForm.channelId) return;
    setYtLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${ytForm.channelId}&key=${ytForm.apiKey}`);
      const data = await res.json();
      if (!res.ok || !data.items?.length) throw new Error(data.error?.message || 'Canal no encontrado');
      const stats = data.items[0].statistics;
      
      // Fetch latest 50 videos
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytForm.channelId}&order=date&type=video&maxResults=50&key=${ytForm.apiKey}`);
      const searchData = await searchRes.json();
      
      let posts = [];
      if (searchData.items && searchData.items.length > 0) {
        const videoIds = searchData.items.map(i => i.id.videoId).join(',');
        const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${ytForm.apiKey}`);
        const statsData = await statsRes.json();
        
        posts = searchData.items.map(item => {
          const stat = statsData.items?.find(s => s.id === item.id.videoId)?.statistics || {};
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            platform: 'youtube',
            views: formatNum(parseInt(stat.viewCount || 0)),
            likes: formatNum(parseInt(stat.likeCount || 0)),
            date: formatRelDate(item.snippet.publishedAt),
            rawDate: item.snippet.publishedAt,
            icon: '▶'
          };
        });
      }

      dispatch({ type:'SET_SOCIAL', payload: {
        youtube: { ...ytForm, connected:true, stats: { subs:parseInt(stats.subscriberCount).toLocaleString(), views:parseInt(stats.viewCount).toLocaleString(), videos:parseInt(stats.videoCount).toLocaleString() } }
      }});
      if (posts.length > 0) dispatch({ type: 'ADD_POSTS', payload: posts });
      showToast('YouTube conectado ✓');
    } catch(e) { alert(e.message); }
    setYtLoading(false);
  };

  const connectIG = async () => {
    if(!igForm.token || !igForm.userId) return;
    setIgLoading(true);
    try {
      const res = await fetch(`https://graph.instagram.com/${igForm.userId}?fields=followers_count,media_count&access_token=${igForm.token}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Error de conexión');
      
      // Fetch latest 50 media
      let posts = [];
      try {
        const mediaRes = await fetch(`https://graph.instagram.com/${igForm.userId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count&access_token=${igForm.token}&limit=50`);
        const mediaData = await mediaRes.json();
        if (mediaData.data) {
          posts = mediaData.data.map(item => ({
            id: item.id,
            title: item.caption ? (item.caption.slice(0, 50) + (item.caption.length > 50 ? '...' : '')) : 'Post sin título',
            platform: 'instagram',
            views: formatNum(item.comments_count || 0) + ' cmts', // Usamos comentarios si no hay vistas disponibles
            likes: formatNum(item.like_count || 0),
            date: formatRelDate(item.timestamp),
            rawDate: item.timestamp,
            icon: '📸'
          }));
        }
      } catch(e) { console.warn('No se pudieron obtener posts de IG', e); }

      dispatch({ type:'SET_SOCIAL', payload: {
        instagram: { ...igForm, connected:true, stats: { followers:(data.followers_count||0).toLocaleString(), reach:'—', posts:(data.media_count||0).toLocaleString() } }
      }});
      if (posts.length > 0) dispatch({ type: 'ADD_POSTS', payload: posts });
      showToast('Instagram conectado ✓');
    } catch(e) { alert(e.message); }
    setIgLoading(false);
  };

  const connectTT = async () => {
    if(!ttForm.token) return;
    setTtLoading(true);
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count', { headers: { Authorization: `Bearer ${ttForm.token}` } });
      const data = await res.json();
      if (!res.ok || data.error?.code !== 'ok') throw new Error(data.error?.message || 'Error de conexión');
      const u = data.data?.user;
      dispatch({ type:'SET_SOCIAL', payload: {
        tiktok: { ...ttForm, connected:true, stats: { followers:(u?.follower_count||0).toLocaleString(), likes:(u?.likes_count||0).toLocaleString(), videos:(u?.video_count||0).toLocaleString() } }
      }});
      showToast('TikTok conectado ✓');
    } catch(e) { alert(e.message); }
    setTtLoading(false);
  };

  return (
    <div className={`${styles.page} fade-up`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Redes Sociales</h1>
          <p className={styles.subtitle}>Conecta tus plataformas y ve tus métricas</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* YouTube */}
        <div className={`${styles.card} glass`}>
          <div className={`${styles.cardHeader} ${styles.youtube}`}>
            <span className={styles.icon}>▶</span>
            <h3 style={{flex:1}}>YouTube</h3>
            <div className={`${styles.dot} ${s.youtube?.connected ? styles.connected : ''}`}/>
          </div>
          <p className={styles.desc}>Conecta via YouTube Data API v3 para ver suscriptores, views y estadísticas.</p>
          {s.youtube?.connected && (
            <div className={styles.statsPanel}>
              <div className={styles.stat}><span className={styles.val}>{s.youtube.stats.subs}</span><span className={styles.lbl}>Subs</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.youtube.stats.views}</span><span className={styles.lbl}>Views</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.youtube.stats.videos}</span><span className={styles.lbl}>Videos</span></div>
            </div>
          )}
          <input className="glass-input" placeholder="YouTube API Key" value={ytForm.apiKey} onChange={e=>setYtForm(f=>({...f,apiKey:e.target.value}))} />
          <input className="glass-input" placeholder="Channel ID (UCxxxx...)" value={ytForm.channelId} onChange={e=>setYtForm(f=>({...f,channelId:e.target.value}))} />
          <button className="btn-primary" style={{width:'100%',marginTop:8}} onClick={connectYT} disabled={ytLoading}>
            {ytLoading ? 'Conectando...' : (s.youtube?.connected ? 'Reconectar' : 'Conectar YouTube')}
          </button>
        </div>

        {/* Instagram */}
        <div className={`${styles.card} glass`}>
          <div className={`${styles.cardHeader} ${styles.instagram}`}>
            <span className={styles.icon}>◈</span>
            <h3 style={{flex:1}}>Instagram</h3>
            <div className={`${styles.dot} ${s.instagram?.connected ? styles.connected : ''}`}/>
          </div>
          <p className={styles.desc}>Conecta via Instagram Graph API para ver seguidores y alcance.</p>
          {s.instagram?.connected && (
            <div className={styles.statsPanel}>
              <div className={styles.stat}><span className={styles.val}>{s.instagram.stats.followers}</span><span className={styles.lbl}>Seguidores</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.instagram.stats.reach}</span><span className={styles.lbl}>Alcance</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.instagram.stats.posts}</span><span className={styles.lbl}>Posts</span></div>
            </div>
          )}
          <input className="glass-input" placeholder="Access Token" value={igForm.token} onChange={e=>setIgForm(f=>({...f,token:e.target.value}))} />
          <input className="glass-input" placeholder="Instagram User ID" value={igForm.userId} onChange={e=>setIgForm(f=>({...f,userId:e.target.value}))} />
          <button className="btn-primary" style={{width:'100%',marginTop:8}} onClick={connectIG} disabled={igLoading}>
            {igLoading ? 'Conectando...' : (s.instagram?.connected ? 'Reconectar' : 'Conectar Instagram')}
          </button>
        </div>

        {/* TikTok */}
        <div className={`${styles.card} glass`}>
          <div className={`${styles.cardHeader} ${styles.tiktok}`}>
            <span className={styles.icon}>♪</span>
            <h3 style={{flex:1}}>TikTok</h3>
            <div className={`${styles.dot} ${s.tiktok?.connected ? styles.connected : ''}`}/>
          </div>
          <p className={styles.desc}>Conecta via TikTok Display API para ver seguidores y estadísticas.</p>
          {s.tiktok?.connected && (
            <div className={styles.statsPanel}>
              <div className={styles.stat}><span className={styles.val}>{s.tiktok.stats.followers}</span><span className={styles.lbl}>Seguidores</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.tiktok.stats.likes}</span><span className={styles.lbl}>Likes</span></div>
              <div className={styles.stat}><span className={styles.val}>{s.tiktok.stats.videos}</span><span className={styles.lbl}>Videos</span></div>
            </div>
          )}
          <input className="glass-input" placeholder="TikTok Access Token" value={ttForm.token} onChange={e=>setTtForm(f=>({...f,token:e.target.value}))} />
          <button className="btn-primary" style={{width:'100%',marginTop:8}} onClick={connectTT} disabled={ttLoading}>
            {ttLoading ? 'Conectando...' : (s.tiktok?.connected ? 'Reconectar' : 'Conectar TikTok')}
          </button>
        </div>

        {/* Guide */}
        <div className={`${styles.card} glass`}>
          <h3 style={{marginBottom:16,fontSize:'1rem'}}>📖 Guía de conexión</h3>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <div><strong>YouTube:</strong> Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer">Google Cloud</a>, crea proyecto, habilita YouTube Data API v3 y genera API Key.</div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <div><strong>Instagram:</strong> Ve a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer">Meta Developers</a>, crea app, conecta IG Business y genera Access Token.</div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <div><strong>TikTok:</strong> Ve a <a href="https://developers.tiktok.com" target="_blank" rel="noreferrer">TikTok Developers</a>, registra app y obtén Access Token.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
