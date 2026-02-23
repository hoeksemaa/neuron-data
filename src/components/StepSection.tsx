import type { ReactNode } from 'react'

interface Props {
  step: number
  title: string
  instruction: string
  children: ReactNode
}

export default function StepSection({ step, title, instruction, children }: Props) {
  return (
    <section style={{
      padding: '3rem 2rem',
      maxWidth: 900,
      margin: '0 auto',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6c63ff',
          fontWeight: 600,
        }}>
          Step {step}
        </span>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          margin: '0.25rem 0 0.75rem',
          color: '#f0f0f0',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '0.95rem',
          color: '#a0a0b0',
          lineHeight: 1.6,
          maxWidth: 650,
        }}>
          {instruction}
        </p>
      </div>
      {children}
    </section>
  )
}
