import { useCallback } from 'react'
import type { CSSProperties } from 'react'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'
import toggleAnimUrl from './animations/Toogle.lottie?url'

const TOGGLE_SIZE_PX = 264

// DotLottieReact ignores the `style` prop entirely when `className` is also
// passed, so positioning + size must all go through `style` here.
const containerStyle: CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: TOGGLE_SIZE_PX,
  height: TOGGLE_SIZE_PX,
  cursor: 'pointer',
  zIndex: 2,
}

interface Props {
  onToggle: (isNight: boolean) => void
}

export default function DayNightToggle({ onToggle }: Props) {
  const handleDotLottieRef = useCallback(
    (dotLottie: DotLottie | null) => {
      if (!dotLottie) return
      dotLottie.addEventListener('stateMachineBooleanInputValueChange', event => {
        if (event.inputName === 'toggle') onToggle(event.newValue)
      })
    },
    [onToggle],
  )

  return (
    <DotLottieReact
      style={containerStyle}
      src={toggleAnimUrl}
      stateMachineId="StateMachine1"
      dotLottieRefCallback={handleDotLottieRef}
      renderConfig={{ autoResize: true }}
    />
  )
}
