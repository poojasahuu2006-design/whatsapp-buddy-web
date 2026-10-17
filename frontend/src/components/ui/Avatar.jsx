const sizeMap = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

const colorMap = {
  green: 'bg-whatsapp-500',
  dark: 'bg-whatsapp-600',
  light: 'bg-whatsapp-400',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  teal: 'bg-teal-500',
};

export default function Avatar({
  initials,
  color = 'green',
  size = 'md',
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${sizeMap[size] || sizeMap.md} ${colorMap[color] ?? colorMap.green}`}
    >
      {initials}
    </div>
  );
}
