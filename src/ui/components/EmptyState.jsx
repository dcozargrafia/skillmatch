export function EmptyState({ message, children }) {
  return (
    <div className="empty-state">
      <p className="empty-state__text">{message}</p>
      {children}
    </div>
  );
}
