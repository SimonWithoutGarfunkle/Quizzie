import type { CSSProperties } from 'react'
import LottiePlayer from 'lottie-react'

interface Props {
  animationData: unknown
  loop?: boolean
  style?: CSSProperties
  className?: string
  rendererSettings?: { preserveAspectRatio?: string }
}

export default function Lottie({ animationData, loop = true, style, className, rendererSettings }: Props) {
  return (
    <LottiePlayer
      animationData={animationData}
      loop={loop}
      autoplay
      style={style}
      className={className}
      rendererSettings={rendererSettings}
    />
  )
}
