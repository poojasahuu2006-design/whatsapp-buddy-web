import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-whatsapp-500 text-white shadow-lg shadow-whatsapp-500/30">
        <MessageCircle className="h-5 w-5" fill="currentColor" stroke="none" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink-900">
        WhatsApp<span className="text-whatsapp-600"> Buddy</span>
      </span>
    </Link>
  );
}
