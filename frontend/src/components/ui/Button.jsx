const variantClasses = {
  primary:
    'bg-whatsapp-500 text-white shadow-lg shadow-whatsapp-500/30 hover:bg-whatsapp-600 hover:shadow-xl hover:shadow-whatsapp-500/40 hover:-translate-y-0.5',
  secondary:
    'bg-cream-100 text-ink-800 border border-cream-300 hover:bg-cream-200',
  ghost: 'text-ink-600 hover:bg-cream-200 hover:text-ink-900',
  danger:
    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300',
  outline:
    'border border-whatsapp-300 text-whatsapp-700 hover:bg-whatsapp-50',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
