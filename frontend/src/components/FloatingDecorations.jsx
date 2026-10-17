import { MessageCircle } from 'lucide-react';

export default function FloatingDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full border border-whatsapp-200/40" />
      <div className="absolute left-1/4 -top-10 h-40 w-40 rounded-full border border-whatsapp-200/30" />
      <div className="absolute -right-16 top-32 h-96 w-96 rounded-full border border-whatsapp-200/30" />
      <div className="absolute right-1/3 bottom-0 h-56 w-56 rounded-full border border-whatsapp-200/25" />

      <MessageCircle className="absolute left-[12%] top-[40%] h-10 w-10 text-whatsapp-200/40" />
      <MessageCircle className="absolute right-[15%] top-[30%] h-8 w-8 text-whatsapp-200/35" />

      <div className="absolute left-[5%] top-[35%] h-64 w-64 rounded-full bg-whatsapp-100/40 animate-bubble-pulse" />
      <div className="absolute right-[8%] top-[20%] h-80 w-80 rounded-full bg-whatsapp-50/50 animate-bubble-pulse [animation-delay:2s]" />
    </div>
  );
}
