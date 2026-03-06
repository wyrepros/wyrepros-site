import { useEffect, useRef, useState } from 'react'
import './App.css'

const services = [
  { title: 'Managed IT Support (24/7)', outcome: 'Faster incident handling with less downtime disruption.' },
  { title: 'Network Design + Deployment', outcome: 'Stable connectivity that scales with operations.' },
  { title: 'Low-Voltage Cabling + Rack Installs', outcome: 'Clean infrastructure that is easy to maintain and expand.' },
  { title: 'Switching, Wi-Fi, and Access Points', outcome: 'Reliable coverage and throughput across teams and sites.' },
  { title: 'Firewall Setup + Security Hardening', outcome: 'Reduced exposure with enforced security controls.' },
  { title: 'Endpoint Security + Antivirus Management', outcome: 'Continuous endpoint defense and threat containment.' },
  { title: 'Cameras, Audio, and Access Control', outcome: 'Unified visibility and tighter facility control.' },
  { title: 'Workstations + Business Software Rollouts', outcome: 'Faster onboarding and smoother daily workflows.' },
  { title: 'Cloud, Backup, and Continuity Planning', outcome: 'Recovery readiness with less operational risk.' },
]

export default function App() {
  const base = import.meta.env.BASE_URL
  const webhookUrl = import.meta.env.VITE_LEAD_WEBHOOK_URL
  const minSubmitIntervalMs = 30_000

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' })
  const [formStarted, setFormStarted] = useState(false)
  const lastSubmitAtRef = useRef(0)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 760) setMobileMenuOpen(false)
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const trackEvent = (eventName, payload = {}) => {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...payload })
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload)
    }
  }

  const handleFormFocus = () => {
    if (formStarted) return
    setFormStarted(true)
    trackEvent('lead_form_start', { form_id: 'wyrepros-contact' })
  }

  const handleLeadSubmit = async (e) => {
    e.preventDefault()

    const now = Date.now()
    if (now - lastSubmitAtRef.current < minSubmitIntervalMs) {
      const waitSeconds = Math.ceil((minSubmitIntervalMs - (now - lastSubmitAtRef.current)) / 1000)
      setSubmitState({
        status: 'error',
        message: `Please wait ${waitSeconds}s before sending another request.`,
      })
      trackEvent('lead_form_rate_limited', { wait_seconds: waitSeconds })
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    if ((formData.get('website') || '').toString().trim() !== '') {
      setSubmitState({ status: 'success', message: 'Thanks — request received.' })
      trackEvent('lead_form_spam_blocked', { reason: 'honeypot_filled' })
      return
    }

    if (!webhookUrl) {
      setSubmitState({
        status: 'error',
        message: 'Form endpoint not configured yet. Add VITE_LEAD_WEBHOOK_URL in .env.local.',
      })
      trackEvent('lead_form_error', { reason: 'missing_webhook' })
      return
    }

    setSubmitState({ status: 'submitting', message: '' })
    trackEvent('lead_form_submit_attempt', { form_id: 'wyrepros-contact' })

    const payload = Object.fromEntries(formData.entries())
    payload.submittedAt = new Date().toISOString()
    payload.pageUrl = window.location.href
    payload.userAgent = window.navigator.userAgent

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      lastSubmitAtRef.current = now
      setSubmitState({
        status: 'success',
        message: 'Request sent. We will follow up shortly.',
      })
      form.reset()
      trackEvent('lead_form_submit_success', { form_id: 'wyrepros-contact' })
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: 'Submission failed. Please call us at 480-482-1070.',
      })
      trackEvent('lead_form_submit_error', {
        form_id: 'wyrepros-contact',
        error: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  return (
    <div className="page" id="top">
      <div className="ambient" aria-hidden="true" />
      <div className="circuit-bg" aria-hidden="true" />
      <div className="side-cable side-cable-left" aria-hidden="true">
        <span className="cable-run" />
        <span className="cable-pulse" />
      </div>
      <div className="side-cable side-cable-right" aria-hidden="true">
        <span className="cable-run" />
        <span className="cable-pulse" />
      </div>

      <div className="topbar">
        <p>24/7 AI-Optimized IT Support · Any Industry · USA Nationwide</p>
        <a href="#contact">Get a Fast IT Plan →</a>
      </div>

      <header className="nav">
        <a className="mobile-call-btn" href="tel:+14804821070" aria-label="Call Wyre Pros">
          📞
        </a>
        <a className="brand" href="#top" aria-label="Wyre Pros home">
          <img
            src={`${base}wyrepros-logo.jpg`}
            alt="Wyre Pros logo"
            width="360"
            height="120"
            decoding="async"
            fetchPriority="high"
          />
        </a>
        <nav aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#platform">Platform</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="call-btn" href="tel:+14804821070">Call 480-482-1070</a>
        <button
          className="mobile-menu-btn"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {mobileMenuOpen && (
        <>
          <button
            className="mobile-menu-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="mobile-nav-menu" className="mobile-menu" role="dialog" aria-label="Mobile navigation">
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)}>Process</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </div>
        </>
      )}

      <main>
        <section className="hero">
          <p className="eyebrow">IT INFRASTRUCTURE FOR MODERN BUSINESS</p>
          <h1>One IT partner. Zero operational chaos.</h1>
          <p className="hero-proof">Trusted for uptime-first environments, rapid response, and clean execution standards.</p>
          <p className="sub">
            Wyre Pros designs, builds, secures, and supports business technology environments—from network foundations and endpoint rollout to 24/7 AI-optimized support operations.
          </p>
          <div className="actions">
            <a className="primary" href="#contact">Get My IT Game Plan</a>
            <a className="ghost" href="#services">Explore Services</a>
          </div>

          <section className="hero3d lite">
            <div className="cable-line" />
            <div className="cable-dot" />
          </section>

          <div className="heroCards">
            <article><span>Infrastructure</span><h3>Network + Cabling + Racks</h3><p>Built clean from day one to prevent bottlenecks and downtime.</p></article>
            <article><span>Security</span><h3>Firewall + Policy Control</h3><p>Hardened segmentation and controls to protect mission-critical operations.</p></article>
            <article><span>Operations</span><h3>24/7 AI Support</h3><p>Fast triage and active resolution flow when every minute matters.</p></article>
          </div>

          <section className="rackViz" aria-label="Network rack visual">
            <div className="rackGlow" />
            <div className="rackFrame">
              <div className="rackUnit"><span>U42</span><b /></div>
              <div className="rackUnit"><span>U41</span><b /></div>
              <div className="rackUnit"><span>U40</span><b /></div>
              <div className="rackUnit"><span>U39</span><b /></div>
              <div className="rackUnit"><span>U38</span><b /></div>
              <div className="rackUnit"><span>U37</span><b /></div>
            </div>
          </section>
        </section>

        <section className="section trust-strip" aria-label="Trust and service assurances">
          <div className="trust-grid">
            <article><span className="trust-kicker">⚡ Response</span><h3>&lt; 10 min</h3><p>Priority triage target for urgent support requests</p></article>
            <article><span className="trust-kicker">🛡️ Security</span><h3>24/7</h3><p>Threat monitoring with antivirus and endpoint protection oversight</p></article>
            <article><span className="trust-kicker">🌎 Reach</span><h3>USA Wide</h3><p>Remote-first support with national coverage capability</p></article>
            <article><span className="trust-kicker">📈 Standard</span><h3>Uptime-First</h3><p>Standards-driven execution with clear communication</p></article>
          </div>
          <p className="trust-note">Primary service area: Phoenix metro + remote nationwide support. Priority triage SLA target: first response in under 10 minutes for active outage tickets.</p>
          <div className="proof-row" aria-label="Operational proof points">
            <span>✅ Structured Implementation Standards</span>
            <span>✅ Security-First Policy Baselines</span>
            <span>✅ Transparent Issue Ownership</span>
          </div>
          <div className="testimonial-row" aria-label="Client outcomes">
            <article>
              <p>“Wyre Pros stabilized our recurring outages and gave us real ownership visibility in the first week.”</p>
              <span>— Operations Manager, Multi-Site Healthcare Group</span>
            </article>
            <article>
              <p>“Fast triage, clear communication, and no finger-pointing. Exactly what we needed during an emergency.”</p>
              <span>— Director, Regional Professional Services Firm</span>
            </article>
          </div>
        </section>

        <section id="services" className="section">
          <div className="sectionHead">
            <p className="eyebrow">CORE SERVICES</p>
            <h2>Everything your organization needs in one technical partner.</h2>
          </div>
          <div className="serviceGrid">
            {services.map((s) => (
              <article key={s.title} className="card">
                <h3>{s.title}</h3>
                <p>{s.outcome}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="platform" className="section panel">
          <div>
            <p className="eyebrow">WHY WYREPROS</p>
            <h2>Built like an infrastructure company. Operated like a rapid-response team.</h2>
            <ul>
              <li>Industry-agnostic technical execution</li>
              <li>Physical + network + support under one roof</li>
              <li>Uptime-first standards over patchwork fixes</li>
              <li>Clear communication from issue to resolution</li>
              <li>Proactive support posture, not reactive firefighting</li>
            </ul>
          </div>
          <aside>
            <article><h4>Design + Deploy</h4><p>Networks, endpoints, and systems delivered with clean implementation standards.</p></article>
            <article><h4>Secure</h4><p>Firewall policy, segmentation, antivirus/EDR coverage, and security architecture built for resilience.</p></article>
            <article><h4>Support</h4><p>24/7 AI-optimized operations for faster triage and issue flow.</p></article>
          </aside>
        </section>

        <section id="process" className="section">
          <div className="sectionHead">
            <p className="eyebrow">EXECUTION MODEL</p>
            <h2>Assess → Design → Build → Secure → Support</h2>
          </div>
          <div className="timeline">
            {[
              { label: 'Assess', icon: '🔍' },
              { label: 'Design', icon: '🧠' },
              { label: 'Build', icon: '🛠️' },
              { label: 'Secure', icon: '🔐' },
              { label: 'Support', icon: '🚀' },
            ].map((step) => (
              <article key={step.label}><h3>{step.icon} {step.label}</h3></article>
            ))}
          </div>
        </section>

        <section className="section showcase">
          <div className="sectionHead">
            <p className="eyebrow">REAL-WORLD EXECUTION</p>
            <h2>Built for clean systems, stable networks, and zero chaos.</h2>
          </div>
          <div className="showcaseGrid">
            <article><h3>Infrastructure Discipline</h3><p>Labeled, serviceable, and built for long-term maintainability.</p></article>
            <article><h3>Operational Reliability</h3><p>Architectures designed to reduce incident frequency and response time.</p></article>
            <article><h3>Visibility + Control</h3><p>Systems built for fast troubleshooting and consistent uptime.</p></article>
          </div>
        </section>

        <section id="contact" className="section cta">
          <div>
            <p className="eyebrow">START NOW</p>
            <h2>Ready to eliminate IT bottlenecks and risk?</h2>
            <p>Tell us what you’re building or fixing. We’ll map the fastest path to a secure, stable environment with clear next-step scope and ownership.</p>
            <p><strong>Priority response available for active outages — no slow handoffs, no guesswork.</strong></p>
          </div>

          <div className="mini-proof" aria-label="Trust assurances before form">
            <span>⚡ Fast Triage</span>
            <span>🛡️ Security-First</span>
            <span>🤝 Clear Ownership</span>
          </div>

          <form onSubmit={handleLeadSubmit} onFocusCapture={handleFormFocus} noValidate>
            <input
              className="hp-field"
              type="text"
              name="website"
              tabIndex="-1"
              autoComplete="off"
              aria-hidden="true"
            />

            <label>Name<input name="name" required autoComplete="name" /></label>
            <label>Company Name<input name="company" required autoComplete="organization" /></label>

            <div className="form-row two">
              <label>Phone<input name="phone" required type="tel" autoComplete="tel" inputMode="tel" /></label>
              <label>Email<input name="email" required type="email" autoComplete="email" inputMode="email" /></label>
            </div>

            <div className="form-row two">
              <label>What do you need?
                <select name="serviceNeeded" defaultValue="" required>
                  <option value="" disabled>Select one</option>
                  <option>Emergency Outage Support</option>
                  <option>Managed IT Support</option>
                  <option>Network / Cabling / Rack Buildout</option>
                  <option>Security + Firewall Hardening</option>
                  <option>Antivirus / Endpoint Security Hardening</option>
                  <option>Workstation + Software Rollout</option>
                </select>
              </label>

              <label>Timeline
                <select name="timeline" defaultValue="" required>
                  <option value="" disabled>Select one</option>
                  <option>ASAP (Urgent)</option>
                  <option>Within 7 days</option>
                  <option>Within 30 days</option>
                  <option>Planning Phase</option>
                </select>
              </label>
            </div>

            <details className="mobile-step-2">
              <summary>Step 2: Project details</summary>

              <details className="advanced-fields">
                <summary>More details (optional)</summary>
                <div className="form-row two">
                  <label>What business are you?
                    <select name="industry" defaultValue="">
                      <option value="" disabled>Select industry</option>
                      <option>Healthcare / Medical Office</option>
                      <option>Legal / Law Firm</option>
                      <option>Accounting / CPA Firm</option>
                      <option>Financial Services / Insurance</option>
                      <option>Real Estate / Property Management</option>
                      <option>Construction / Trades</option>
                      <option>Manufacturing</option>
                      <option>Automotive / Dealership</option>
                      <option>Retail / E-Commerce</option>
                      <option>Restaurant / Hospitality</option>
                      <option>Education / Training</option>
                      <option>Nonprofit / Church</option>
                      <option>Government / Public Sector</option>
                      <option>Logistics / Transportation</option>
                      <option>Tech / SaaS</option>
                      <option>Media / Marketing Agency</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>Current provider (optional)<input name="currentProvider" autoComplete="organization" /></label>
                </div>
              </details>

              <label>Project / issue<textarea name="projectDetails" rows="4" required /></label>
            </details>

            {submitState.status !== 'idle' && (
              <p className={`form-feedback ${submitState.status}`} role="status" aria-live="polite">
                {submitState.message}
              </p>
            )}

            <button className="primary" type="submit" disabled={submitState.status === 'submitting'}>
              {submitState.status === 'submitting' ? 'Sending…' : 'Get My Priority IT Action Plan'}
            </button>
          </form>
        </section>
      </main>

      <div className="mobile-sticky-cta" aria-label="Mobile quick actions">
        <a className="cta-call" href="tel:+14804821070" aria-label="Call now">Call Now</a>
        <a className="cta-plan" href="#contact" aria-label="Get IT plan">Get IT Plan</a>
      </div>
    </div>
  )
}
