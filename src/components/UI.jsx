import { useEffect, useRef } from 'react'

export function Icon({ name, size = 22 }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    spark: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    edit: <><path d="m4 20 4-.8L19 8.2 15.8 5 4.8 16 4 20Z"/><path d="m14 6 3 3"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></>,
    moon: <path d="M20 15.5A8 8 0 1 1 8.5 4 7 7 0 0 0 20 15.5Z"/>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 20h14"/></>,
    upload: <><path d="M12 15V3m-5 5 5-5 5 5"/><path d="M5 20h14"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function Modal({ title, children, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    dialog.current?.focus()
    const handler = event => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => { document.removeEventListener('keydown', handler); previous?.focus() }
  }, [onClose])
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex="-1" ref={dialog}>
      <header className="modal-header"><div><span className="eyebrow">Counter</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="סגירה"><Icon name="close" /></button></header>
      {children}
    </section>
  </div>
}

export function Progress({ value, color, label }) {
  const safe = Math.max(0, Math.min(100, value || 0))
  return <div className="progress-wrap"><div className="progress" aria-label={label} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(safe)}><span style={{ width: `${safe}%`, background: color }} /></div></div>
}

export function EmptyState({ icon = '🌱', title, text, action }) {
  return <div className="empty-state"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function ConfirmButton({ children, onConfirm, message = 'בטוח/ה שברצונך למחוק?' }) {
  return <button className="icon-button danger" type="button" onClick={() => window.confirm(message) && onConfirm()} aria-label={children}><Icon name="trash" size={19} /></button>
}
