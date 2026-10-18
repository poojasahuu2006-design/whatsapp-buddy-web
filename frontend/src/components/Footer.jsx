import { MessageCircle } from 'lucide-react';

const footerLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-cream-300/60 bg-cream-100">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* Logo + tagline */}
          <div className="text-center md:text-left">
            <a href="#home" className="flex items-center justify-center gap-2.5 md:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-whatsapp-500 text-white shadow-lg shadow-whatsapp-500/30">
                <MessageCircle className="h-5 w-5" fill="currentColor" stroke="none" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink-900">
                WhatsApp<span className="text-whatsapp-600"> Buddy</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              The AI-powered platform for automating your WhatsApp conversations and growing your business.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-ink-600 transition-colors hover:text-whatsapp-600"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-cream-300/60 pt-6 text-center">
          <p className="text-sm text-ink-400">
            © {new Date().getFullYear()} WhatsApp Buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
