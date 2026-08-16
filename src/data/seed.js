const id = () => crypto.randomUUID()

export const currentMonth = () => new Date().toISOString().slice(0, 7)

export const createSeedData = () => {
  const bills = id()
  const fun = id()
  const living = id()
  return {
    version: 1,
    profile: { currency: 'ILS', monthStartDay: 1, theme: 'light', onboarded: false },
    categories: [
      { id: bills, name: 'חשבונות', icon: '🧾', color: '#6c63d9', type: 'expense', isDefault: true },
      { id: fun, name: 'בילויים', icon: '🎉', color: '#ef767a', type: 'expense', isDefault: true },
      { id: living, name: 'מחיה', icon: '🛒', color: '#32a88f', type: 'expense', isDefault: true },
    ],
    monthlyBudgets: [
      { id: id(), month: currentMonth(), categoryId: bills, amount: 2500 },
      { id: id(), month: currentMonth(), categoryId: fun, amount: 1200 },
      { id: id(), month: currentMonth(), categoryId: living, amount: 2200 },
    ],
    transactions: [],
    incomeSources: [{ id: id(), name: 'משכורת', expectedAmount: 9000, recurring: true }],
    savingsGoals: [],
    sideQuests: [
      { id: id(), title: 'שבוע בלי קפה בחוץ', description: 'להכין קפה בבית במשך 7 ימים', type: 'challenge', rewardXp: 50, status: 'active', progress: 0, goal: 7, createdAt: new Date().toISOString() },
      { id: id(), title: 'ארוחה מהבית', description: 'לקחת אוכל מהבית 5 פעמים', type: 'challenge', rewardXp: 40, status: 'active', progress: 0, goal: 5, createdAt: new Date().toISOString() },
    ],
    userStats: { xp: 0, level: 1, streakDays: 0, badges: [] },
  }
}

export const goalTemplates = [
  { name: 'קרן חירום', icon: '🛟' },
  { name: 'חופשה', icon: '🏝️' },
  { name: 'רכב', icon: '🚗' },
  { name: 'מתנה', icon: '🎁' },
]
