import './App.css'

const services = [
  'Managed IT Support (24/7)',
  'Network Design + Deployment',
  'Low-Voltage Cabling + Rack Installs',
  'Switching, Wi-Fi, and Access Points',
  'Firewall Setup + Security Hardening',
  'Cameras, Audio, and Access Control',
  'Workstations + Business Software Rollouts',
  'Cloud, Backup, and Continuity Planning',
]

export default function App() {
  const base = import.meta.env.BASE_URL
  const heroVariant = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('hero') === 'b' ? 'b' : 'a'

  const hero = heroVariant === 'b'
    ? {
        title: 'Rapid IT response for mission-critical teams.',
        proof: 'Built for speed under pressure: fast triage, clear ownership, and decisive execution.',
        sub: 'Wyre Pros secures and supports your environment with 24/7 AI-optimized operations—so incidents get addressed fast and operations keep moving.',
        cta: 'Get My Rapid Response Plan',
      }
    : {
        title: 'Reduce downtime. Protect operations.',
        proof: 'Trusted for uptime-first environments, rapid response, and clean execution standards.',
        sub: 'Wyre Pros designs, builds, secures, and supports business technology environments—from network foundations and endpoint rollout to 24/7 AI-optimized support operations.',
        cta: 'Get My IT Game Plan',
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
        <a className="brand" href="#top" aria-label="Wyre Pros home">
          <img src={`${base}wyrepros-logo.jpg`} alt="Wyre Pros logo" />
        </a>
        <nav aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#platform">Platform</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="call-btn" href="tel:+14804821070">Call 480-482-1070</a>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">IT INFRASTRUCTURE FOR MODERN BUSINESS</p>
          <h1>{hero.title}</h1>
          <p className="hero-proof">{hero.proof}</p>
          <p className="sub">{hero.sub}</p>
          <div className="actions">
            <a className="primary" href="#contact">{hero.cta}</a>
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
            <article><span className="trust-kicker">🛡️ Coverage</span><h3>24/7</h3><p>AI-optimized monitoring and response operations</p></article>
            <article><span className="trust-kicker">🌎 Reach</span><h3>USA Wide</h3><p>Remote-first support with national coverage capability</p></article>
            <article><span className="trust-kicker">📈 Standard</span><h3>Uptime-First</h3><p>Standards-driven execution with clear communication</p></article>
          </div>
          <p className="trust-note">Response and resolution timelines vary by issue complexity, environment, and service scope.</p>
        </section>

        <section id="services" className="section">
          <div className="sectionHead">
            <p className="eyebrow">CORE SERVICES</p>
            <h2>Everything your organization needs in one technical partner.</h2>
          </div>
          <div className="serviceGrid">
            {services.map((s) => (
              <article key={s} className="card"><h3>{s}</h3></article>
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
            <article><h4>Secure</h4><p>Firewall policy, segmentation, and security architecture built for resilience.</p></article>
            <article><h4>Support</h4><p>24/7 AI-optimized operations for faster triage and issue flow.</p></article>
          </aside>
        </section>

        <section id="process" className="section">
          <div className="sectionHead">
            <p className="eyebrow">EXECUTION MODEL</p>
            <h2>Assess → Design → Build → Secure → Support</h2>
          </div>
          <div className="timeline">
            {['Assess', 'Design', 'Build', 'Secure', 'Support'].map((s, i) => (
              <article key={s}><span>{String(i + 1).padStart(2, '0')}</span><h3>{s}</h3></article>
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
            <h2>Ready to upgrade your IT operations?</h2>
            <p>Tell us what you’re building or fixing. We’ll map the fastest path to a secure, stable environment and next-step scope.</p>
            <p><strong>Priority response available for active outages.</strong></p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <label>Name<input required autoComplete="name" /></label>
            <label>Company Name<input required autoComplete="organization" /></label>
            <label>Phone<input required type="tel" autoComplete="tel" inputMode="tel" /></label>
            <label>Email<input required type="email" autoComplete="email" inputMode="email" /></label>

            <div className="form-row two">
              <label>What business are you?
                <select defaultValue="" required>
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

              <label>What do you need?
                <select defaultValue="" required>
                  <option value="" disabled>Select one</option>
                  <option>Managed IT Support</option>
                  <option>Network / Cabling / Rack Buildout</option>
                  <option>Security + Firewall Hardening</option>
                  <option>Workstation + Software Rollout</option>
                  <option>Emergency Outage Support</option>
                </select>
              </label>
            </div>

            <label>Timeline
              <select defaultValue="" required>
                <option value="" disabled>Select one</option>
                <option>ASAP (Urgent)</option>
                <option>Within 7 days</option>
                <option>Within 30 days</option>
                <option>Planning Phase</option>
              </select>
            </label>
            <label>Project / issue<textarea rows="4" required /></label>
            <button className="primary" type="submit">Request Priority IT Response</button>
          </form>
        </section>
      </main>

      <a className="mobile-sticky-cta" href="#contact" aria-label="Get IT plan">
        Get IT Plan
      </a>
    </div>
  )
}
