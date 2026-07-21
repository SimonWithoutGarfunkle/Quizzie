import { useEffect, useState } from 'react'
import Lottie from './Lottie'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { TitleBar, StatusBar } from './WindowChrome'

const PREVIEW_SIZE_PX = 160
const MODAL_ANIM_SIZE_PX = 480

const jsonAnimations = import.meta.glob('./animations/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>
const lottieAnimations = import.meta.glob('./animations/*.lottie', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function labelFromPath(path: string): string {
  return path.replace('./animations/', '').replace(/\.(json|lottie)$/, '')
}

type Entry =
  | { path: string; label: string; kind: 'json'; data: unknown }
  | { path: string; label: string; kind: 'lottie'; url: string }

const entries: Entry[] = [
  ...Object.entries(jsonAnimations).map(([path, data]): Entry => ({ path, label: labelFromPath(path), kind: 'json', data })),
  ...Object.entries(lottieAnimations).map(([path, url]): Entry => ({ path, label: labelFromPath(path), kind: 'lottie', url })),
].sort((a, b) => a.label.localeCompare(b.label))

export default function AllAnimationsPage() {
  const [selected, setSelected] = useState<Entry | null>(null)

  return (
    <div className="window">
      <TitleBar title="ANIMATIONS.EXE" />
      <div className="window-body all-animations-body">
        {entries.map(entry => (
          <div className="anim-card" key={entry.path} onClick={() => setSelected(entry)}>
            <span className="anim-card-label">
              {entry.label} <em>({entry.kind})</em>
            </span>
            {entry.kind === 'json' ? (
              <Lottie animationData={entry.data} loop style={{ width: PREVIEW_SIZE_PX, height: PREVIEW_SIZE_PX }} />
            ) : (
              <DotLottieReact
                src={entry.url}
                autoplay
                loop
                style={{ width: PREVIEW_SIZE_PX, height: PREVIEW_SIZE_PX }}
                renderConfig={{ autoResize: true }}
              />
            )}
          </div>
        ))}
      </div>
      <StatusBar left="Toutes les animations" right={`${entries.length} fichiers`} />

      {selected && <AnimationModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function AnimationModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="window modal-window" onClick={e => e.stopPropagation()}>
        <TitleBar title={`${entry.label} (${entry.kind})`} onClose={onClose} />
        <div className="window-body window-body--center">
          {entry.kind === 'json' ? (
            <Lottie
              animationData={entry.data}
              loop
              style={{ width: MODAL_ANIM_SIZE_PX, height: MODAL_ANIM_SIZE_PX }}
            />
          ) : (
            <DotLottieReact
              src={entry.url}
              autoplay
              loop
              style={{ width: MODAL_ANIM_SIZE_PX, height: MODAL_ANIM_SIZE_PX }}
              renderConfig={{ autoResize: true }}
            />
          )}
        </div>
        <StatusBar left={entry.label} right={entry.kind} />
      </div>
    </div>
  )
}
