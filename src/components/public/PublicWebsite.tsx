import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Lock,
  Mail,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Button, EmptyState, ErrorAlertBanner, formatINR, LogoMark, StatusBadge } from '../ui/DesignSystem';
import { formatTime, PublicPage } from '../../types';

export const PublicWebsite: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    connectionError,
    permissionError,
    publicPage,
    selectedCategoryId,
    categories,
    subcategories,
    marketRates,
    publicListings,
    navigatePublic,
    addToast,
  } = useMarketplace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategoryFilter, setMarketCategoryFilter] = useState('ALL');
  const [marketFyFilter, setMarketFyFilter] = useState('ALL');
  const [rateBoardCategory, setRateBoardCategory] = useState('ALL');
  const [rateBoardFy, setRateBoardFy] = useState('FY 2025-26');
  const [contactForm, setContactForm] = useState({ name: '', company: '', email: '', phone: '', role: 'Buyer', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const selectedCatSubcategories = subcategories.filter((s) => s.categoryId === selectedCategory?.id);

  const navItems: { label: string; page: PublicPage }[] = [
    { label: 'Marketplace', page: 'marketplace' },
    { label: 'Market Rates', page: 'market-rates' },
    { label: 'How It Works', page: 'how-it-works' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const filteredListings = publicListings.filter((l) => {
    if (marketCategoryFilter !== 'ALL' && l.categoryId !== marketCategoryFilter) return false;
    if (marketFyFilter !== 'ALL' && l.financialYear !== marketFyFilter) return false;
    if (
      marketSearch.trim() &&
      !l.categoryName.toLowerCase().includes(marketSearch.toLowerCase()) &&
      !l.subcategory.toLowerCase().includes(marketSearch.toLowerCase()) &&
      !l.id.toLowerCase().includes(marketSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredRates = marketRates.filter((r) => {
    if (rateBoardCategory !== 'ALL' && r.categoryId !== rateBoardCategory) return false;
    if (rateBoardFy !== 'ALL' && r.financialYear !== rateBoardFy) return false;
    return true;
  });

  const legalDocs: Record<string, { title: string; updated: string; sections: { heading: string; body: string }[] }> = {
    terms: {
      title: 'Terms and Conditions',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Platform Role & Scope',
          body: 'ETP – EPR Bazaar (operated by NYANVI ECOCLEAN PRIVATE LIMITED, CIN: U38220WB2024PTC274770) functions strictly as a private B2B managed marketplace facilitating discovery, rate matching, and structured commercial negotiations between registered EPR credit buyers and sellers in India. ETP – EPR Bazaar is not a government portal, statutory exchange, or regulatory authority.',
        },
        {
          heading: '2. Managed Intermediary & Confidentiality',
          body: 'All commercial negotiations, counteroffers, and order confirmations are coordinated independently by authorized ETP – EPR Bazaar facilitators. Buyers and sellers do not negotiate directly and do not receive counterparty private contact information prior to formal transaction documentation.',
        },
        {
          heading: '3. Verification & Commercial Responsibility',
          body: 'Participants must submit accurate corporate, GST, and EPR registration documentation. Final legal terms are subject to formal review by corporate legal counsel.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Information Collected',
          body: 'Nyanvi Ecoclean Private Limited collects corporate identity, GSTIN, CIN, EPR registration numbers, authorized representative emails (via Google Sign-In for Buyers and Sellers), mobile numbers, and transaction documentation stored securely in Cloud Firestore and Firebase Storage.',
        },
        {
          heading: '2. Counterparty Anonymity',
          body: 'Buyer requirements and seller listings displayed in matching opportunities omit counterparty company names, emails, and phone numbers. Only authorized ETP – EPR Bazaar facilitators and administrators access full party profiles to coordinate negotiations.',
        },
      ],
    },
    refund: {
      title: 'Refund and Cancellation Policy',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Requirement & Listing Withdrawal',
          body: 'Buyers may withdraw unmatched requirements and Sellers may pause or withdraw unallocated listings at any time prior to formal offer acceptance.',
        },
        {
          heading: '2. Confirmed Orders & Settlement Coordination',
          body: 'Once both parties confirm an agreed rate through an ETP facilitator and an Order ID is generated, cancellations are governed by the executed commercial order sheet and advance payment terms.',
        },
      ],
    },
    disclaimer: {
      title: 'Platform Disclaimer',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Private Commercial Marketplace',
          body: 'ETP – EPR Bazaar is an independent private technology platform operated by NYANVI ECOCLEAN PRIVATE LIMITED. It does not claim affiliation with, endorsement by, or recommendation from the Central Pollution Control Board (CPCB) or any State Pollution Control Board.',
        },
        {
          heading: '2. Indicative vs. Actual Traded Rates',
          body: 'Seller asking rates and indicative market midpoints displayed on the Rate Board represent active participant listings and should not be construed as official regulatory benchmarks. Only completed orders are recorded as Actual Last Traded Rates.',
        },
      ],
    },
    'buyer-guidelines': {
      title: 'Buyer Guidelines',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Submitting Valid Requirements',
          body: 'Sign in using your corporate Google account, complete company verification (mandatory mobile number, GSTIN, and EPR registration), and submit your EPR category, financial year, required quantity, and maximum buying rate.',
        },
        {
          heading: '2. Responding to Facilitated Offers',
          body: 'When ETP Matching Engine identifies compatible seller inventory, an authorized facilitator shares an offer. You may accept, decline, or submit a counteroffer with a revised target rate.',
        },
      ],
    },
    'seller-guidelines': {
      title: 'Seller Guidelines',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Listing Certified Inventory',
          body: 'Recyclers and processors sign in with Google, upload valid facility and EPR registration details, and create listings specifying category, subcategory, financial year, available quantity, and expected selling rate.',
        },
        {
          heading: '2. Approval & Managed Negotiation',
          body: 'New listings undergo administrative verification before entering the active marketplace. Direct contact or off-platform solicitation of matched buyers violates marketplace terms.',
        },
      ],
    },
    grievance: {
      title: 'Grievance Redressal',
      updated: 'November 2026',
      sections: [
        {
          heading: '1. Grievance Officer Contact',
          body: 'For complaints regarding order coordination, payment reconciliation, or verification delays, contact NYANVI ECOCLEAN PRIVATE LIMITED at info@eprbazaar.com or +91 7439103014 (Monday–Friday, 10:00 AM to 6:00 PM IST).',
        },
        {
          heading: '2. Registered Office',
          body: '4th Floor, Saket Building, 44, Park St, Mullick Bazar, Park Street Area, Kolkata, West Bengal 700016, India.',
        },
      ],
    },
  };

  const getRateForCategory = (catId: string) => marketRates.find((r) => r.categoryId === catId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <LogoMark onClick={() => navigatePublic('home')} />

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#475569]">
            {navItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => navigatePublic(item.page)}
                className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  publicPage === item.page
                    ? 'text-[#0A172A] border-[#10233F] font-semibold'
                    : 'border-transparent hover:text-[#0A172A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="md" onClick={() => navigatePublic('login')} className="hidden sm:inline-flex">
              Login / Register
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#0A172A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  navigatePublic(item.page);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0A172A] hover:bg-[#F4F7FB]"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  navigatePublic('login');
                  setMobileMenuOpen(false);
                }}
              >
                Login / Register
              </Button>
            </div>
          </div>
        )}
      </header>

      {(connectionError || permissionError) && (
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorAlertBanner
            title={connectionError ? 'Firebase Configuration / Connection Error' : 'Data Retrieval Error'}
            message={connectionError || permissionError || ''}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children ? (
          children
        ) : publicPage === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="bg-white border-b border-[#E2E8F0]">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                  <div className="lg:col-span-6 flex flex-col justify-center">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#16A36A] mb-3">
                      Managed B2B EPR Credit Exchange · India
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0A172A] leading-[1.12] tracking-[-0.02em] text-balance">
                      India&apos;s EPR Credit Trading Marketplace
                    </h1>
                    <p className="mt-4 text-base text-[#475569] leading-relaxed max-w-xl">
                      Connect with EPR Credit Buyers and Sellers. Submit Your Quantity and Expected Rate. Let EPR Bazaar
                      Manage the Negotiations.
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Button variant="primary" onClick={() => navigatePublic('buy-credits')}>
                        Buy EPR Credits
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button variant="emerald" onClick={() => navigatePublic('sell-credits')}>
                        Sell EPR Credits
                      </Button>
                      <Button variant="secondary" onClick={() => navigatePublic('marketplace')}>
                        Explore Marketplace
                      </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E2E8F0] grid grid-cols-3 gap-4 max-w-lg">
                      <div>
                        <div className="font-mono text-lg font-bold text-[#0A172A] tabular-nums">
                          {categories.length} Categories
                        </div>
                        <div className="text-xs text-[#64748B]">Active EPR credit classes</div>
                      </div>
                      <div>
                        <div className="font-mono text-lg font-bold text-[#16A36A] tabular-nums">100% Managed</div>
                        <div className="text-xs text-[#64748B]">Confidential facilitator desk</div>
                      </div>
                      <div>
                        <div className="font-mono text-lg font-bold text-[#0A172A] tabular-nums">Zero Direct</div>
                        <div className="text-xs text-[#64748B]">Counterparty privacy protected</div>
                      </div>
                    </div>
                  </div>

                  {/* Live Firestore Market Depth Snapshot */}
                  <div className="lg:col-span-6">
                    <div className="h-full bg-[#0A172A] text-white rounded-lg border border-[#1E3A8A]/40 p-5 flex flex-col justify-between shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
                            Live Cloud Firestore Feed
                          </div>
                          <div className="text-sm font-semibold text-white mt-0.5">
                            Ask Quotes vs. Actual Completed Trade Rates
                          </div>
                        </div>
                      </div>

                      {marketRates.length === 0 ? (
                        <div className="my-10 text-center space-y-2">
                          <div className="text-sm font-semibold text-white">No live market rates published yet</div>
                          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                            Asking rates and last traded figures appear here automatically once verified seller listings and
                            completed orders are recorded in Firestore.
                          </p>
                        </div>
                      ) : (
                        <div className="my-4 overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[10px] uppercase tracking-[0.06em] text-[#94A3B8] border-b border-white/10">
                                <th className="py-2 pr-2 font-semibold">Category</th>
                                <th className="py-2 px-2 font-semibold text-right">Lowest Ask</th>
                                <th className="py-2 px-2 font-semibold text-right">Indicative</th>
                                <th className="py-2 px-2 font-semibold text-right">Last Traded</th>
                                <th className="py-2 pl-2 font-semibold text-right">Avail. Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-xs font-mono tabular-nums">
                              {marketRates.slice(0, 6).map((rate) => (
                                <tr
                                  key={rate.id}
                                  onClick={() => navigatePublic('category-details', rate.categoryId)}
                                  className="hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                  <td className="py-2.5 pr-2 font-sans font-medium text-white">{rate.categoryName}</td>
                                  <td className="py-2.5 px-2 text-right text-[#CBD5E1]">
                                    {rate.lowestAskingRate !== undefined ? formatINR(rate.lowestAskingRate) : '—'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-[#93C5FD]">
                                    {rate.indicativeRate !== undefined ? formatINR(rate.indicativeRate) : '—'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-semibold text-[#4ADE80]">
                                    {rate.lastTradedRate !== undefined ? formatINR(rate.lastTradedRate) : 'No Trades'}
                                  </td>
                                  <td className="py-2.5 pl-2 text-right text-[#CBD5E1]">
                                    {rate.availableQty.toLocaleString('en-IN')} {rate.unit}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
                        <span>Asking rates reflect active listings · Last Traded reflects completed orders only</span>
                        <button
                          type="button"
                          onClick={() => navigatePublic('market-rates')}
                          className="text-[#4ADE80] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          Open Rate Board <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Market Ticker (Only renders real Firestore rates when present) */}
            {marketRates.length > 0 && (
              <section className="bg-[#10233F] text-white border-b border-[#0A172A] overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4">
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-[#16A36A] text-white rounded shrink-0">
                    LIVE RATES
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="animate-ticker gap-8 items-center text-xs font-mono tabular-nums">
                      {[...marketRates, ...marketRates].map((r, idx) => (
                        <div key={`${r.id}-${idx}`} className="flex items-center gap-2.5 whitespace-nowrap">
                          <span className="font-sans font-semibold text-white">{r.categoryName}</span>
                          <span className="text-[#94A3B8]">
                            Ask: {r.lowestAskingRate ? formatINR(r.lowestAskingRate) : '—'}
                          </span>
                          <span className="text-[#CBD5E1]">
                            Qty: {r.availableQty.toLocaleString('en-IN')} {r.unit}
                          </span>
                          <span className="text-[#4ADE80] font-semibold">
                            Traded: {r.lastTradedRate ? formatINR(r.lastTradedRate) : '—'}
                          </span>
                          <span className="text-[#64748B]">|</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* EPR Category Section */}
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                    Supported Environmental Credits
                  </div>
                  <h2 className="font-display text-2xl sm:text-[28px] font-bold text-[#0A172A] mt-1">
                    EPR Credit Categories
                  </h2>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigatePublic('market-rates')}>
                  Compare Market Rates
                </Button>
              </div>

              {categories.length === 0 ? (
                <EmptyState
                  title="No EPR categories configured yet"
                  description="An authorised platform administrator can configure EPR trading categories (Plastic Cat I–IV, E-Waste, Battery, Tyre, Used Oil) in the Admin Portal."
                  actionLabel="Admin Sign-In"
                  onAction={() => navigatePublic('login')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => {
                    const rate = getRateForCategory(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => navigatePublic('category-details', cat.id)}
                        className="text-left bg-white border border-[#E2E8F0] rounded-lg p-5 hover:border-[#10233F] transition-colors flex flex-col justify-between cursor-pointer shadow-[0_1px_2px_0_rgba(16,35,63,0.04)]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] font-mono">
                            <span>{cat.code}</span>
                            <span>{cat.unit}</span>
                          </div>
                          <h3 className="font-display text-base font-semibold text-[#0A172A] mt-2">{cat.name}</h3>
                          <p className="mt-1.5 text-xs text-[#475569] leading-relaxed line-clamp-2">
                            {cat.description || 'Managed B2B EPR credit trading category.'}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Lowest Asking</div>
                            <div className="font-mono font-semibold text-[#0A172A] tabular-nums mt-0.5">
                              {rate?.lowestAskingRate !== undefined ? formatINR(rate.lowestAskingRate) : '—'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-[#64748B]">Last Traded</div>
                            <div className="font-mono font-semibold text-[#16A36A] tabular-nums mt-0.5">
                              {rate?.lastTradedRate !== undefined ? formatINR(rate.lastTradedRate) : 'No Trades'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* How It Works */}
            <section className="bg-white border-y border-[#E2E8F0]">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="max-w-2xl mb-10">
                  <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                    Structured B2B Workflow
                  </div>
                  <h2 className="font-display text-2xl sm:text-[28px] font-bold text-[#0A172A] mt-1">
                    How ETP – EPR Bazaar Works
                  </h2>
                  <p className="mt-2 text-sm text-[#475569]">
                    Buyers and sellers submit quantities and target rates independently. ETP matches compatible orders and
                    manages every negotiation privately.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                      <h3 className="font-display text-lg font-semibold text-[#0A172A]">For EPR Credit Buyers</h3>
                      <Button variant="primary" size="sm" onClick={() => navigatePublic('login')}>
                        Start Buying
                      </Button>
                    </div>
                    <ol className="mt-4 space-y-3">
                      {[
                        'Register corporate account via Google Sign-In and complete KYC verification.',
                        'Submit required EPR category, financial year, quantity, and maximum buying rate.',
                        'Receive automatic matching opportunity alerts when compatible inventory is found.',
                        'Review facilitated offers and submit counteroffers through EPR Bazaar.',
                        'Complete order confirmation, invoicing, and credit transfer tracking.',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#334155]">
                          <span className="font-mono text-xs font-bold text-[#10233F] bg-white border border-[#CBD5E1] rounded w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                            0{i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                      <h3 className="font-display text-lg font-semibold text-[#0A172A]">For EPR Credit Sellers</h3>
                      <Button variant="emerald" size="sm" onClick={() => navigatePublic('login')}>
                        Start Selling
                      </Button>
                    </div>
                    <ol className="mt-4 space-y-3">
                      {[
                        'Register recycler/processor account via Google Sign-In and verify EPR registration.',
                        'Submit available credit quantity, certificate reference, and expected selling rate.',
                        'Get notified when ETP matches your listing against verified buyer enquiries.',
                        'Review facilitated offers or propose revised pricing via EPR Bazaar.',
                        'Complete credit transfer verification and payment settlement tracking.',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#334155]">
                          <span className="font-mono text-xs font-bold text-[#15803D] bg-white border border-[#86EFAC] rounded w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                            0{i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Why EPR Bazaar */}
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="mb-8">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                  Platform Capabilities
                </div>
                <h2 className="font-display text-2xl sm:text-[28px] font-bold text-[#0A172A] mt-1">
                  Why Institutional Participants Choose EPR Bazaar
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    icon: Building2,
                    title: 'Buyer & Seller Connections',
                    desc: 'Verified B2B network connecting PIBOs, producers, brand owners, and registered waste processors across India.',
                  },
                  {
                    icon: SlidersHorizontal,
                    title: 'Automated Rate Matching',
                    desc: 'ETP Matching Engine evaluates category, subcategory, financial year, quantity, and bid-ask rate alignment.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Managed Negotiations',
                    desc: 'Dedicated facilitators communicate separately with buyers and sellers, keeping private contacts confidential.',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Transparent Facilitated Offers',
                    desc: 'Structured offers and counteroffers with clear GST breakdown, validity periods, and timestamped history.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Multiple EPR Categories',
                    desc: 'Unified trading desk covering Plastic Cat I–IV, E-Waste, Battery, Tyre, and Used Oil EPR credits.',
                  },
                  {
                    icon: Lock,
                    title: 'End-to-End Transaction Tracking',
                    desc: 'Structured order milestones from deal confirmation and invoicing through credit transfer verification.',
                  },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="bg-white border border-[#E2E8F0] rounded-lg p-5">
                      <Icon className="w-5 h-5 text-[#10233F]" />
                      <h3 className="font-display text-base font-semibold text-[#0A172A] mt-3">{f.title}</h3>
                      <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="bg-[#10233F] text-white">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-[28px] font-bold">
                    Start Your EPR Credit Trading Journey
                  </h2>
                  <p className="mt-1.5 text-sm text-[#CBD5E1] max-w-xl">
                    Submit a buyer requirement or list available EPR inventory today. Our facilitation desk coordinates the
                    entire transaction lifecycle.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Button variant="emerald" onClick={() => navigatePublic('login')}>
                    Access Trading Portal
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigatePublic('contact')}
                    className="bg-white/10 text-white border-white/25 hover:bg-white/20"
                  >
                    Speak with Facilitation Desk
                  </Button>
                </div>
              </div>
            </section>
          </>
        ) : publicPage === 'marketplace' ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                  Anonymized Inventory Explorer
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A172A] mt-1">EPR Marketplace</h1>
                <p className="text-sm text-[#475569] mt-1">
                  Browse verified available EPR credit lots. Seller identities are kept strictly confidential.
                </p>
              </div>
              <Button variant="primary" onClick={() => navigatePublic('login')}>
                Submit Requirement to Match
              </Button>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  placeholder="Search listing ID or category..."
                  className="w-full h-10 pl-9 pr-3 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
              <select
                value={marketCategoryFilter}
                onChange={(e) => setMarketCategoryFilter(e.target.value)}
                className="h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
              >
                <option value="ALL">All EPR Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={marketFyFilter}
                onChange={(e) => setMarketFyFilter(e.target.value)}
                className="h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
              >
                <option value="ALL">All Financial Years</option>
                <option value="FY 2024-25">FY 2024-25</option>
                <option value="FY 2025-26">FY 2025-26</option>
                <option value="FY 2026-27">FY 2026-27</option>
              </select>
              <Button
                variant="secondary"
                onClick={() => {
                  setMarketSearch('');
                  setMarketCategoryFilter('ALL');
                  setMarketFyFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            </div>

            {filteredListings.length === 0 ? (
              <EmptyState
                title="No seller listings available"
                description="Approved EPR credit listings from verified recyclers will appear here in real time."
                actionLabel="List EPR Credits"
                onAction={() => navigatePublic('login')}
              />
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                        <th className="py-3 px-4">Lot Reference</th>
                        <th className="py-3 px-4">EPR Category</th>
                        <th className="py-3 px-4">Subcategory</th>
                        <th className="py-3 px-4">Financial Year</th>
                        <th className="py-3 px-4 text-right">Available Qty</th>
                        <th className="py-3 px-4 text-right">Asking Rate</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] text-sm">
                      {filteredListings.map((l) => (
                        <tr key={l.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-[#10233F]">{l.id}</td>
                          <td className="py-3 px-4 font-medium text-[#0A172A]">{l.categoryName}</td>
                          <td className="py-3 px-4 text-[#475569]">{l.subcategory}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[#475569]">{l.financialYear}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                            {l.remainingQty.toLocaleString('en-IN')} {l.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-[#0A172A] tabular-nums">
                            {formatINR(l.askingRate)}/{l.unit}
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={l.status} /></td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="emerald" size="sm" onClick={() => navigatePublic('login')}>
                              Request Match
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : publicPage === 'market-rates' ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                  Real-Time Cloud Firestore Rate Discovery
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A172A] mt-1">
                  Live Market Rate Board
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={rateBoardCategory}
                  onChange={(e) => setRateBoardCategory(e.target.value)}
                  className="h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={rateBoardFy}
                  onChange={(e) => setRateBoardFy(e.target.value)}
                  className="h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                >
                  <option value="ALL">All Financial Years</option>
                  <option value="FY 2024-25">FY 2024-25</option>
                  <option value="FY 2025-26">FY 2025-26</option>
                  <option value="FY 2026-27">FY 2026-27</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Lowest Seller Asking</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-[#0A172A] tabular-nums">
                  {filteredRates[0]?.lowestAskingRate !== undefined ? formatINR(filteredRates[0].lowestAskingRate) : '—'}
                </div>
                <div className="mt-1 text-xs text-[#64748B]">Active seller quote floor</div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Highest Seller Asking</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-[#0A172A] tabular-nums">
                  {filteredRates[0]?.highestAskingRate !== undefined ? formatINR(filteredRates[0].highestAskingRate) : '—'}
                </div>
                <div className="mt-1 text-xs text-[#64748B]">Active seller quote ceiling</div>
              </div>
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1E3A8A]">Indicative Market Rate</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-[#1E3A8A] tabular-nums">
                  {filteredRates[0]?.indicativeRate !== undefined ? formatINR(filteredRates[0].indicativeRate) : '—'}
                </div>
                <div className="mt-1 text-xs text-[#3B82F6]">Reference asking midpoint</div>
              </div>
              <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#15803D]">Actual Last Traded Rate</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-[#15803D] tabular-nums">
                  {filteredRates[0]?.lastTradedRate !== undefined ? formatINR(filteredRates[0].lastTradedRate) : 'No Trades'}
                </div>
                <div className="mt-1 text-xs text-[#15803D]">Completed orders only</div>
              </div>
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Available Listed Qty</div>
                <div className="mt-1.5 font-mono text-2xl font-bold text-[#0A172A] tabular-nums">
                  {filteredRates.reduce((s, r) => s + r.availableQty, 0).toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-xs text-[#64748B]">Active verified inventory</div>
              </div>
            </div>

            {filteredRates.length === 0 ? (
              <EmptyState
                title="No market rates available"
                description="Market rate summaries are calculated automatically from approved seller listings and completed transactions."
              />
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">FY</th>
                        <th className="py-3 px-4 text-right">Lowest Asking</th>
                        <th className="py-3 px-4 text-right">Highest Asking</th>
                        <th className="py-3 px-4 text-right text-[#1E3A8A]">Indicative Rate</th>
                        <th className="py-3 px-4 text-right">Available Qty</th>
                        <th className="py-3 px-4 text-right text-[#15803D]">Last Traded Rate</th>
                        <th className="py-3 px-4">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] text-sm">
                      {filteredRates.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-semibold text-[#0A172A]">{r.categoryName}</td>
                          <td className="py-3 px-4 font-mono text-xs text-[#475569]">{r.financialYear}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {r.lowestAskingRate !== undefined ? formatINR(r.lowestAskingRate) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {r.highestAskingRate !== undefined ? formatINR(r.highestAskingRate) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-[#1E3A8A] bg-[#F8FAFF] tabular-nums">
                            {r.indicativeRate !== undefined ? formatINR(r.indicativeRate) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {r.availableQty.toLocaleString('en-IN')} {r.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#15803D] bg-[#F0FDF4] tabular-nums">
                            {r.lastTradedRate !== undefined ? formatINR(r.lastTradedRate) : 'No Trades Yet'}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#64748B]">{formatTime(r.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : publicPage === 'category-details' && selectedCategory ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <button
              type="button"
              onClick={() => navigatePublic('home')}
              className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
            >
              ← Back to All Categories
            </button>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-xs text-[#64748B]">{selectedCategory.code}</div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A172A] mt-1">
                    {selectedCategory.name}
                  </h1>
                  <p className="mt-2 text-sm text-[#475569] max-w-2xl">{selectedCategory.description}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="primary" onClick={() => navigatePublic('login')}>
                    Submit Buyer Requirement
                  </Button>
                  <Button variant="emerald" onClick={() => navigatePublic('login')}>
                    List Seller Credits
                  </Button>
                </div>
              </div>

              {(() => {
                const r = getRateForCategory(selectedCategory.id);
                return (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E8F0]">
                    <div>
                      <div className="text-xs text-[#64748B]">Lowest Asking Rate</div>
                      <div className="font-mono text-xl font-bold text-[#0A172A] mt-1">
                        {r?.lowestAskingRate !== undefined ? `${formatINR(r.lowestAskingRate)}/${selectedCategory.unit}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">Indicative Midpoint</div>
                      <div className="font-mono text-xl font-bold text-[#1E3A8A] mt-1">
                        {r?.indicativeRate !== undefined ? `${formatINR(r.indicativeRate)}/${selectedCategory.unit}` : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">Last Traded Rate</div>
                      <div className="font-mono text-xl font-bold text-[#16A36A] mt-1">
                        {r?.lastTradedRate !== undefined ? `${formatINR(r.lastTradedRate)}/${selectedCategory.unit}` : 'No Trades Yet'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B]">Available Inventory</div>
                      <div className="font-mono text-xl font-bold text-[#0A172A] mt-1">
                        {(r?.availableQty ?? 0).toLocaleString('en-IN')} {selectedCategory.unit}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 pt-6 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#0A172A]">Supported Subcategories</h3>
                  {selectedCatSubcategories.length === 0 ? (
                    <p className="text-xs text-[#64748B] mt-2">No subcategories configured yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-sm text-[#475569]">
                      {selectedCatSubcategories.map((sub) => (
                        <li key={sub.id} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                          <span>{sub.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#0A172A]">Applicable Financial Years</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedCategory.financialYears || ['FY 2024-25', 'FY 2025-26', 'FY 2026-27']).map((fy) => (
                      <span
                        key={fy}
                        className="font-mono text-xs px-2.5 py-1 bg-[#F4F7FB] border border-[#CBD5E1] rounded text-[#0A172A]"
                      >
                        {fy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : publicPage === 'how-it-works' || publicPage === 'buy-credits' || publicPage === 'sell-credits' ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#16A36A]">
                {publicPage === 'buy-credits'
                  ? 'Buyer Information'
                  : publicPage === 'sell-credits'
                  ? 'Seller Information'
                  : 'Platform Architecture'}
              </div>
              <h1 className="font-display text-3xl font-bold text-[#0A172A] mt-1">
                {publicPage === 'buy-credits'
                  ? 'Buy EPR Credits Through Managed Matching'
                  : publicPage === 'sell-credits'
                  ? 'Sell EPR Credits to Verified Corporate Buyers'
                  : 'How ETP – EPR Bazaar Coordinates Every Transaction'}
              </h1>
              <p className="mt-3 text-sm text-[#475569] max-w-3xl leading-relaxed">
                ETP – EPR Bazaar eliminates fragmented broker outreach. Buyers submit exact category, financial year,
                tonnage, and maximum buying rate. Sellers list verified inventory and asking rates. ETP matches
                compatible requirements automatically and assigns a dedicated facilitator to manage offers,
                counteroffers, invoicing, and transfer verification.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => navigatePublic('login')}>
                  {publicPage === 'sell-credits' ? 'Seller Google Sign-In' : 'Buyer Google Sign-In'}
                </Button>
                <Button variant="secondary" onClick={() => navigatePublic('market-rates')}>
                  View Market Rate Board
                </Button>
              </div>
            </div>
          </section>
        ) : publicPage === 'about' ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#64748B]">About the Company</div>
              <h1 className="font-display text-3xl font-bold text-[#0A172A] mt-1">About ETP – EPR Bazaar</h1>
              <p className="mt-4 text-sm text-[#475569] leading-relaxed max-w-3xl">
                ETP – EPR Bazaar is a private B2B environmental credit trading marketplace operated by{' '}
                <strong className="text-[#0A172A]">NYANVI ECOCLEAN PRIVATE LIMITED</strong> (CIN:
                U38220WB2024PTC274770), headquartered in Kolkata, West Bengal.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E2E8F0] text-sm">
                <div>
                  <div className="text-xs text-[#64748B]">Corporate Entity</div>
                  <div className="font-semibold text-[#0A172A] mt-0.5">NYANVI ECOCLEAN PRIVATE LIMITED</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">Corporate Identity Number</div>
                  <div className="font-mono font-semibold text-[#0A172A] mt-0.5">U38220WB2024PTC274770</div>
                </div>
                <div>
                  <div className="text-xs text-[#64748B]">Registered Office</div>
                  <div className="text-[#334155] mt-0.5">4th Floor, Saket Building, 44, Park St, Kolkata 700016</div>
                </div>
              </div>
            </div>
          </section>
        ) : publicPage === 'contact' ? (
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-6">
                  <h1 className="font-display text-2xl font-bold text-[#0A172A]">Contact EPR Bazaar</h1>
                  <div className="mt-6 space-y-4 text-sm text-[#334155]">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Operator</div>
                      <div className="font-semibold text-[#0A172A] mt-0.5">NYANVI ECOCLEAN PRIVATE LIMITED</div>
                      <div className="font-mono text-xs text-[#64748B]">CIN: U38220WB2024PTC274770</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Address</div>
                      <div className="mt-0.5">
                        4th Floor, Saket Building, 44, Park St, Mullick Bazar, Park Street Area, Kolkata, West Bengal
                        700016, India.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#10233F]" />
                      <span className="font-mono">info@eprbazaar.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#10233F]" />
                      <span className="font-mono">+91 7439103014</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-[#0A172A]">Send an Enquiry</h2>
                {contactSubmitted ? (
                  <div className="mt-6 p-6 bg-[#DCFCE7] border border-[#86EFAC] rounded-lg">
                    <div className="font-semibold text-[#15803D]">Enquiry Logged</div>
                    <p className="mt-1 text-sm text-[#166534]">
                      Thank you, {contactForm.name}. Please email info@eprbazaar.com or call +91 7439103014 for urgent desk
                      coordination.
                    </p>
                  </div>
                ) : (
                  <form
                    className="mt-4 space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                      addToast({ type: 'success', title: 'Enquiry noted' });
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Full Name *</label>
                        <input
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Company Name *</label>
                        <input
                          required
                          value={contactForm.company}
                          onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                          className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Business Email *</label>
                        <input
                          required
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Account Type</label>
                        <select
                          value={contactForm.role}
                          onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                          className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                        >
                          <option>Buyer (PIBO / Producer)</option>
                          <option>Seller (Authorized Recycler)</option>
                          <option>General / Partnership</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1">Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full p-3 text-sm border border-[#CBD5E1] rounded-lg"
                      />
                    </div>
                    <Button type="submit" variant="primary">Submit Enquiry</Button>
                  </form>
                )}
              </div>
            </div>
          </section>
        ) : publicPage === 'faq' ? (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-4">
            <h1 className="font-display text-3xl font-bold text-[#0A172A]">Frequently Asked Questions</h1>
            {[
              {
                q: 'Can buyers and sellers see each other’s contact details or negotiate directly?',
                a: 'No. EPR Bazaar operates strictly as a managed intermediary. Counterparty identities and private contact details are withheld from both sides, and all offers and counteroffers are coordinated by our facilitators.',
              },
              {
                q: 'Is ETP – EPR Bazaar a government portal or official exchange?',
                a: 'No. ETP – EPR Bazaar is a private B2B managed marketplace operated by Nyanvi Ecoclean Private Limited.',
              },
              {
                q: 'How do Buyers and Sellers sign in?',
                a: 'Buyers and Sellers authenticate exclusively via Google Sign-In and complete a mandatory company profile including mobile number, GSTIN, and EPR registration number.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-display text-sm font-semibold text-[#0A172A] flex items-center justify-between cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="font-mono text-[#64748B]">{openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 text-sm text-[#475569] border-t border-[#F1F5F9] pt-3">{item.a}</div>
                )}
              </div>
            ))}
          </section>
        ) : (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            {(() => {
              const doc = legalDocs[publicPage] || legalDocs.terms;
              return (
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 space-y-6">
                  <div className="border-b border-[#E2E8F0] pb-4">
                    <div className="text-xs font-mono text-[#64748B]">ETP – EPR Bazaar · Updated {doc.updated}</div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A172A] mt-1">{doc.title}</h1>
                  </div>
                  {doc.sections.map((s) => (
                    <div key={s.heading} className="space-y-1.5">
                      <h2 className="font-display text-base font-semibold text-[#0A172A]">{s.heading}</h2>
                      <p className="text-sm text-[#475569] leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                    NYANVI ECOCLEAN PRIVATE LIMITED · CIN: U38220WB2024PTC274770 · info@eprbazaar.com
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A172A] text-[#CBD5E1] border-t border-[#1E293B]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <LogoMark dark onClick={() => navigatePublic('home')} />
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Private B2B EPR Credit Trading Marketplace operated by{' '}
              <span className="text-white font-medium">NYANVI ECOCLEAN PRIVATE LIMITED</span>.
            </p>
            <div className="font-mono text-[11px] text-[#94A3B8]">CIN: U38220WB2024PTC274770</div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Marketplace</div>
            <ul className="space-y-2 text-xs">
              {[
                ['Explore Marketplace', 'marketplace'],
                ['Live Market Rates', 'market-rates'],
                ['Buy EPR Credits', 'buy-credits'],
                ['Sell EPR Credits', 'sell-credits'],
                ['How ETP Works', 'how-it-works'],
              ].map(([label, pg]) => (
                <li key={pg}>
                  <button
                    type="button"
                    onClick={() => navigatePublic(pg as PublicPage)}
                    className="hover:text-white cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Legal & Guidelines</div>
            <ul className="space-y-2 text-xs">
              {[
                ['Terms and Conditions', 'terms'],
                ['Privacy Policy', 'privacy'],
                ['Refund & Cancellation', 'refund'],
                ['Disclaimer', 'disclaimer'],
                ['Buyer Guidelines', 'buyer-guidelines'],
                ['Seller Guidelines', 'seller-guidelines'],
                ['Grievance Redressal', 'grievance'],
                ['FAQ', 'faq'],
              ].map(([label, pg]) => (
                <li key={pg}>
                  <button
                    type="button"
                    onClick={() => navigatePublic(pg as PublicPage)}
                    className="hover:text-white cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Registered Office</div>
            <p className="text-[#94A3B8] leading-relaxed">
              4th Floor, Saket Building, 44, Park St, Mullick Bazar, Park Street Area, Kolkata, West Bengal 700016, India.
            </p>
            <div className="font-mono text-white pt-1">info@eprbazaar.com</div>
            <div className="font-mono text-white">+91 7439103014</div>
            <div className="font-mono text-[#94A3B8]">https://etp.eprbazaar.com</div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <span>© 2026 NYANVI ECOCLEAN PRIVATE LIMITED. All rights reserved.</span>
          <span>Private Managed B2B Marketplace · Not a Government Exchange</span>
        </div>
      </footer>
    </div>
  );
};
