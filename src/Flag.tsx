import type { ReactNode } from 'react'
import { FLAG_COLORS, type Country } from './quiz'

const LABELS: Record<Country, string> = {
  es: "Drapeau de l'Espagne",
  fr: 'Drapeau de la France',
  gb: 'Drapeau du Royaume-Uni',
  de: "Drapeau de l'Allemagne",
}

const DRAWINGS: Record<Country, ReactNode> = {
  es: (
    <>
      <rect width="90" height="60" fill={FLAG_COLORS.es.red} />
      <rect y="15" width="90" height="30" fill={FLAG_COLORS.es.yellow} />
    </>
  ),
  fr: (
    <>
      <rect width="30" height="60" fill={FLAG_COLORS.fr.blue} />
      <rect x="30" width="30" height="60" fill={FLAG_COLORS.fr.white} />
      <rect x="60" width="30" height="60" fill={FLAG_COLORS.fr.red} />
    </>
  ),
  gb: (
    <>
      <rect width="90" height="60" fill={FLAG_COLORS.gb.blue} />
      <path d="M0,0 L90,60 M90,0 L0,60" stroke={FLAG_COLORS.gb.white} strokeWidth="12" />
      <path d="M0,0 L90,60 M90,0 L0,60" stroke={FLAG_COLORS.gb.red} strokeWidth="4" />
      <path d="M45,0 V60 M0,30 H90" stroke={FLAG_COLORS.gb.white} strokeWidth="20" />
      <path d="M45,0 V60 M0,30 H90" stroke={FLAG_COLORS.gb.red} strokeWidth="12" />
    </>
  ),
  de: (
    <>
      <rect width="90" height="20" fill={FLAG_COLORS.de.black} />
      <rect y="20" width="90" height="20" fill={FLAG_COLORS.de.red} />
      <rect y="40" width="90" height="20" fill={FLAG_COLORS.de.gold} />
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
