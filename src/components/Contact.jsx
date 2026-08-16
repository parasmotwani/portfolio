import { useState } from 'react'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'

const EMAIL = 'wparasmotwani@gmail.com'

const contactLinks = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/parasmotwani', href: 'https://www.linkedin.com/in/parasmotwani' },
  { label: 'GitHub', value: 'github.com/parasmotwani', href: 'https://github.com/parasmotwani' },
  { label: 'Phone', value: '+91 70004 39613', href: 'tel:+917000439613' },
  { label: 'Résumé', value: 'Paras_Motwani.pdf', href: '/Paras_Motwani.pdf' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [handedOff, setHandedOff] = useState(false)
  const [copied, setCopied] = useState('')

  const compose = () => {
    const { name, email, message } = formData
    return {
      subject: `Portfolio enquiry from ${name || 'a visitor'}`,
      body: `${message}\n\n—\n${name}\n${email}`,
    }
  }

  // This hands off to a mail client; it does not send anything itself. If
  // the visitor has no mail app registered — routine on desktop Chrome and
  // on most managed machines — the handoff silently does nothing. So the
  // form must never claim the message went: it says what actually
  // happened and offers the address and the drafted text instead.
  const handleSubmit = (e) => {
    e.preventDefault()
    const { subject, body } = compose()
    // location.href rather than window.open — a blocked popup leaves a
    // dead blank tab and still no mail client
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setHandedOff(true)
  }

  const copy = async (what, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(''), 2400)
    } catch {
      setCopied('')
    }
  }

  return (
    <Chapter
      id="contact"
      room={6}
      numeral="Room VI"
      title="Contact"
      subtitle="The telephone still works. Open to opportunities and collaborations."
      className="room"
      exit={false}
    >
      <Cobweb corner="tl" size={150} />
      <Cobweb corner="br" size={180} />
      <Spider left="88%" delay={3} />

      <h3 className="contact-huge" data-reveal>
        Let us build something<br /><span className="gold">intelligent.</span>
      </h3>

      <div className="contact-grid">
        <div className="contact-links" data-reveal>
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') || link.href.endsWith('.pdf') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="contact-link-item"
              data-hover
            >
              <span className="label">{link.label}</span>
              <span className="value">{link.value}</span>
            </a>
          ))}
        </div>

        <form className="contact-form" onSubmit={handleSubmit} data-reveal>
          <input
            type="text" placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email" placeholder="Your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Your message" rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
          <button type="submit" className="btn solid" data-hover data-magnetic>
            Compose email →
          </button>

          {handedOff && (
            <div className="contact-fallback" role="status">
              <p>
                Your mail app should have opened with this drafted. If it
                didn’t, nothing has been sent — use one of these instead.
              </p>
              <div className="contact-fallback-row">
                <button type="button" data-hover onClick={() => copy('address', EMAIL)}>
                  {copied === 'address' ? '✓ address copied' : `Copy ${EMAIL}`}
                </button>
                <button
                  type="button"
                  data-hover
                  onClick={() => {
                    const { subject, body } = compose()
                    copy('message', `${subject}\n\n${body}`)
                  }}
                >
                  {copied === 'message' ? '✓ message copied' : 'Copy the message'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Chapter>
  )
}
