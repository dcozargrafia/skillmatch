export function Section({ title, children }) {
  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">{title}</h2>
      </div>
      {children}
    </div>
  )
}
