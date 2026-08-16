import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { ConfirmButton, EmptyState, Modal, Progress } from '../components/UI'

const blank = { title: '', description: '', goal: 7, progress: 0, rewardXp: 50, type: 'challenge', status: 'active' }
const templates = [
  { title: 'שבוע בלי משלוחים', description: 'לבשל בבית במשך 7 ימים', goal: 7, rewardXp: 60 },
  { title: 'חיסכון של 200 ₪', description: 'להעביר כסף לחיסכון החודש', goal: 200, rewardXp: 80 },
  { title: 'בלי חריגה בבילויים', description: 'לסיים את החודש בתוך המסגרת', goal: 1, rewardXp: 100 },
]

export default function Quests() {
  const { data, actions } = useBudget()
  const [editing, setEditing] = useState(null)
  const active = data.sideQuests.filter(item => item.status !== 'completed')
  const completed = data.sideQuests.filter(item => item.status === 'completed')
  const save = event => { event.preventDefault(); actions.saveQuest(editing); setEditing(null) }
  const QuestCard = ({ quest }) => {
    const percent = quest.progress / quest.goal * 100
    return <article className={`quest-card ${quest.status === 'completed' ? 'completed' : ''}`}><div className="quest-top"><span className="quest-badge">{quest.status === 'completed' ? '✓' : '⚡'}</span><div><h3>{quest.title}</h3><p>{quest.description}</p></div><ConfirmButton onConfirm={() => actions.deleteQuest(quest.id)}>מחיקה</ConfirmButton></div><Progress value={percent} color={quest.status === 'completed' ? 'var(--success)' : 'linear-gradient(90deg, var(--brand), var(--accent))'} label={`${quest.title}: ${Math.round(percent)} אחוז`} /><div className="quest-foot"><span>{quest.progress} מתוך {quest.goal}</span><strong>+{quest.rewardXp} XP</strong></div>{quest.status !== 'completed' && <button className="secondary-button" onClick={() => actions.progressQuest(quest.id)}>התקדמתי צעד</button>}</article>
  }
  return <div className="screen">
    <header className="topbar"><div><span className="eyebrow">משחקים לטובת העתיד</span><h1>משימות צד</h1></div><button className="secondary-button compact" onClick={() => setEditing(blank)}>משימה חדשה</button></header>
    <section className="xp-card"><div className="level-number">{data.userStats.level}</div><div><span>רמה נוכחית</span><h2>{data.userStats.xp} נקודות ניסיון</h2><Progress value={data.userStats.xp % 100} color="white" label="התקדמות לרמה הבאה" /><small>עוד {100 - (data.userStats.xp % 100)} XP לרמה הבאה</small></div><span className="xp-spark">✦</span></section>
    <section className="template-card"><div><span className="eyebrow">רעיונות לאתגר הבא</span><h2>בחרו משימה מוכנה</h2></div><div className="quest-template-row">{templates.map(template => <button key={template.title} onClick={() => setEditing({ ...blank, ...template })}><strong>{template.title}</strong><span>+{template.rewardXp} XP</span></button>)}</div></section>
    <div className="section-heading"><div><span className="eyebrow">בתנועה</span><h2>משימות פעילות</h2></div><span className="counter">{active.length}</span></div>
    {active.length ? <div className="quests-grid">{active.map(quest => <QuestCard quest={quest} key={quest.id} />)}</div> : <EmptyState icon="✨" title="כל המשימות הושלמו" text="אפשר לבחור אתגר חדש ולהמשיך לצבור XP." />}
    {completed.length > 0 && <><div className="section-heading completed-heading"><div><span className="eyebrow">היסטוריה</span><h2>הישגים אחרונים</h2></div></div><div className="quests-grid">{completed.map(quest => <QuestCard quest={quest} key={quest.id} />)}</div></>}
    {editing && <Modal title="משימה חדשה" onClose={() => setEditing(null)}><form className="stack" onSubmit={save}><label>שם המשימה<input autoFocus required value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label><label>תיאור<textarea required rows="3" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label><div className="two-columns"><label>מספר צעדים<input required min="1" type="number" value={editing.goal} onChange={e => setEditing({ ...editing, goal: e.target.value })} /></label><label>תגמול XP<input required min="10" type="number" value={editing.rewardXp} onChange={e => setEditing({ ...editing, rewardXp: e.target.value })} /></label></div><button className="primary-button">הפעלת המשימה</button></form></Modal>}
  </div>
}
