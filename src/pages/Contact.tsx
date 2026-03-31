import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Data inquiry', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', form)
    setSubmitted(true)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold text-primary mb-2">Contact</h1>
      <p className="text-gray-500 mb-10">Questions about the data or methodology? Get in touch.</p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* PI Info */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-heading font-bold">
                PX
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-text-main">Ping Xiao</h2>
                <p className="text-sm text-gray-500">Principal Investigator</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:ping.xiao@swfu.edu.cn" className="text-primary hover:underline">
                  ping.xiao@swfu.edu.cn
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Southwest Forestry University</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Kunming, Yunnan, China</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
            <h3 className="font-semibold text-text-main mb-3 text-sm">Research Focus</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                Small non-coding RNA biology in poultry
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                Reproductive endocrinology in avian species
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                Epigenetic regulation of egg production
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                HPO axis transcriptomics
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✉️</div>
              <h3 className="font-heading text-xl font-semibold text-primary mb-2">Message Sent</h3>
              <p className="text-gray-500 text-sm mb-6">Thank you for your inquiry. We will respond as soon as possible.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'Data inquiry', message: '' }) }}
                className="text-primary text-sm hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-text-main mb-5">Send a Message</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white"
                >
                  <option>Data inquiry</option>
                  <option>Collaboration</option>
                  <option>Technical issue</option>
                  <option>General question</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  placeholder="Your message…"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
