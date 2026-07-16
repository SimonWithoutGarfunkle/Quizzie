export function TitleBar({ title }: { title: string }) {
  return (
    <div className="titlebar">
      <div className="titlebar-icon">■</div>
      <span className="titlebar-text">{title}</span>
      <div className="titlebar-btns">
        <button className="titlebar-btn">_</button>
        <button className="titlebar-btn">□</button>
        <button className="titlebar-btn">x</button>
      </div>
    </div>
  )
}

export function StatusBar({ left, right }: { left: string; right: string }) {
  return (
    <div className="statusbar">
      <span className="status-pane">{left}</span>
      <span className="status-pane">{right}</span>
    </div>
  )
}
