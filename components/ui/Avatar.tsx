import { cn } from '@/lib/utils'

interface AvatarProps {
  username: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }

const colors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
]

function pickColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xff
  return colors[hash % colors.length]
}

export function Avatar({ username, size = 'md', className }: AvatarProps) {
  const letter = username[0]?.toUpperCase() ?? '?'
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white flex-shrink-0',
        pickColor(username),
        sizeMap[size],
        className
      )}
      aria-label={username}
    >
      {letter}
    </span>
  )
}
