const VARIANT_CLASS = {
  error: 'alert alert--error',
  success: 'alert alert--success',
  warning: 'alert alert--warning',
  info: 'alert alert--info',
}

const VARIANT_ROLE = {
  error: 'alert',
  success: 'status',
  warning: 'status',
  info: 'status',
}

export function AlertBlock({ variant, children, ...rest }) {
  return (
    <div className={VARIANT_CLASS[variant]} role={VARIANT_ROLE[variant]} {...rest}>
      {children}
    </div>
  )
}
