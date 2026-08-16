import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

export default function LockScreen() {
  const { actions } = useBudget()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!await actions.unlock(pin)) {
      setError('הקוד שגוי או שהכספת המקומית נפגמה')
      setPin('')
    }
  }
  return <div className="lock-screen"><form className="lock-card" onSubmit={submit}><div className="brand-mark">C</div><span className="lock-icon">⌾</span><span className="eyebrow">הכספת נעולה</span><h1>התקציב שלך פרטי</h1><p>יש להזין את קוד הגישה כדי לפענח את הנתונים במכשיר הזה.</p><label>קוד גישה<input autoFocus required inputMode="numeric" type="password" autoComplete="current-password" minLength="6" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button">פתיחת Counter</button><small>הקוד אינו נשמר ולא ניתן לשחזר אותו.</small></form></div>
}
