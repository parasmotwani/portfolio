import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
}

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

  const contactLinks = [
    {
      icon: '✉️',
      label: 'Email',
      value: 'parasmotwani@gmail.com',
      href: 'mailto:parasmotwani@gmail.com',
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'linkedin.com/in/parasmotwani',
      href: 'https://www.linkedin.com/in/parasmotwani',
    },
    {
      icon: '🐙',
      label: 'GitHub',
      value: 'github.com/parasmotwani',
      href: 'https://github.com/parasmotwani',
    },
    {
      icon: '📞',
      label: 'Phone',
      value: '+91-7000439613',
      href: 'tel:+917000439613',
    },
  ]

  return (
    <section className="section" id="contact" ref={ref}>
      <motion.h2
        className="section-title gradient-text"
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Get In Touch
      </motion.h2>
      <motion.p
        className="section-subtitle"
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        Have a project in mind or want to chat about AI? Let's connect.
      </motion.p>

      <div className="contact-wrapper">
        <motion.div
          className="contact-info"
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h3>Let's build something <span className="gradient-text">amazing</span> together.</h3>
          <p>
            I'm always open to discussing new opportunities, interesting projects,
            or collaborations in AI and data science.
          </p>
          <div className="contact-links">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link-item"
              >
                <span className="icon">{link.icon}</span>
                <div>
                  <div className="label">{link.label}</div>
                  <div className="value">{link.value}</div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {sent ? '✓ Opening Email Client' : 'Send Message →'}
          </button>
        </motion.form>
      </div>
    </section>
  )
}
