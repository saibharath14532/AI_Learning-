// ─── Card Component ──────────────────────────────────────────────────────────
// Variants: default | highlighted | interactive | gradient

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  as: Tag = 'div',
  ...rest
}) {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  };

  const variants = {
    default:     'card',
    highlighted: 'card card-highlighted',
    interactive: 'card card-interactive',
    gradient:    'card bg-gradient-soft border-indigo-100',
    flat:        'bg-white rounded-xl p-6',
    ghost:       'rounded-xl p-6',
  };

  return (
    <Tag
      className={[
        variants[variant] || variants.default,
        variant === 'default' || variant === 'highlighted' || variant === 'gradient' ? '' : '',
        padding !== 'md' ? paddings[padding] : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Tag>
  );
}
