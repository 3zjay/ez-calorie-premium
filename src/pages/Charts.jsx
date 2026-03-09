import { useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

function getLog(k) {
  try { return JSON.parse(localStorage.getItem(`log_${k}`) || '[]') } catch { return [] }
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

export default function Charts() {
  const [weekData, setWeekData] = useState([])
  const goal = parseInt(localStorage.getItem('calorie_goal') || '0')

  useEffect(() => {
    const days = getLast7Days()
    setWeekData(days.map(dateKey => {
      const entries = getLog(dateKey)
      const totals = entries.reduce((a, e) => ({
        calories: a.calories + (e.calories || 0),
        protein:  a.protein  + (e.protein  || 0),
        carbs:    a.carbs    + (e.carbs    || 0),
        fat:      a.fat      + (e.fat      || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
      return { date: dateKey, label: dateKey.slice(5), ...totals, count: entries.length }
    }))
  }, [])

  const labels = weekData.map(d => d.label)
  const avgCals = weekData.filter(d => d.count > 0).reduce((s, d) => s + d.calories, 0) / (weekData.filter(d => d.count > 0).length || 1)
  const bestDay = [...weekData].sort((a, b) => {
    if (!goal) return 0
    return Math.abs(a.calories - goal) - Math.abs(b.calories - goal)
  })[0]
  const streak = (() => {
    if (!goal) return 0
    let s = 0
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].calories > 0 && weekData[i].calories <= goal) s++
      else break
    }
    return s
  })()

  const chartDefaults = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#aaa', borderColor: '#2a2a3a', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#555', font: { family: 'DM Mono' } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#555', font: { family: 'DM Mono' } } }
    }
  }

  const calBarData = {
    labels,
    datasets: [
      {
        label: 'Calories',
        data: weekData.map(d => d.calories),
        backgroundColor: weekData.map(d => d.calories === 0 ? 'rgba(255,255,255,0.05)' : goal > 0 && d.calories > goal ? 'rgba(239,68,68,0.7)' : 'rgba(255,107,53,0.8)'),
        borderRadius: 8,
      },
      ...(goal > 0 ? [{
        label: 'Goal',
        data: Array(7).fill(goal),
        type: 'line',
        borderColor: 'rgba(74,222,128,0.5)',
        borderDash: [6, 4],
        pointRadius: 0,
        borderWidth: 2,
      }] : [])
    ]
  }

  const macroLineData = {
    labels,
    datasets: [
      { label: 'Protein', data: weekData.map(d => d.protein), borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', tension: 0.4, fill: false, pointRadius: 4 },
      { label: 'Carbs',   data: weekData.map(d => d.carbs),   borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)', tension: 0.4, fill: false, pointRadius: 4 },
      { label: 'Fat',     data: weekData.map(d => d.fat),     borderColor: '#facc15', backgroundColor: 'rgba(250,204,21,0.1)',  tension: 0.4, fill: false, pointRadius: 4 },
    ]
  }

  const macroChartOptions = {
    ...chartDefaults,
    plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#888', font: { family: 'DM Mono', size: 11 }, boxWidth: 12, padding: 16 } } }
  }

  const hasData = weekData.some(d => d.count > 0)

  return (
    <div className="page">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#ff6b35', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
          Weekly Summary
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem,8vw,2.6rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          Your <span className="grad">trends</span>
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          ['Avg/day', Math.round(avgCals) || '—', 'kcal'],
          ['Goal days', `${streak}/7`, 'streak'],
          ['Best day', bestDay?.label || '—', goal ? 'closest' : 'no goal'],
        ].map(([label, val, sub]) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 14, marginBottom: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ff6b35' }}>{val}</div>
            <div style={{ fontSize: 10, color: '#555', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#333', fontFamily: 'DM Mono, monospace', fontSize: 13, lineHeight: 2 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          No data yet this week.<br />Scan food and add it to your log<br />to see charts appear here!
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-title">Daily Calories{goal > 0 ? ' vs Goal' : ''}</div>
            <Bar data={calBarData} options={chartDefaults} />
          </div>

          <div className="card">
            <div className="card-title">Macros This Week (g)</div>
            <Line data={macroLineData} options={macroChartOptions} />
          </div>
        </>
      )}
    </div>
  )
}
