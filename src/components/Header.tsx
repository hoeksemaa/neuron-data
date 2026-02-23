export default function Header() {
  return (
    <header style={{
      padding: '4rem 2rem 2rem',
      maxWidth: 900,
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #6c63ff, #48cfcb)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem',
      }}>
        How Does a BCI Read Your Brain?
      </h1>
      <p style={{
        fontSize: '1.1rem',
        color: '#a0a0b0',
        maxWidth: 600,
        margin: '0 auto',
        lineHeight: 1.7,
      }}>
        An interactive walkthrough of the population vector algorithm —
        the classic method for decoding movement intent from neural activity.
      </p>
    </header>
  )
}
