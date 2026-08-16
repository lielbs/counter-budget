import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { goalTemplates } from '../data/seed'
import { formatMoney } from '../utils/format'
import { ConfirmButton, EmptyState, Modal, Progress, Icon } from '../components/UI'

const blank = { name: '', icon: '🎯', targetAmount: '', currentAmount: '', targetDate: '' }

export default function Savings() {
  const { data, actions } = useBudget()
  const [editing, setEditing] = useState(null)
  const [adjusting, setAdjusting] = useState(null)
  const [amount, setAmount] = useState('')
  const save = event => { event.preventDefault(); actions.saveGoal(editing); setEditing(null) }
  return <div className="screen">
    <header className="topbar"><div><span className="eyebrow">חלומות עם תוכנית</span><h1>יעדי חיסכון</h1></div><button className="secondary-button compact" onClick={() => setEditing(blank)}>יעד חדש</button></header>
    <section className="template-card"><div><span className="eyebrow">התחלה מהירה</span><h2>למה חוסכים?</h2></div><div className="template-row">{goalTemplates.map(template => <button key={template.name} onClick={() => setEditing({ ...blank, ...template })}><span>{template.icon}</span>{template.name}</button>)}</div></section>
    {data.savingsGoals.length ? <div className="goals-grid">{data.savingsGoals.map(goal => {
      const percent = goal.targetAmount ? Math.min(100, goal.currentAmount / goal.targetAmount * 100) : 0
      return <article className="goal-card" key={goal.id}><div className="goal-top"><span className="goal-icon">{goal.icon}</span><div><h2>{goal.name}</h2>{goal.targetDate && <span>יעד: {new Intl.DateTimeFormat('he-IL').format(new Date(`${goal.targetDate}T12:00:00`))}</span>}</div><div className="row-actions"><button className="icon-button" onClick={() => setEditing(goal)} aria-label="עריכה"><Icon name="edit" size={19} /></button><ConfirmButton onConfirm={() => actions.deleteGoal(goal.id)}>מחיקה</ConfirmButton></div></div><div className="goal-amount"><strong>{formatMoney(goal.currentAmount, data.profile.currency)}</strong><span>מתוך {formatMoney(goal.targetAmount, data.profile.currency)}</span></div><Progress value={percent} color="linear-gradient(90deg, var(--brand), var(--accent))" label={`${goal.name}: ${Math.round(percent)} אחוז`} /><div className="goal-foot"><strong>{Math.round(percent)}%</strong><span>נשארו {formatMoney(Math.max(0, goal.targetAmount - goal.currentAmount), data.profile.currency)}</span></div><button className="primary-button" onClick={() => { setAdjusting(goal); setAmount('') }}>הפקדה או משיכה</button></article>
    })}</div> : <EmptyState icon="🏝️" title="עוד אין יעד על האופק" text="בחרו חלום קטן או גדול, והתחילו להתקדם אליו בקצב שלכם." action={<button className="primary-button small" onClick={() => setEditing(blank)}>יצירת יעד ראשון</button>} />}
    {editing && <Modal title={editing.id ? 'עריכת יעד' : 'יעד חיסכון חדש'} onClose={() => setEditing(null)}><form className="stack" onSubmit={save}><div className="two-columns icon-name"><label>אייקון<input value={editing.icon} maxLength="4" onChange={e => setEditing({ ...editing, icon: e.target.value })} /></label><label>שם היעד<input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="למשל: חופשה ביוון" /></label></div><div className="two-columns"><label>סכום יעד<input required min="1" type="number" value={editing.targetAmount} onChange={e => setEditing({ ...editing, targetAmount: e.target.value })} /></label><label>כבר חסכתי<input min="0" type="number" value={editing.currentAmount} onChange={e => setEditing({ ...editing, currentAmount: e.target.value })} /></label></div><label>תאריך יעד (אופציונלי)<input type="date" value={editing.targetDate || ''} onChange={e => setEditing({ ...editing, targetDate: e.target.value })} /></label><button className="primary-button">שמירת היעד</button></form></Modal>}
    {adjusting && <Modal title={`עדכון ${adjusting.name}`} onClose={() => setAdjusting(null)}><form className="stack" onSubmit={event => { event.preventDefault(); actions.adjustGoal(adjusting.id, amount); setAdjusting(null) }}><p className="modal-hint">סכום חיובי להפקדה, סכום שלילי למשיכה.</p><label className="amount-field"><span>סכום השינוי</span><div><span>₪</span><input autoFocus required type="number" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500 או ‎-200" /></div></label><button className="primary-button">עדכון החיסכון</button></form></Modal>}
  </div>
}
