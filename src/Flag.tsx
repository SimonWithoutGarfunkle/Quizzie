import type { ReactNode } from 'react'
import type { Country } from './quiz'

const LABELS: Record<Country, string> = {
  es: "Drapeau de l'Espagne",
  fr: 'Drapeau de la France',
  gb: 'Drapeau du Royaume-Uni',
  de: "Drapeau de l'Allemagne",
}

const DRAWINGS: Record<Country, ReactNode> = {
  es: (
    <>
      <rect width="90" height="60" fill="#AA151B" />
      <rect y="15" width="90" height="30" fill="#F1BF00" />
    </>
  ),
  fr: (
    <>
      <rect width="30" height="60" fill="#0055A4" />
      <rect x="30" width="30" height="60" fill="#FFFFFF" />
      <rect x="60" width="30" height="60" fill="#EF4135" />
    </>
  ),
  gb: (
    <>
      <rect width="90" height="60" fill="#012169" />
      <path d="M0,0 L90,60 M90,0 L0,60" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M0,0 L90,60 M90,0 L0,60" stroke="#C8102E" strokeWidth="4" />
      <path d="M45,0 V60 M0,30 H90" stroke="#FFFFFF" strokeWidth="20" />
      <path d="M45,0 V60 M0,30 H90" stroke="#C8102E" strokeWidth="12" />
    </>
  ),
  de: (
    <>
      <rect width="90" height="20" fill="#000000" />
      <rect y="20" width="90" height="20" fill="#DD0000" />
      <rect y="40" width="90" height="20" fill="#FFCE00" />
    </>
  ),
}

interface Props {
  country: Country
}

export default function Flag({ country }: Props) {
  // none plutôt que slice : en portrait, slice ne laisserait presque que la bande centrale
  return (
    <svg
      className="desktop-bg-flag"
      role="img"
      aria-label={LABELS[country]}
      viewBox="0 0 90 60"
      preserveAspectRatio="none"
    >
      {DRAWINGS[country]}
    </svg>
  )
}
