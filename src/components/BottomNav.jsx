import { NavLink } from 'react-router-dom'
import { Icon } from './UI'

const tabs = [
  ['/', 'home', 'בית'], ['/transactions', 'list', 'תנועות'], ['/savings', 'target', 'חיסכון'], ['/quests', 'spark', 'משימות'], ['/settings', 'settings', 'הגדרות'],
]

export default function BottomNav() {
  return <nav className="bottom-nav" aria-label="ניווט ראשי"><span className="nav-brand" aria-hidden="true">C</span>{tabs.map(([to, icon, label]) => <NavLink key={to} to={to} end={to === '/'}><span className="nav-icon"><Icon name={icon} /></span><span>{label}</span></NavLink>)}</nav>
}
