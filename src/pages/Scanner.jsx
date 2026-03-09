import { useState, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'

const STORAGE_KEY_MODEL = 'gmodel'
const STORAGE_KEY_APIKEY = 'gkey'

export default function Scanner() {
  const { user } = useUser()
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY_APIKEY) || '')
  const [showKey, setShowKey] = useState(false)
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem(STORAGE_KEY_MODEL) || '')
  const [keyStatus, setKeyStatus] = useState({ msg: activeModel ? `✓ Verified — ${activeModel}` : '', cls: activeModel ? 'ok' : '' })
  const [imgB64, setImgB64] = useState(null)
  const [imgMime, setImgMime] = useState('image/jpeg')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeStatus, setAnalyzeStatus] = useState({ msg: '', cls: '' })
  const [result, setResult] = useState(null)
  const [logStatus, setLogStatus] = useState('')
  const fileRef = useRef()
  const cameraRef = useRef()

  async function verifyKey() {
    if (!apiKey.trim()) { setKeyStatus({ msg: 'Enter your API key first.', cls: 'err' }); return }
    setKeyStatus({ msg: 'Fetching models...', cls: 'info' })
    try {
      const lr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`)
      const ld = await lr.json()
      if (!lr.ok) throw new Error(ld.error?.message || 'Invalid API key')
      const models = (ld.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent') && m.name.includes('gemini'))
        .map(m => m.name.replace('models/', ''))
      if (!models.length) throw new Error('No Gemini models found.')
      for (let i = 0; i < models.length; i++) {
        const model = models[i]
        setKeyStatus({ msg: `Testing ${i+1}/${models.length}: ${model}`, cls: 'info' })
        try {
          const tr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
          })
          if (tr.ok) {
            setActiveModel(model)
            localStorage.setItem(STORAGE_KEY_APIKEY, apiKey.trim())
            localStorage.setItem(STORAGE_KEY_MODEL, model)
            setKeyStatus({ msg: `✓ Ready! Using: ${model}`, cls: 'ok' })
            return
          }
        } catch {}
        await new Promise(r => setTimeout(r, 200))
      }
      throw new Error('All models failed. Try a new API key.')
    } catch (e) {
      setKeyStatus({ msg: `Error: ${e.message}`, cls: 'err' })
    }
  }

  function loadFile(file) {
    if (!file) return
    setImgMime(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = e => {
      setImgB64(e.target.result.split(',')[1])
      setResult(null)
      setLogStatus('')
      setAnalyzeStatus({ msg: '', cls: '' })
    }
    reader.readAsDataURL(file)
  }

  async function analyze() {
    if (!imgB64 || !activeModel) return
    setAnalyzing(true)
    setAnalyzeStatus({ msg: `Analyzing with ${activeModel}...`, cls: 'info' })
    setResult(null)
    const prompt = 'You are a nutrition expert. Analyze this food image. Return ONLY raw JSON, no markdown: {"foodName":"string","emoji":"string","calories":500,"protein":30,"carbs":40,"fat":20,"fiber":5,"servingSize":"string","deficitTip":"string","breakdown":[{"item":"string","calories":100}]}'
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ inline_data: { mime_type: imgMime, data: imgB64 } }, { text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'API error')
      let text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim()
      text = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
      const s = text.indexOf('{'), e = text.lastIndexOf('}')
      if (s === -1) throw new Error('Could not parse response. Try again.')
      const r = JSON.parse(text.substring(s, e + 1))
      setResult(r)
      setAnalyzeStatus({ msg: '', cls: '' })
    } catch (e) {
      setAnalyzeStatus({ msg: `Error: ${e.message}`, cls: 'err' })
    }
    setAnalyzing(false)
  }

  function addToLog() {
    if (!result) return
    const dateKey = new Date().toISOString().split('T')[0]
    const entries = JSON.parse(localStorage.getItem(`log_${dateKey}`) || '[]')
    const now = new Date()
    entries.push({
      id: Date.now(),
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`,
      ...result
    })
    localStorage.setItem(`log_${dateKey}`, JSON.stringify(entries))
    setLogStatus('added')
    setTimeout(() => setLogStatus(''), 2500)
  }

  function mbar(label, val, unit, color, max) {
    const pct = Math.min((val / max) * 100, 100)
    return (
      <div key={label}>
        <div className="mrow"><span>{label}</span><span className="mval">{val}{unit}</span></div>
        <div className="barbg"><div className="barfill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} /></div>
      </div>
    )
  }

  const keyVerified = !!activeModel

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#ff6b35', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
          AI Nutrition Scanner
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem,8vw,2.8rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          Hey {user?.firstName || 'there'} 👋<br /><span className="grad">Scan your food.</span>
        </h1>
      </div>

      {/* API KEY */}
      {!keyVerified && (
        <div className="card">
          <div className="card-title">Google Gemini API Key</div>
          <p style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginBottom: 12, lineHeight: 1.7 }}>
            Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#ff6b35' }}>aistudio.google.com/apikey</a>
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza..."
              style={{ flex: 1, padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a3a', borderRadius: 12, color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: 13, outline: 'none' }}
            />
            <button onClick={() => setShowKey(!showKey)} style={{ padding: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2a3a', borderRadius: 12, color: '#888', cursor: 'pointer', fontSize: 16 }}>👁</button>
          </div>
          <button onClick={verifyKey} style={{ width: '100%', padding: 13, background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2a3a', borderRadius: 12, color: '#aaa', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>
            🔍 Verify Key
          </button>
        </div>
      )}

      {keyStatus.msg && <div className={`ibox ${keyStatus.cls}`}>{keyStatus.msg}</div>}

      {keyVerified && (
        <div style={{ marginBottom: 6 }}>
          <div className={`ibox ok`} style={{ marginBottom: 8 }}>✓ API Key verified — {activeModel}</div>
        </div>
      )}

      {/* UPLOAD */}
      <div
        style={{ border: `2px dashed ${imgB64 ? '#222' : '#2a2a3a'}`, borderStyle: imgB64 ? 'solid' : 'dashed', borderRadius: 20, overflow: 'hidden', minHeight: imgB64 ? 'auto' : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: imgB64 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.02)', marginBottom: 16, position: 'relative' }}
        onClick={() => !imgB64 && fileRef.current.click()}
      >
        {imgB64 ? (
          <>
            <img src={`data:${imgMime};base64,${imgB64}`} alt="food" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 18 }} />
            <button onClick={e => { e.stopPropagation(); setImgB64(null); setResult(null) }} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, fontSize: 15, cursor: 'pointer' }}>✕</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📸</div>
            <p style={{ color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>tap to upload a food photo</p>
          </div>
        )}
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn-sec" onClick={() => cameraRef.current.click()}>📷 Camera</button>
        <button className="btn-sec" onClick={() => fileRef.current.click()}>🖼 Gallery</button>
      </div>

      {imgB64 && (
        <button className="btn-main" onClick={analyze} disabled={analyzing || !activeModel}>
          {analyzing ? <><span className="spin">⟳</span> Analyzing...</> : '🔍 Analyze Nutrition'}
        </button>
      )}

      {analyzeStatus.msg && <div className={`ibox ${analyzeStatus.cls}`} style={{ marginTop: 12 }}>{analyzeStatus.msg}</div>}

      {/* RESULTS */}
      {result && (
        <div className="fadeUp" style={{ marginTop: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(247,147,30,0.08))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 20, padding: 24, marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 46, marginBottom: 4 }}>{result.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{result.foodName}</div>
            <div style={{ color: '#555', fontFamily: 'DM Mono, monospace', fontSize: 12, marginBottom: 16 }}>{result.servingSize}</div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg,#ff6b35,#f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.calories}</div>
            <div style={{ color: '#555', fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>calories</div>
          </div>

          <div className="card">
            <div className="card-title">Macronutrients</div>
            {mbar('Protein', result.protein, 'g', '#4ade80', 60)}
            {mbar('Carbs',   result.carbs,   'g', '#60a5fa', 150)}
            {mbar('Fat',     result.fat,     'g', '#facc15', 80)}
            {mbar('Fiber',   result.fiber,   'g', '#a78bfa', 30)}
          </div>

          {result.breakdown?.length > 0 && (
            <div className="card">
              <div className="card-title">Breakdown</div>
              {result.breakdown.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < result.breakdown.length - 1 ? '1px solid #1a1a2a' : 'none' }}>
                  <span style={{ fontSize: 14, color: '#ccc' }}>{item.item}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#ff6b35', fontWeight: 600 }}>{item.calories} kcal</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontSize: 11, color: '#4ade80', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>Deficit Tip</div>
              <div style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6 }}>{result.deficitTip}</div>
            </div>
          </div>

          <button
            className="btn-green"
            onClick={addToLog}
            style={{ background: logStatus === 'added' ? 'rgba(74,222,128,0.2)' : undefined }}
          >
            {logStatus === 'added' ? '✓ Added to Today\'s Log!' : '✚ Add to Today\'s Log'}
          </button>
          <button className="btn-ghost" onClick={() => { setImgB64(null); setResult(null) }}>↩ Scan Another Food</button>
        </div>
      )}
    </div>
  )
}
