import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import TransactionModal from './components/TransactionModal'
import Onboarding from './components/Onboarding'
import LockScreen from './components/LockScreen'
import { Icon } from './components/UI'
import { useBudget } from './context/BudgetContext'
import { currentMonth } from './data/seed'
import Home from './screens/Home'
import Transactions from './screens/Transactions'
import Savings from './screens/Savings'
import Quests from './screens/Quests'
import Settings from './screens/Settings'

export default function App() {
  const { data, toast, locked } = useBudget()
  const [month, setMonth] = useState(currentMonth())
  const [transaction, setTransaction] = useState(null)
  const [transactionOpen, setTransactionOpen] = useState(false)
  const openTransaction = (item = null) => { setTransaction(item); setTransactionOpen(true) }
  if (locked) return <LockScreen />
  if (!data.profile.onboarded) return <Onboarding />
  return <div className="app-shell">
    <div className="ambient-field" aria-hidden="true"><i /><i /><i /></div>
    <main>
      <Routes>
        <Route path="/" element={<Home month={month} setMonth={setMonth} openTransaction={() => openTransaction()} />} />
        <Route path="/transactions" element={<Transactions openTransaction={openTransaction} />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/settings" element={<Settings month={month} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <button className="fab" onClick={() => openTransaction()} aria-label="הוספת תנועה"><Icon name="plus" size={28} /></button>
    <BottomNav />
    {transactionOpen && <TransactionModal transaction={transaction} onClose={() => setTransactionOpen(false)} />}
    {toast && <div className="toast" role="status">✓ {toast}</div>}
  </div>
}
