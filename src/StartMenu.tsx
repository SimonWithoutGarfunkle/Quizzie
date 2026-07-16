export type Page = 'quiz' | 'error' | 'all'

const PAGES: { id: Page; label: string }[] = [
  { id: 'quiz', label: 'Quizz' },
  { id: 'error', label: 'Error' },
  { id: 'all', label: 'All' },
]

interface Props {
  page: Page
  onNavigate: (page: Page) => void
}

export default function StartMenu({ page, onNavigate }: Props) {
  return (
    <div className="start-menu">
      {PAGES.map(p => (
        <button
          key={p.id}
          className={`start-menu-item${page === p.id ? ' start-menu-item--active' : ''}`}
          onClick={() => onNavigate(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
