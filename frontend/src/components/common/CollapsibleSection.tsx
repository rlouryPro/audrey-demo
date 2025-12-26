import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface CollapsibleSectionProps {
  title: string
  icon: LucideIcon
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export default function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={cn('border-b border-gray-200 last:border-b-0', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
        aria-expanded={isOpen}
        aria-controls={sectionId}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary-600" aria-hidden />
          <h4 className="font-medium text-lg">{title}</h4>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-text-muted" aria-hidden />
        ) : (
          <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden />
        )}
      </button>

      {isOpen && (
        <div id={sectionId} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
