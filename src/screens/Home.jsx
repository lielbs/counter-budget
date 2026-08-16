import { useMemo } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatMoney, formatMonth, shiftMonth } from '../utils/format'
import { Progress, EmptyState, Icon } from '../components/UI'
import { useNavigate } from 'react-router-dom'

export default function Home({ month, setMonth, openTransaction }) {
  const { data } = useBudget()
  const navigate = useNavigate()
  const metrics = useMemo(() => {
    const transactions = data.transactions.filter(item => item.date.startsWith(month))
    const income = transactions.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0)
    const expense = transactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
    const categories = data.categories.map(category => {
      const spent = transactions.filter(item => item.type === 'expense' && item.categoryId === category.id).reduce((sum, item) => sum + Number(item.amount), 0)
      const budget = data.monthlyBudgets.find(item => item.month === month && item.categoryId === category.id)?.amount || 0
      return { ...category, spent, budget, percent: budget ? (spent / budget) * 100 : 0 }
    })
    return { income, expense, categories }
  }, [data, month])
  const budgetTotal = metrics.categories.reduce((sum, item) => sum + Number(item.budget), 0)
  const usagePercent = metrics.expense ? Math.min(100, Math.round(metrics.expense / Math.max(budgetTotal, metrics.expense) * 100)) : 0
  const chartItems = metrics.categories.filter(item => item.spent > 0)
  let angle = 0
  const gradient = chartItems.length ? chartItems.map(item => { const start = angle; angle += (item.spent / metrics.expense) * 360; return `${item.color} ${start}deg ${angle}deg` }).join(',') : 'var(--surface-muted) 0deg 360deg'
  const status = item => item.percent > 100 ? ['var(--danger)', 'חריגה'] : item.percent >= 80 ? ['var(--warning)', 'קרוב למסגרת'] : [item.color, 'במסגרת']

  return <div className="screen home-screen">
    <header className="topbar home-topbar">
      <div className="title-lockup"><span className="mini-brand" aria-hidden="true">C</span><div><span className="eyebrow">מרכז השליטה שלך</span><h1>היי, טוב לראות אותך</h1></div></div>
      <div className="level-pill"><span><i className="online-dot" /> רמה {data.userStats.level}</span><strong>{data.userStats.xp} XP</strong></div>
    </header>

    <div className="month-switcher"><button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="החודש הבא"><Icon name="chevron" /></button><strong>{formatMonth(month)}</strong><button className="flip" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="החודש הקודם"><Icon name="chevron" /></button></div>

    <section className="hero-card">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-copy"><div className="hero-kicker"><i /> תקציב חי · {formatMonth(month)}</div><span>יתרה זמינה החודש</span><strong>{formatMoney(metrics.income - metrics.expense, data.profile.currency)}</strong><p>{budgetTotal ? `${Math.max(0, Math.round((1 - metrics.expense / budgetTotal) * 100))}% ממסגרת ההוצאות עדיין פנויה` : 'מומלץ להגדיר מסגרת חודשית'}</p><div className="hero-security"><span>⌾ נתונים מקומיים</span><span>◈ הצפנה זמינה</span></div></div>
      <div className="hero-orb" style={{ '--usage': `${usagePercent * 3.6}deg` }}><div><span>{usagePercent}%</span><small>ניצול</small></div></div>
    </section>

    <section className="metric-grid">
      <article><span className="metric-icon income">↙</span><div><span>הכנסות</span><strong>{formatMoney(metrics.income, data.profile.currency)}</strong></div></article>
      <article><span className="metric-icon expense">↗</span><div><span>הוצאות</span><strong>{formatMoney(metrics.expense, data.profile.currency)}</strong></div></article>
      <article><span className="metric-icon balance">≈</span><div><span>מאזן</span><strong className={metrics.income - metrics.expense < 0 ? 'negative' : ''}>{formatMoney(metrics.income - metrics.expense, data.profile.currency)}</strong></div></article>
    </section>

    <div className="section-heading"><div><span className="eyebrow">תמונת מצב</span><h2>התקציבים שלך</h2></div><button className="text-button" onClick={() => navigate('/settings')}>עריכה</button></div>
    {!metrics.categories.some(item => item.budget) ? <EmptyState title="עוד לא הוגדר תקציב" text="הגדירו מסגרת לכל קטגוריה כדי לראות כמה נשאר." /> : <div className="budget-grid">{metrics.categories.filter(item => item.budget).map(item => {
      const [color, label] = status(item)
      return <article className={`budget-card ${item.percent > 100 ? 'over' : ''}`} key={item.id}>
        <div className="budget-head"><span className="category-icon" style={{ background: `${item.color}20` }}>{item.icon}</span><div><h3>{item.name}</h3><small style={{ color }}>{label}</small></div><strong>{Math.round(item.percent)}%</strong></div>
        <Progress value={item.percent} color={color} label={`${item.name}: ${Math.round(item.percent)} אחוז`} />
        <div className="budget-foot"><span>נוצלו {formatMoney(item.spent, data.profile.currency)}</span><strong>נותרו {formatMoney(item.budget - item.spent, data.profile.currency)}</strong></div>
      </article>
    })}</div>}

    <section className="chart-card">
      <div className="section-heading"><div><span className="eyebrow">פילוח הוצאות</span><h2>לאן הכסף הלך?</h2></div></div>
      {metrics.expense ? <div className="chart-layout"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div><strong>{formatMoney(metrics.expense, data.profile.currency)}</strong><span>סה״כ</span></div></div><div className="legend">{chartItems.map(item => <div key={item.id}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{Math.round(item.spent / metrics.expense * 100)}%</strong></div>)}</div></div> : <EmptyState icon="📊" title="הגרף מחכה לתנועה הראשונה" text="הוסיפו הוצאה כדי לראות את הפילוח החודשי." action={<button className="secondary-button" onClick={openTransaction}>הוספת הוצאה</button>} />}
    </section>
  </div>
}
