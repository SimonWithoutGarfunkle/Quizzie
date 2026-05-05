import { useRef, useEffect } from 'react'
import lottie from 'lottie-web'

interface Props {
  animationData: unknown
  loop?: boolean
  style?: React.CSSProperties
}

export default function Lottie({ animationData, loop = true, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData: animationData as object,
    })
    return () => anim.destroy()
  }, [animationData, loop])

  return <div ref={containerRef} style={style} />
}
