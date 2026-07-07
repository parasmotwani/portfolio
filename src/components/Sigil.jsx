// Small geometric sigils for the grimoire's schools of practice.
const SIGILS = {
  tongue: ( // languages — crossed quills / chevron
    <>
      <circle cx="22" cy="22" r="19" />
      <path d="M13 30 L22 10 L31 30" />
      <line x1="16" y1="24" x2="28" y2="24" />
    </>
  ),
  lens: ( // ML & data — eye / lens
    <>
      <circle cx="22" cy="22" r="19" />
      <path d="M6 22 Q22 8 38 22 Q22 36 6 22 Z" />
      <circle cx="22" cy="22" r="5" />
    </>
  ),
  spark: ( // GenAI — radiant star
    <>
      <circle cx="22" cy="22" r="19" />
      <path d="M22 6 L26 18 L38 22 L26 26 L22 38 L18 26 L6 22 L18 18 Z" />
    </>
  ),
  vessel: ( // data engineering — alembic / vessel
    <>
      <circle cx="22" cy="22" r="19" />
      <path d="M17 9 L27 9 L27 17 L33 31 L11 31 L17 17 Z" />
      <line x1="14" y1="26" x2="30" y2="26" />
    </>
  ),
  tower: ( // cloud & devops — tower / keep
    <>
      <circle cx="22" cy="22" r="19" />
      <path d="M15 33 L15 15 L19 15 L19 11 L25 11 L25 15 L29 15 L29 33" />
      <line x1="12" y1="33" x2="32" y2="33" />
    </>
  ),
}

export default function Sigil({ name, className = 'spell-sigil' }) {
  return (
    <svg className={className} viewBox="0 0 44 44" aria-hidden="true">
      {SIGILS[name] || SIGILS.spark}
    </svg>
  )
}
