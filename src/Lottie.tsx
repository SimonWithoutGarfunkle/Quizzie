import type { CSSProperties } from 'react'
import LottiePlayer from 'lottie-react'

interface Props {
  animationData: unknown
  loop?: boolean
  style?: CSSProperties
}

export default function Lottie({ animationData, loop = true, style }: Props) {
  return <LottiePlayer animationData={animationData} loop={loop} autoplay style={style} />
}
