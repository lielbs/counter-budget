import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { Modal } from './UI'

const today = () => new Date().toISOString().slice(0, 10)

export default function TransactionModal({ transaction, onClose }) {
  const { data, actions } = useBudget()
  const [form, setForm] = useState(() => transaction || { type: 'expense', amount: '', categoryId: data.categories[0]?.id || '', date: today(), note: '' })
  const [error, setError] = useState('')
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }))
  const submit = event => {
    event.preventDefault()
    if (!Number(form.amount) || Number(form.amount) <= 0) return setError('יש להזין סכום גדול מאפס')
    if (form.type === 'expense' && !form.categoryId) return setError('יש לבחור קטגוריה')
    actions.saveTransaction({ ...form, categoryId: form.type === 'income' ? null : form.categoryId })
    onClose()
  }
  return <Modal title={transaction ? 'עריכת תנועה' : 'תנועה חדשה'} onClose={onClose}>
    <form className="stack" onSubmit={submit}>
      <div className="segmented" aria-label="סוג תנועה">
        <button type="button" className={form.type === 'expense' ? 'active' : ''} onClick={() => set('type', 'expense')}>הוצאה</button>
        <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => set('type', 'income')}>הכנסה</button>
      </div>
      <label className="amount-field"><span>סכום</span><div><span>₪</span><input autoFocus inputMode="decimal" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" /></div></label>
      {form.type === 'expense' && <label>קטגוריה<select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>{data.categories.map(category => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label>}
      <div className="two-columns"><label>תאריך<input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></label><label>הערה<input value={form.note} maxLength="80" onChange={e => set('note', e.target.value)} placeholder="למשל: קניות לשבת" /></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit">{transaction ? 'שמירת שינויים' : 'הוספת תנועה'}</button>
    </form>
  </Modal>
}
