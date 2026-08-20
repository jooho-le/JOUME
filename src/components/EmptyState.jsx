export default function EmptyState({ eyebrow, title, body, actionLabel, onAction }) {
  return (
    <div className="jm-empty">
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {actionLabel && (
        <button className="jm-btn secondary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
