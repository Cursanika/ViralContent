// src/services/gemini.js — Gemini AI integration

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt, apiKey) {
  if (!apiKey) throw new Error('No API key configured. Please add your Gemini API key in Settings.');
  const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 2048 }
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseJSON(raw) {
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

export async function generateQuickIdea(niche, platform, apiKey) {
  const prompt = `Eres un experto en contenido viral para ${platform}. Genera UNA idea de video sobre el nicho "${niche}".
Responde SOLO con JSON:
{"title":"Título atractivo","hook":"Primera frase gancho (máx 12 palabras)","angle":"Ángulo único viral","cta":"Call to action"}`;
  return parseJSON(await callGemini(prompt, apiKey));
}

export async function generateHooks(niche, topic, platform, apiKey) {
  const prompt = `Eres copywriter viral para ${platform}. Genera 5 hooks ultra virales sobre "${topic}" en el nicho "${niche}".
Responde SOLO con JSON array: ["hook1","hook2","hook3","hook4","hook5"]`;
  return parseJSON(await callGemini(prompt, apiKey));
}

export async function generateScript(params, apiKey) {
  const { platform, niche, topic, tone, audience, keywords } = params;
  const durations = { tiktok:'30-60s', instagram:'30-90s', 'youtube-short':'60s', youtube:'8-12min' };
  const prompt = `Eres guionista experto en contenido viral para ${platform} (${durations[platform]||'60s'}).
Nicho: ${niche} | Tema: ${topic} | Tono: ${tone} | Audiencia: ${audience} | Keywords: ${keywords||'—'}

Crea el guion con estas secciones:
[HOOK - 0:00-0:05]
[CONTEXTO/PROBLEMA]
[DESARROLLO]
[VALOR/SOLUCIÓN]
[CTA FINAL]

Usa lenguaje natural y conversacional. Incluye indicaciones de dirección entre (paréntesis).`;
  return callGemini(prompt, apiKey);
}

export async function analyzeVirality(script, platform, apiKey) {
  const prompt = `Analiza el potencial viral de este contenido para ${platform}:
"""
${script}
"""
Responde SOLO con este JSON exacto:
{
  "score": <0-100>,
  "verdict": "<una frase veredicto>",
  "metrics": [
    {"label":"Hook","value":<0-100>,"comment":"breve"},
    {"label":"Retención","value":<0-100>,"comment":"breve"},
    {"label":"Emoción","value":<0-100>,"comment":"breve"},
    {"label":"Claridad","value":<0-100>,"comment":"breve"},
    {"label":"Compartibilidad","value":<0-100>,"comment":"breve"}
  ],
  "suggestions": [
    {"icon":"🎯","text":"mejora 1"},
    {"icon":"🔥","text":"mejora 2"},
    {"icon":"⚡","text":"mejora 3"},
    {"icon":"💡","text":"mejora 4"}
  ],
  "improved_hook": "<hook mejorado>"
}`;
  return parseJSON(await callGemini(prompt, apiKey));
}
