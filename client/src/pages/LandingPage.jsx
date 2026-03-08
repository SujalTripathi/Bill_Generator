import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Fade-up on scroll — lightweight intersection-observer hook        */
/* ------------------------------------------------------------------ */
function useFadeUp() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('opacity-100', 'translate-y-0');
          node.classList.remove('opacity-0', 'translate-y-8');
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FadeUp({ children, className = '', delay = 0 }) {
  const ref = useFadeUp();
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                   */
/* ------------------------------------------------------------------ */
function Section({ id, bg = 'bg-white', children, className = '' }) {
  return (
    <section id={id} className={`${bg} py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Bill Mockup (hero right side)                                     */
/* ------------------------------------------------------------------ */
function BillMockup() {
  return (
    <div className="relative hidden lg:block">
      {/* Tilted paper effect */}
      <div
        className="bg-white rounded-lg shadow-2xl p-6 w-[380px] transform rotate-2 hover:rotate-0 transition-transform duration-500"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div className="border-b-2 border-indigo-600 pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">TAX INVOICE</h3>
          <p className="text-xs text-gray-500">Invoice #INV-2026-0042</p>
        </div>

        {/* Seller / Buyer */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div>
            <p className="font-semibold text-gray-700">From</p>
            <p className="text-gray-900 font-medium">ABC Traders</p>
            <p className="text-gray-500">GSTIN: 27AABCT1234F1ZP</p>
            <p className="text-gray-500">Mumbai, Maharashtra</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">To</p>
            <p className="text-gray-900 font-medium">Mehta Enterprises</p>
            <p className="text-gray-500">GSTIN: 27AAECM5678G1ZQ</p>
            <p className="text-gray-500">Pune, Maharashtra</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700">
              <th className="text-left py-1 px-2 rounded-l">Item</th>
              <th className="text-center py-1 px-2">Qty</th>
              <th className="text-right py-1 px-2">Rate</th>
              <th className="text-right py-1 px-2 rounded-r">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100">
              <td className="py-1.5 px-2">Ceiling Fan 48"</td>
              <td className="text-center py-1.5 px-2">10</td>
              <td className="text-right py-1.5 px-2">2,500</td>
              <td className="text-right py-1.5 px-2">25,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 px-2">LED Bulb 12W</td>
              <td className="text-center py-1.5 px-2">50</td>
              <td className="text-right py-1.5 px-2">120</td>
              <td className="text-right py-1.5 px-2">6,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 px-2">Copper Wire 2.5mm</td>
              <td className="text-center py-1.5 px-2">20</td>
              <td className="text-right py-1.5 px-2">350</td>
              <td className="text-right py-1.5 px-2">7,000</td>
            </tr>
          </tbody>
        </table>

        {/* GST Breakdown */}
        <div className="border-t border-gray-200 pt-2 text-xs space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>38,000</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>CGST @ 9%</span>
            <span>3,420</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>SGST @ 9%</span>
            <span>3,420</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Round Off</span>
            <span>+160</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-300">
            <span>Grand Total</span>
            <span>&#8377;45,000</span>
          </div>
        </div>

        {/* Watermark feel */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-gray-400 tracking-widest uppercase">
            Generated by SmartBill
          </span>
        </div>
      </div>

      {/* Decorative shadow paper behind */}
      <div className="absolute -z-10 top-4 left-4 w-[380px] h-full bg-indigo-200/40 rounded-lg transform rotate-6" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar (transparent over hero)                                    */
/* ------------------------------------------------------------------ */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              scrolled
                ? 'bg-indigo-600 text-white'
                : 'bg-white/20 text-white'
            }`}
          >
            SB
          </div>
          <span
            className={`text-xl font-bold tracking-tight ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            SmartBill
          </span>
        </Link>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#features"
            className={`text-sm font-medium transition ${
              scrolled
                ? 'text-gray-600 hover:text-indigo-600'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Features
          </a>
          <a
            href="#pricing"
            className={`text-sm font-medium transition ${
              scrolled
                ? 'text-gray-600 hover:text-indigo-600'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Pricing
          </a>
          <Link
            to="/login"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              scrolled
                ? 'text-indigo-600 hover:bg-indigo-50'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              scrolled
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white text-indigo-600 hover:bg-blue-50'
            }`}
          >
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`sm:hidden p-2 rounded-lg ${
            scrolled ? 'text-gray-700' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-white shadow-lg border-t">
          <div className="px-4 py-3 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium text-sm py-2">Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium text-sm py-2">Pricing</a>
            <Link to="/login" className="block text-gray-700 hover:text-indigo-600 font-medium text-sm py-2">Login</Link>
            <Link to="/register" className="block w-full text-center bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ================================================================== */
/*  LANDING PAGE COMPONENT                                            */
/* ================================================================== */
export default function LandingPage() {
  /* ---------------------------------------------------------------- */
  /*  Data                                                            */
  /* ---------------------------------------------------------------- */

  const steps = [
    {
      num: '1',
      title: 'Describe Your Bill',
      desc: "Type in plain English or Hinglish: 'Bill for Mehta Traders, 5 fans \u20B91200 each, 18% GST'",
    },
    {
      num: '2',
      title: 'AI Generates Instantly',
      desc: 'Our AI reads your text, fills all fields, calculates GST, suggests HSN codes automatically',
    },
    {
      num: '3',
      title: 'Download & Share',
      desc: 'Download professional PDF, share on WhatsApp, save to dashboard for future access',
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'GST Compliant',
      desc: 'CGST/SGST/IGST auto-calculated based on buyer-seller states',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered',
      desc: 'Describe in English or Hinglish, AI understands everything',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Mobile Ready',
      desc: 'Works perfectly on phone, tablet and desktop',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'All Bill Types',
      desc: 'Tax Invoice, Retail Bill, Delivery Challan, Credit Note and more',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: 'Custom Fields',
      desc: 'Add vehicle number, signature, stamp \u2014 any field you need',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      title: 'Dashboard',
      desc: 'Track all invoices, revenue charts, customer management',
    },
  ];

  const billTypes = [
    'Tax Invoice',
    'Retail Bill',
    'Proforma Invoice',
    'Delivery Challan',
    'Credit Note',
    'Purchase Order',
    'Transport Bill',
    'Medical Bill',
    'Restaurant Bill',
    'Contractor Bill',
  ];

  const pricingPlans = [
    {
      name: 'FREE',
      price: '\u20B90',
      period: '/month',
      highlighted: false,
      badge: null,
      features: [
        { text: '5 invoices/month', included: true },
        { text: 'PDF download', included: true },
        { text: 'WhatsApp share', included: true },
        { text: 'All bill types', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Unlimited invoices', included: false },
      ],
      cta: 'Get Started Free',
      ctaLink: '/register',
      ctaStyle: 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    },
    {
      name: 'PRO',
      price: '\u20B9299',
      period: '/month',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        { text: 'Unlimited invoices', included: true },
        { text: 'Custom logo & branding', included: true },
        { text: 'Customer management', included: true },
        { text: 'Revenue dashboard', included: true },
        { text: 'Email invoices', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Start Pro \u2192',
      ctaLink: '/register',
      ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-700',
    },
    {
      name: 'BUSINESS',
      price: '\u20B9799',
      period: '/month',
      highlighted: false,
      badge: null,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Multiple businesses', included: true },
        { text: 'Team access', included: true },
        { text: 'API access', included: true },
        { text: 'GSTR-1 export', included: true },
        { text: 'White label', included: true },
      ],
      cta: 'Contact Sales',
      ctaLink: null,
      ctaStyle: 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    },
  ];

  const footerLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <LandingNav />

      {/* ============================================================ */}
      {/*  SECTION 1 — Hero                                            */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <FadeUp>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Generate Professional <br className="hidden sm:block" />
                Bills in Seconds
              </h1>
            </FadeUp>

            <FadeUp delay={150}>
              <p className="mt-6 text-lg text-blue-100 max-w-xl mx-auto lg:mx-0">
                Just describe your bill in plain language. Our AI creates a
                GST-compliant invoice instantly.
              </p>
            </FadeUp>

            <FadeUp delay={300}>
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold text-base shadow-lg shadow-indigo-900/20 hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
                >
                  Start Free
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={450}>
              <p className="mt-6 text-sm text-blue-200/70">
                No credit card required &middot; 5 free invoices/month
              </p>
            </FadeUp>
          </div>

          {/* Right — bill mockup */}
          <FadeUp delay={400} className="flex-shrink-0">
            <BillMockup />
          </FadeUp>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — How It Works                                    */}
      {/* ============================================================ */}
      <Section id="how-it-works" bg="bg-gray-50">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Three simple steps to your first professional invoice
            </p>
          </div>
        </FadeUp>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Dashed connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.666%+24px)] right-[calc(16.666%+24px)] border-t-2 border-dashed border-indigo-300" />

          {steps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 150}>
              <div className="relative flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-200 mb-5">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 max-w-xs">{step.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 3 — Features Grid                                   */}
      {/* ============================================================ */}
      <Section id="features" bg="bg-white">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Powerful features that make invoicing effortless
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 100}>
              <div className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 4 — Bill Types Supported                            */}
      {/* ============================================================ */}
      <Section id="bill-types" bg="bg-gray-50">
        <FadeUp>
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Supports Every Bill Type
            </h2>
            <p className="mt-3 text-gray-500">
              From tax invoices to restaurant bills, we have you covered
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center flex-nowrap">
            {billTypes.map((type) => (
              <span
                key={type}
                className="flex-shrink-0 rounded-full bg-white shadow px-5 py-2.5 text-sm font-medium text-gray-700 hover:shadow-md hover:text-indigo-600 transition-all cursor-default"
              >
                {type}
              </span>
            ))}
          </div>
        </FadeUp>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 5 — Pricing                                         */}
      {/* ============================================================ */}
      <Section id="pricing" bg="bg-white">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Start free, upgrade when you grow. No hidden fees ever.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricingPlans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 150}>
              <div
                className={`relative rounded-2xl p-8 transition-shadow duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.03] bg-white'
                    : 'border border-gray-200 bg-white hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-sm font-bold tracking-widest text-indigo-600 uppercase">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 text-base">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat.text} className="flex items-start gap-3 text-sm">
                      {feat.included ? (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={feat.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.ctaLink ? (
                  <Link
                    to={plan.ctaLink}
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SECTION 6 — Footer                                          */}
      {/* ============================================================ */}
      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Logo & tagline */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                  SB
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  SmartBill
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                AI-powered invoicing for Indian businesses
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {footerLinks.map((link) =>
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>Made with love in India</p>
            <p>&copy; 2026 SmartBill. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
