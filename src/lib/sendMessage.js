// Actually delivering the contact form.
//
// The form used to hand off to the visitor's mail client via a mailto:
// link. That is not delivery — if no mail app is registered, which is the
// default on desktop Chrome and on most managed machines, the message
// evaporates and the sender has no idea. A portfolio whose contact form
// silently drops recruiters is worse than one with no form at all.
//
// This posts to FormSubmit, which needs no account and no API key: the
// endpoint IS the address, and the first submission triggers a one-time
// activation email that must be clicked once. After that every submission
// lands in the inbox. VITE_CONTACT_ENDPOINT overrides it, so the address
// can be swapped for FormSubmit's hashed form (which keeps the address out
// of the bundle) or for a different provider entirely, without a code
// change.
const ENDPOINT =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  'https://formsubmit.co/ajax/wparasmotwani@gmail.com'

export async function sendMessage({ name, email, message }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: `Portfolio enquiry from ${name || 'a visitor'}`,
      // the reply arrow in the mail client should go to the sender
      _replyto: email,
      _template: 'table',
    }),
  })
  if (!res.ok) throw new Error(`send failed: ${res.status}`)
  const data = await res.json().catch(() => ({}))
  // FormSubmit answers 200 with success:"false" for an unactivated address
  if (data.success === 'false' || data.success === false) {
    throw new Error(data.message || 'send failed')
  }
  return data
}
