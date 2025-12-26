interface AvatarProps {
  level: number
  acquiredCount: number
}

const AVATAR_EMOJIS: Record<number, string> = {
  1: '🌱',
  2: '🌿',
  3: '🌳',
  4: '🌲',
  5: '🏆',
}

const AVATAR_LABELS: Record<number, string> = {
  1: 'Debutant',
  2: 'Apprenti',
  3: 'Confirme',
  4: 'Expert',
  5: 'Champion',
}

const AVATAR_COLORS: Record<number, string> = {
  1: 'bg-green-100',
  2: 'bg-green-200',
  3: 'bg-green-300',
  4: 'bg-green-400',
  5: 'bg-yellow-300',
}

export default function Avatar({ level, acquiredCount }: AvatarProps) {
  const safeLevel = Math.max(1, Math.min(5, level))

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div
        role="img"
        aria-label={`Avatar niveau ${safeLevel} sur 5 - ${AVATAR_LABELS[safeLevel]}`}
        className={`w-24 h-24 ${AVATAR_COLORS[safeLevel]} rounded-full mx-auto flex items-center justify-center transition-colors`}
      >
        <span className="text-5xl">{AVATAR_EMOJIS[safeLevel]}</span>
      </div>
      <p className="mt-3 font-bold text-lg">{AVATAR_LABELS[safeLevel]}</p>
      <p className="font-medium text-primary-600">Niveau {safeLevel}/5</p>
      <p className="text-sm text-text-muted mt-1">
        {acquiredCount} competence{acquiredCount > 1 ? 's' : ''} acquise{acquiredCount > 1 ? 's' : ''}
      </p>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-6 h-2 rounded-full transition-colors ${
              i <= safeLevel ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
