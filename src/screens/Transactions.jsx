import { useMemo, useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatDate, formatMoney } from '../utils/format'
import { ConfirmButton, EmptyState, Icon } from '../components/UI'

export default function Transactions({ openTransaction }) {
  const { data, actions } = useBudget()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const items = useMemo(() => data.transactions.filter(item => {
    const category = data.categories.find(entry => entry.id === item.categoryId)?.name || 'הכנסה'
    return (filter === 'all' || item.type === filter) && `${item.note} ${category}`.toLowerCase().includes(query.toLowerCase())
  }).sort((a, b) => b.date.localeCompare(a.date)), [data, query, filter])
  return <div className="screen">
    <header className="topbar"><div><span className="eyebrow">כל מה שנכנס ויוצא</span><h1>תנועות</h1></div><button className="secondary-button compact" onClick={() => openTransaction()}>תנועה חדשה</button></header>
    <div className="toolbar"><label className="search"><Icon name="search" size={20} /><input aria-label="חיפוש תנועות" value={query} onChange={e => setQuery(e.target.value)} placeholder="חיפוש לפי הערה או קטגוריה" /></label><div className="filter-chips">{[['all','הכול'],['expense','הוצאות'],['income','הכנסות']].map(([value,label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    {items.length ? <section className="transaction-list">{items.map(item => {
      const category = data.categories.find(entry => entry.id === item.categoryId)
      return <article key={item.id} className="transaction-row"><span className="category-icon" style={{ background: item.type === 'income' ? 'var(--success-soft)' : `${category?.color || '#888'}20` }}>{item.type === 'income' ? '↙' : category?.icon || '💳'}</span><div className="transaction-main"><strong>{item.note || (item.type === 'income' ? 'הכנסה' : category?.name)}</strong><span>{formatDate(item.date)} · {item.type === 'income' ? 'הכנסה' : category?.name}</span></div><strong className={item.type === 'income' ? 'positive' : ''}>{item.type === 'income' ? '+' : '−'}{formatMoney(item.amount, data.profile.currency)}</strong><div className="row-actions"><button className="icon-button" onClick={() => openTransaction(item)} aria-label="עריכה"><Icon name="edit" size={19} /></button><ConfirmButton onConfirm={() => actions.deleteTransaction(item.id)}>מחיקה</ConfirmButton></div></article>
    })}</section> : <EmptyState icon="🧾" title="אין תנועות להצגה" text={query || filter !== 'all' ? 'לא מצאנו תוצאות שמתאימות לסינון.' : 'הוסיפו הכנסה או הוצאה והכול יתעדכן מיד.'} action={!query && filter === 'all' ? <button className="primary-button small" onClick={() => openTransaction()}>הוספת תנועה</button> : null} />}
  </div>
}
