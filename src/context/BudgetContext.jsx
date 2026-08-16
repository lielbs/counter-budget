import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createSeedData } from '../data/seed'
import { uid } from '../utils/format'
import { decodeSalt, decryptVault, deriveVaultKey, encodeSalt, encryptVault, randomSalt } from '../utils/crypto'

const STORAGE_KEY = 'counter-budget-data-v1'
const VAULT_KEY = 'counter-budget-vault-v1'
const SECURITY_KEY = 'counter-budget-security-v1'
const BudgetContext = createContext(null)

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...createSeedData(), ...JSON.parse(stored) } : createSeedData()
  } catch {
    return createSeedData()
  }
}

const validateImport = (value) => {
  if (!value || typeof value !== 'object') throw new Error('הקובץ אינו מכיל נתונים תקינים')
  for (const key of ['profile', 'categories', 'monthlyBudgets', 'transactions', 'incomeSources', 'savingsGoals', 'sideQuests', 'userStats']) {
    if (!(key in value)) throw new Error(`חסר שדה נדרש: ${key}`)
  }
  for (const key of ['categories', 'monthlyBudgets', 'transactions', 'incomeSources', 'savingsGoals', 'sideQuests']) {
    if (!Array.isArray(value[key])) throw new Error(`השדה ${key} חייב להיות רשימה`)
  }
  return value
}

export function BudgetProvider({ children }) {
  const initialSecurity = localStorage.getItem(SECURITY_KEY)
  const [data, setData] = useState(() => initialSecurity ? createSeedData() : loadData())
  const [toast, setToast] = useState('')
  const [secureEnabled, setSecureEnabled] = useState(Boolean(initialSecurity))
  const [locked, setLocked] = useState(Boolean(initialSecurity))
  const vaultKeyRef = useRef(null)

  useEffect(() => {
    if (locked) return
    if (!secureEnabled) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    else if (vaultKeyRef.current) encryptVault(data, vaultKeyRef.current).then(payload => localStorage.setItem(VAULT_KEY, payload))
  }, [data, secureEnabled, locked])
  useEffect(() => { document.documentElement.dataset.theme = data.profile.theme || 'light' }, [data.profile.theme])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (!secureEnabled || locked) return undefined
    let timer
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => { vaultKeyRef.current = null; setLocked(true) }, 5 * 60 * 1000) }
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach(name => window.addEventListener(name, reset, { passive: true }))
    reset()
    return () => { clearTimeout(timer); events.forEach(name => window.removeEventListener(name, reset)) }
  }, [secureEnabled, locked])

  const update = useCallback((recipe, message) => {
    setData(previous => recipe(structuredClone(previous)))
    if (message) setToast(message)
  }, [])

  const actions = useMemo(() => ({
    saveTransaction(transaction) {
      update(draft => {
        const item = { ...transaction, amount: Number(transaction.amount), createdAt: transaction.createdAt || new Date().toISOString() }
        const index = draft.transactions.findIndex(entry => entry.id === item.id)
        if (index >= 0) draft.transactions[index] = item
        else draft.transactions.unshift({ ...item, id: uid() })
        return draft
      }, transaction.id ? 'התנועה עודכנה' : 'התנועה נוספה')
    },
    deleteTransaction(id) { update(d => ({ ...d, transactions: d.transactions.filter(item => item.id !== id) }), 'התנועה נמחקה') },
    saveCategory(category) {
      update(draft => {
        const index = draft.categories.findIndex(item => item.id === category.id)
        if (index >= 0) draft.categories[index] = { ...draft.categories[index], ...category }
        else draft.categories.push({ ...category, id: uid(), type: 'expense', isDefault: false })
        return draft
      }, 'הקטגוריה נשמרה')
    },
    deleteCategory(id) { update(d => ({ ...d, categories: d.categories.filter(item => item.id !== id), monthlyBudgets: d.monthlyBudgets.filter(item => item.categoryId !== id) }), 'הקטגוריה נמחקה') },
    setBudget(month, categoryId, amount) {
      update(draft => {
        const found = draft.monthlyBudgets.find(item => item.month === month && item.categoryId === categoryId)
        if (found) found.amount = Number(amount)
        else draft.monthlyBudgets.push({ id: uid(), month, categoryId, amount: Number(amount) })
        return draft
      })
    },
    copyPreviousBudget(month, previousMonth) {
      update(draft => {
        const prior = draft.monthlyBudgets.filter(item => item.month === previousMonth)
        draft.monthlyBudgets = draft.monthlyBudgets.filter(item => item.month !== month)
        draft.monthlyBudgets.push(...prior.map(item => ({ ...item, id: uid(), month })))
        return draft
      }, 'התקציב הועתק מהחודש הקודם')
    },
    saveIncomeSource(source) {
      update(draft => {
        const index = draft.incomeSources.findIndex(item => item.id === source.id)
        const item = { ...source, expectedAmount: Number(source.expectedAmount), recurring: true }
        if (index >= 0) draft.incomeSources[index] = item
        else draft.incomeSources.push({ ...item, id: uid() })
        return draft
      }, 'מקור ההכנסה נשמר')
    },
    deleteIncomeSource(id) { update(d => ({ ...d, incomeSources: d.incomeSources.filter(item => item.id !== id) }), 'מקור ההכנסה נמחק') },
    saveGoal(goal) {
      update(draft => {
        const item = { ...goal, targetAmount: Number(goal.targetAmount), currentAmount: Number(goal.currentAmount || 0) }
        const index = draft.savingsGoals.findIndex(entry => entry.id === goal.id)
        if (index >= 0) draft.savingsGoals[index] = item
        else draft.savingsGoals.push({ ...item, id: uid() })
        return draft
      }, 'יעד החיסכון נשמר')
    },
    adjustGoal(id, amount) { update(draft => { const goal = draft.savingsGoals.find(item => item.id === id); goal.currentAmount = Math.max(0, Number(goal.currentAmount) + Number(amount)); return draft }, 'החיסכון עודכן') },
    deleteGoal(id) { update(d => ({ ...d, savingsGoals: d.savingsGoals.filter(item => item.id !== id) }), 'יעד החיסכון נמחק') },
    saveQuest(quest) {
      update(draft => {
        const item = { ...quest, progress: Number(quest.progress || 0), goal: Number(quest.goal), rewardXp: Number(quest.rewardXp), createdAt: quest.createdAt || new Date().toISOString(), status: quest.status || 'active' }
        const index = draft.sideQuests.findIndex(entry => entry.id === quest.id)
        if (index >= 0) draft.sideQuests[index] = item
        else draft.sideQuests.push({ ...item, id: uid() })
        return draft
      }, 'המשימה נשמרה')
    },
    progressQuest(id) {
      update(draft => {
        const quest = draft.sideQuests.find(item => item.id === id)
        if (!quest || quest.status === 'completed') return draft
        quest.progress = Math.min(quest.goal, quest.progress + 1)
        if (quest.progress >= quest.goal) {
          quest.status = 'completed'
          draft.userStats.xp += quest.rewardXp
          draft.userStats.level = Math.floor(draft.userStats.xp / 100) + 1
          draft.userStats.badges = [...new Set([...draft.userStats.badges, 'משימה הושלמה'])]
        }
        return draft
      }, 'ההתקדמות עודכנה')
    },
    deleteQuest(id) { update(d => ({ ...d, sideQuests: d.sideQuests.filter(item => item.id !== id) }), 'המשימה נמחקה') },
    updateProfile(patch) { update(d => ({ ...d, profile: { ...d.profile, ...patch } })) },
    importData(raw) { setData(validateImport(raw)); setToast('הנתונים שוחזרו בהצלחה') },
    resetData() { setData(createSeedData()); setToast('הנתונים אופסו') },
    async enableSecurity(pin) {
      if (!/^\d{6,}$/.test(pin)) throw new Error('יש לבחור קוד בן 6 ספרות לפחות')
      const salt = randomSalt()
      const key = await deriveVaultKey(pin, salt)
      const payload = await encryptVault(data, key)
      localStorage.setItem(SECURITY_KEY, JSON.stringify({ version: 1, salt: encodeSalt(salt) }))
      localStorage.setItem(VAULT_KEY, payload)
      localStorage.removeItem(STORAGE_KEY)
      vaultKeyRef.current = key
      setSecureEnabled(true)
      setLocked(false)
      setToast('ההצפנה הופעלה')
    },
    async unlock(pin) {
      try {
        const meta = JSON.parse(localStorage.getItem(SECURITY_KEY))
        const key = await deriveVaultKey(pin, decodeSalt(meta.salt))
        const decrypted = validateImport(await decryptVault(localStorage.getItem(VAULT_KEY), key))
        vaultKeyRef.current = key
        setData(decrypted)
        setLocked(false)
        return true
      } catch { return false }
    },
    lock() { vaultKeyRef.current = null; setLocked(true) },
    disableSecurity() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.removeItem(SECURITY_KEY)
      localStorage.removeItem(VAULT_KEY)
      vaultKeyRef.current = null
      setSecureEnabled(false)
      setLocked(false)
      setToast('ההצפנה הוסרה')
    },
  }), [update, data])

  return <BudgetContext.Provider value={{ data, actions, toast, secureEnabled, locked }}>{children}</BudgetContext.Provider>
}

// Context and its hook intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export const useBudget = () => {
  const value = useContext(BudgetContext)
  if (!value) throw new Error('useBudget must be used inside BudgetProvider')
  return value
}
