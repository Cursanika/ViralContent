// src/utils/toast.js
export function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  const colors = { success: 'rgba(167,139,250,0.92)', error: 'rgba(248,113,113,0.92)', info: 'rgba(96,165,250,0.92)' };
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', bottom: '28px', right: '28px', zIndex: '9999',
    background: colors[type] || colors.success, color: '#fff',
    padding: '12px 22px', borderRadius: '12px', fontWeight: '600',
    fontSize: '0.875rem', backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontFamily: 'Inter,sans-serif',
    transition: 'opacity 0.3s ease', opacity: '0'
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

export function today() { return new Date().toISOString().split('T')[0]; }
