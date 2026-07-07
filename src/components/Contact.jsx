import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
}

const contactLinks = [
  { label: 'Email', value: 'parasmotwani@gmail.com', href: 'mailto:parasmotwani@gmail.com' },
  { label: 'LinkedIn', value: 'linkedin.com/in/parasmotwani', href: 'https://www.linkedin.com/in/parasmotwani' },
  { label: 'GitHub', value: 'github.com/parasmotwani', href: 'https://github.com/parasmotwani' },
  { label: 'Phone', value: '+91 7000 439 613', href: 'tel:+917000439613' },
  { label: 'Résumé', value: 'Paras_Motwani.pdf', href: '/Paras_Motwani.pdf' },
]

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
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
    <section className="section" id="contact" ref={ref} data-scene>
      <div className="section-head">
        <span className="section-num">06</span>
        <h2 className="section-title">Contact</h2>
        <span className="section-sub">Signal converged — say hello</span>
      </div>

      <motion.h3
        className="contact-huge"
        variants={fadeUp} custom={0} initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Let's build<br />something<br /><span className="red">intelligent.</span>
      </motion.h3>

      <div className="contact-grid">
        <motion.div
          className="contact-links"
          variants={fadeUp} custom={1} initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
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
        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          variants={fadeUp} custom={2} initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <input
            type="text" placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email" placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Message" rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
          <button type="submit" className="btn solid" data-hover data-magnetic>
            {sent ? '✓ Opening email client' : 'Send message →'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
