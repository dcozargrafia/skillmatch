export function StatusBadge({ variant = '', children, ...rest }) {
  const className = variant ? `badge badge--${variant}` : 'badge';

  return (
    <span className={className} {...rest}>
      {children}
    </span>
  );
}
