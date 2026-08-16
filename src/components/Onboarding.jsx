import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

export default function Onboarding() {
  const { data, actions } = useBudget()
  const [step, setStep] = useState(0)
  const totalBudget = data.monthlyBudgets.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalIncome = data.incomeSources.reduce((sum, item) => sum + Number(item.expectedAmount), 0)
  const slides = [
    <><span className="onboarding-visual">◒</span><span className="eyebrow">נעים להכיר</span><h1>הכסף שלך,<br/>בתמונה אחת ברורה.</h1><p>Counter עוזר לך לתכנן, לעקוב ולחסוך — בלי חיבור לבנק ובלי שהמידע יוצא מהמכשיר.</p></>,
    <><span className="onboarding-visual">◎</span><span className="eyebrow">מסגרת התחלתית</span><h1>כבר הכנו לך<br/>נקודת פתיחה.</h1><p>תקציב ברירת המחדל הוא <strong>{totalBudget.toLocaleString('he-IL')} ₪</strong>. אפשר לשנות כל סכום בהגדרות בכל רגע.</p><div className="onboarding-preview">{data.categories.map(item => <span key={item.id}>{item.icon} {item.name}</span>)}</div></>,
    <><span className="onboarding-visual">✦</span><span className="eyebrow">הכול מוכן</span><h1>מתחילים בצעד<br/>קטן וחכם.</h1><p>הכנסה צפויה: <strong>{totalIncome.toLocaleString('he-IL')} ₪</strong>. הוסיפו תנועות והדשבורד יתעדכן מיד.</p></>,
  ]
  return <div className="onboarding"><div className="onboarding-card"><div className="brand-mark">C</div><div className="onboarding-content">{slides[step]}</div><div className="onboarding-actions"><div className="dots">{slides.map((_, index) => <i key={index} className={index === step ? 'active' : ''} />)}</div>{step < slides.length - 1 ? <button className="primary-button" onClick={() => setStep(step + 1)}>המשך</button> : <button className="primary-button" onClick={() => actions.updateProfile({ onboarded: true })}>כניסה ל־Counter</button>}{step > 0 && <button className="text-button" onClick={() => setStep(step - 1)}>חזרה</button>}</div></div></div>
}
