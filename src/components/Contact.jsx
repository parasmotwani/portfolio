import { useEffect, useState } from 'react'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'
import { sendMessage } from '../lib/sendMessage'
import Reach from './Reach'
import { useDevice } from '../hooks/useDevice'

const EMAIL = 'wparasmotwani@gmail.com'

const contactLinks = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/parasmotwani', href: 'https://www.linkedin.com/in/parasmotwani' },
  { label: 'GitHub', value: 'github.com/parasmotwani', href: 'https://github.com/parasmotwani' },
  { label: 'Phone', value: '+91 70004 39613', href: 'tel:+917000439613' },
  { label: 'Résumé', value: 'Paras_Motwani.pdf', href: '/Paras_Motwani.pdf' },
]

export default function Contact() {
  const { immersive } = useDevice()
  // In the room the form is behind the board's own "Contact me" control:
  // a panel hovering permanently in front of the scenery is the thing this
  // whole redesign was getting rid of. Opened, it sits on its own dark
  // backdrop so nothing in the room reads through it — and the fields stay
  // real inputs, which a canvas cannot be.
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  // idle | sending | sent | failed
  const [state, setState] = useState('idle')
  const [copied, setCopied] = useState('')

  const compose = () => {
    const { name, email, message } = formData
    return {
      subject: `Portfolio enquiry from ${name || 'a visitor'}`,
      body: `${message}\n\n—\n${name}\n${email}`,
    }
  }

  // The form posts the message and reports what actually happened. It used
  // to only open the visitor's mail client, which sends nothing at all when
  // no mail app is registered — the message was lost and the sender was
  // told it had gone.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      await sendMessage(formData)
      setState('sent')
    } catch {
      // delivery failed (offline, blocked, endpoint not yet activated) —
      // never claim it went; offer the routes that do not depend on us
      setState('failed')
    }
  }

  const openMailClient = () => {
    const { subject, body } = compose()
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('overflow-lock')
    return () => document.documentElement.classList.remove('overflow-lock')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

      {/* In the room: the board carries the control, and pressing it opens
          the real thing. Off the immersive track there is no board, so the
          form stays inline where it always was. */}
      {immersive ? (
        <>
          <Reach name="contact" onClick={() => setOpen(true)} label="Contact me" title="Contact me" />
          {open && (
            <div className="letter-backdrop" onClick={() => setOpen(false)}>
              <div className="letter" onClick={(e) => e.stopPropagation()}>
                <button
                  className="letter-close"
                  data-hover
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
                <h4 className="letter-head">Contact me</h4>
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
            <button
              type="submit"
              className="btn solid"
              data-hover
              data-magnetic
              disabled={state === 'sending' || state === 'sent'}
            >
              {state === 'sending' ? 'Sending…' : state === 'sent' ? '✓ Message sent' : 'Send message →'}
            </button>

            {state === 'sent' && (
              <div className="contact-fallback contact-fallback--ok" role="status">
                <p>Delivered. A reply will come to {formData.email || 'the address you gave'}.</p>
              </div>
            )}

            {state === 'failed' && (
              <div className="contact-fallback" role="status">
                <p>
                  That didn’t send — nothing has reached Paras. Use one of
                  these instead; they don’t depend on this form.
                </p>
                <div className="contact-fallback-row">
                  <button type="button" data-hover onClick={openMailClient}>
                    Open in mail app
                  </button>
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
              </div>
            </div>
          )}
        </>
      ) : (
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
          <button
            type="submit"
            className="btn solid"
            data-hover
            data-magnetic
            disabled={state === 'sending' || state === 'sent'}
          >
            {state === 'sending' ? 'Sending…' : state === 'sent' ? '✓ Message sent' : 'Send message →'}
          </button>

          {state === 'sent' && (
            <div className="contact-fallback contact-fallback--ok" role="status">
              <p>Delivered. A reply will come to {formData.email || 'the address you gave'}.</p>
            </div>
          )}

          {state === 'failed' && (
            <div className="contact-fallback" role="status">
              <p>
                That didn’t send — nothing has reached Paras. Use one of
                these instead; they don’t depend on this form.
              </p>
              <div className="contact-fallback-row">
                <button type="button" data-hover onClick={openMailClient}>
                  Open in mail app
                </button>
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
      )}
    </Chapter>
  )
}
