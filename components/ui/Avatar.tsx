import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  username: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { className: 'w-7 h-7 text-xs', px: 28 },
  md: { className: 'w-9 h-9 text-sm', px: 36 },
  lg: { className: 'w-14 h-14 text-xl', px: 56 },
}

const colors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
]

function pickColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xff
  return colors[hash % colors.length]
}

export function Avatar({ username, avatarUrl, size = 'md', className }: AvatarProps) {
  const { className: sizeClass, px } = sizeMap[size]
  const letter = username[0]?.toUpperCase() ?? '?'

  if (avatarUrl) {
    return (
      <span className={cn('inline-flex flex-shrink-0 rounded-full overflow-hidden', sizeClass, className)}>
        <Image
          src={avatarUrl}
          alt={username}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white flex-shrink-0',
        pickColor(username),
        sizeClass,
        className
      )}
      aria-label={username}
    >
      {letter}
    </span>
  )
}
