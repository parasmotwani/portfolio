import { useState } from 'react'
import Chapter from './Chapter'
import Cobweb from './Cobweb'
import Spider from './Spider'

const contactLinks = [
  { label: 'Email', value: 'parasmotwani@gmail.com', href: 'mailto:parasmotwani@gmail.com' },
  { label: 'LinkedIn', value: 'linkedin.com/in/parasmotwani', href: 'https://www.linkedin.com/in/parasmotwani' },
  { label: 'GitHub', value: 'github.com/parasmotwani', href: 'https://github.com/parasmotwani' },
  { label: 'Phone', value: '+91 7000 439 613', href: 'tel:+917000439613' },
  { label: 'Résumé', value: 'Paras_Motwani.pdf', href: '/Paras_Motwani.pdf' },
]

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const { name, email, message } = formData
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    window.open(`mailto:parasmotwani@gmail.com?subject=${subject}&body=${body}`)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <Chapter
      id="contact"
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
            {sent ? '✓ Opening email client' : 'Send Message →'}
          </button>
        </form>
      </div>
    </Chapter>
  )
}
