import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-cream-300/70 bg-cream-50 shadow-sm ${
        hover
          ? 'transition-all hover:border-whatsapp-300 hover:shadow-xl hover:shadow-whatsapp-500/10'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
