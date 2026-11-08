import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  Loader,
  EmptyState,
  SectionHeading,
  Container,
  Divider,
} from '../components/ui/index.js';
import {
  fadeIn,
  fadeUp,
  slideIn,
  scaleIn,
  staggerFadeUp,
} from '../theme/animations.js';
import Logo from '../components/common/Logo.jsx';
import UdyamBadge from '../components/common/UdyamBadge.jsx';
import WhatsAppButton from '../components/common/WhatsAppButton.jsx';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  // Refs for testing GSAP animations
  const animTargetRef = useRef(null);
  const staggerContainerRef = useRef(null);

  const toggleLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  const triggerFadeUp = () => fadeUp(animTargetRef.current);
  const triggerSlideIn = () => slideIn(animTargetRef.current, 'left');
  const triggerScaleIn = () => scaleIn(animTargetRef.current);
  const triggerStagger = () => {
    if (staggerContainerRef.current) {
      staggerFadeUp(staggerContainerRef.current.children);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary pb-20">
      {/* Top Showcase Brand Header */}
      <header className="bg-brand-navy text-white border-b border-brand-navy-light sticky top-0 z-40 shadow-card">
        <Container className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="on-dark" showText={false} linkTo={null} />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MasterJi<span className="text-brand-gold">Estates</span>
                <Badge variant="brand" size="sm">UI/UX v1.0</Badge>
              </h1>
              <p className="text-xs text-brand-gold-light">
                Global Design System & Styling Foundations (Part 3)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Badge variant="direct" dot>MasterJi Direct</Badge>
            <Badge variant="brokerage">Verified Brokerage</Badge>
          </div>
        </Container>
      </header>

      <Container className="pt-10 space-y-16">
        {/* Intro Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="info" size="sm">Engineering Baseline</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy">
              Consistent, Accessible Real Estate Design System
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This interactive showcase validates color tokens, typography scales, light Neumorphic surfaces, Liquid Glass modals, and GSAP micro-animations designed for MasterJiEstates.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Test Liquid Glass Modal
            </Button>
            <Button variant="primary" loading={btnLoading} onClick={toggleLoading}>
              {btnLoading ? 'Processing...' : 'Test Button Loading'}
            </Button>
          </div>
        </div>

        {/* 1. Brand Color System */}
        <section>
          <SectionHeading
            badge="Foundation"
            title="1. Global Brand & Semantic Color Tokens"
            subtitle="Deep Navy authority paired with subtle Champagne Gold prestige accents and accessible backgrounds."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <ColorCard name="Deep Navy" hex="#0A192F" bg="bg-[#0A192F]" text="text-white" role="Dark Accents" />
            <ColorCard name="Navy Primary" hex="#0F2444" bg="bg-[#0F2444]" text="text-white" role="Brand Primary" />
            <ColorCard name="Navy Light" hex="#1B3B6F" bg="bg-[#1B3B6F]" text="text-white" role="Hover & Borders" />
            <ColorCard name="Champagne Gold" hex="#C5A059" bg="bg-[#C5A059]" text="text-slate-900" role="Prestige Accent" />
            <ColorCard name="Light Gold" hex="#D4AF37" bg="bg-[#D4AF37]" text="text-slate-900" role="Highlight Badges" />
            <ColorCard name="Soft Gold" hex="#F4E8C1" bg="bg-[#F4E8C1]" text="text-slate-900" role="Surface Fill" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
            <ColorCard name="Off-White Canvas" hex="#FAF9F6" bg="bg-[#FAF9F6]" text="text-slate-900" role="Base Canvas" border />
            <ColorCard name="Neumorphic Canvas" hex="#F0F4F8" bg="bg-[#F0F4F8]" text="text-slate-900" role="Dashboard Surface" border />
            <ColorCard name="Success Emerald" hex="#16A34A" bg="bg-[#16A34A]" text="text-white" role="Verified / Deals" />
            <ColorCard name="Warning Amber" hex="#D97706" bg="bg-[#D97706]" text="text-white" role="Under Review" />
            <ColorCard name="Error Rose" hex="#DC2626" bg="bg-[#DC2626]" text="text-white" role="Rejected / Alert" />
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section>
          <SectionHeading
            badge="Readability"
            title="2. Typography Hierarchy"
            subtitle="Clean, modern combination of Poppins for architectural headings and Inter for crisp body legibility."
          />

          <Card variant="default" className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-semibold text-slate-400">Display Title (2.5rem / 40px)</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-1">
                Luxury Residencies & Commercial Real Estate
              </h1>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-semibold text-slate-400">Heading 1 (2rem / 32px)</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
                Verified Brokerage Properties with Title Clearance
              </h2>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-semibold text-slate-400">Heading 2 (1.5rem / 24px)</span>
              <h3 className="text-xl sm:text-2xl font-semibold text-brand-navy mt-1">
                MasterJi Direct: 100% Legally Vetted Company Inventory
              </h3>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs uppercase font-semibold text-slate-400">Heading 3 & 4 (1.125rem - 1.25rem)</span>
              <h4 className="text-lg font-semibold text-brand-navy mt-1">
                Sector 48, Golf Course Extension Road, Gurugram
              </h4>
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Body Typography (16px & 14px)</span>
              <p className="text-base text-slate-700 leading-relaxed mt-1">
                MasterJiEstates eliminates friction and unsolicited spam in real estate. Owners list safely with masked phone numbers, while buyers receive verified property data and transparent transaction assistance.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                * Caption: Registered with State Real Estate Regulatory Authority (RERA). Brokerage commission invoiced on registered deed execution.
              </p>
            </div>
          </Card>
        </section>

        {/* 3. Button Component System */}
        <section>
          <SectionHeading
            badge="Components"
            title="3. Reusable Button System"
            subtitle="Multi-variant, multi-size button controls with hover, active, loading, and disabled states."
          />

          <Card variant="default" className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Navy</Button>
                <Button variant="secondary">Secondary Gold</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Action</Button>
                <Button variant="neumorphic">Neumorphic</Button>
              </div>
            </div>

            <Divider />

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="primary">Small (sm)</Button>
                <Button size="md" variant="primary">Medium (md)</Button>
                <Button size="lg" variant="primary">Large (lg)</Button>
              </div>
            </div>

            <Divider />

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Interactive States</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" loading>Loading Button</Button>
                <Button variant="primary" disabled>Disabled Button</Button>
                <Button variant="secondary" disabled>Disabled Gold</Button>
                <Button variant="outline" loading>Outline Loading</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Form Input System */}
        <section>
          <SectionHeading
            badge="Forms"
            title="4. Form Inputs & Validation States"
            subtitle="Accessible inputs supporting labels, icons, error messages, and Neumorphic inset variants."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Default Outlined</h4>
              <Input
                label="Property City / Locality"
                placeholder="e.g. Gurugram, Golf Course Rd"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter target search location"
                required
              />
            </Card>

            <Card variant="default">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Error Validation State</h4>
              <Input
                label="Mobile Number (10 Digits)"
                placeholder="9876543210"
                value="12345"
                error="Invalid mobile number format (+91 required)"
                required
              />
            </Card>

            <Card variant="default">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Neumorphic Inset Variant</h4>
              <Input
                variant="neumorphic"
                label="Quick Budget Search"
                placeholder="₹50 Lakhs to ₹2.5 Cr"
                helperText="Neumorphic inset for dashboard panels"
              />
            </Card>
          </div>
        </section>

        {/* 5. Badges & Real Estate Status Pills */}
        <section>
          <SectionHeading
            badge="Signals"
            title="5. Badges & Property Status Tags"
            subtitle="Pill indicators differentiating brokerage from direct inventory, deal status, and approval queues."
          />

          <Card variant="default">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="direct" dot>MasterJi Direct</Badge>
              <Badge variant="brokerage">Verified Brokerage</Badge>
              <Badge variant="success" dot>Available</Badge>
              <Badge variant="warning" dot>Under Negotiation</Badge>
              <Badge variant="error" dot>Sold Out</Badge>
              <Badge variant="info">Pending Review</Badge>
              <Badge variant="brand">VIP Mandate</Badge>
              <Badge variant="default">Residential Flat</Badge>
            </div>
          </Card>
        </section>

        {/* 6. Card Surfaces & Neumorphic Architecture */}
        <section>
          <SectionHeading
            badge="Surfaces"
            title="6. Card Surfaces, Neumorphism & Liquid Glass"
            subtitle="Tactile depth for dashboards, subtle elevation for public catalogs, and Liquid Glass for overlays."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="default" hoverable>
              <Badge variant="default" size="sm" className="mb-2">Default Card</Badge>
              <h4 className="font-bold text-brand-navy">Standard Public Surface</h4>
              <p className="text-xs text-slate-500 mt-1">
                Subtle border and light shadow. Hover to see micro-lift.
              </p>
            </Card>

            <Card variant="elevated" hoverable>
              <Badge variant="brand" size="sm" className="mb-2">Elevated Card</Badge>
              <h4 className="font-bold text-brand-navy">Featured Inventory</h4>
              <p className="text-xs text-slate-500 mt-1">
                Pronounced shadow for high-priority property highlights.
              </p>
            </Card>

            <Card variant="neumorphic">
              <Badge variant="info" size="sm" className="mb-2">Neumorphic Card</Badge>
              <h4 className="font-bold text-brand-navy">Dashboard Metric Tile</h4>
              <p className="text-xs text-slate-500 mt-1">
                Dual opposing shadows for tactile dashboard realism.
              </p>
            </Card>

            <Card variant="glass">
              <Badge variant="direct" size="sm" className="mb-2">Liquid Glass</Badge>
              <h4 className="font-bold text-brand-navy">Floating Filter Panel</h4>
              <p className="text-xs text-slate-500 mt-1">
                Backdrop blur 14px with translucent optical border.
              </p>
            </Card>
          </div>
        </section>

        {/* 7. Loaders & Empty State */}
        <section>
          <SectionHeading
            badge="Feedback"
            title="7. Loading Indicators & Empty States"
            subtitle="State feedback ensuring users always understand system activities."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default" className="flex flex-col justify-between">
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Loading Variants</h4>
              <div className="flex items-center justify-around p-6 bg-slate-50 rounded-xl">
                <Loader variant="spinner" size="md" color="navy" label="Loading data..." />
                <Loader variant="spinner" size="md" color="gold" label="Verifying..." />
                <Loader variant="dots" size="md" />
              </div>
              <div className="space-y-2 mt-4">
                <Loader variant="skeleton" className="h-4 w-3/4" />
                <Loader variant="skeleton" className="h-4 w-1/2" />
              </div>
            </Card>

            <EmptyState
              title="No Property Enquiries Yet"
              description="When buyers request site visits or enquire about your properties, they will appear here in real-time."
              action={
                <Button variant="primary" size="sm">
                  Browse Properties
                </Button>
              }
            />
          </div>
        </section>

        {/* 8. GSAP Motion Utilities Playground */}
        <section>
          <SectionHeading
            badge="Animation"
            title="8. GSAP Animation Engine Presets"
            subtitle="Purposeful, natural transitions respecting prefers-reduced-motion."
          />

          <Card variant="default" className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={triggerFadeUp}>
                Trigger Fade Up
              </Button>
              <Button variant="outline" size="sm" onClick={triggerSlideIn}>
                Trigger Slide In
              </Button>
              <Button variant="outline" size="sm" onClick={triggerScaleIn}>
                Trigger Scale In
              </Button>
              <Button variant="secondary" size="sm" onClick={triggerStagger}>
                Trigger Staggered Grid
              </Button>
            </div>

            {/* Target element for single animation */}
            <div
              ref={animTargetRef}
              className="p-6 bg-surface-canvas rounded-xl border border-slate-200 text-center"
            >
              <span className="text-sm font-semibold text-brand-navy">
                Interactive Animation Target: Click buttons above to trigger GSAP presets.
              </span>
            </div>

            {/* Target container for staggered grid animation */}
            <div ref={staggerContainerRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-700 shadow-xs">
                Property Card 1
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-700 shadow-xs">
                Property Card 2
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-700 shadow-xs">
                Property Card 3
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-700 shadow-xs">
                Property Card 4
              </div>
            </div>
          </Card>
        </section>

        {/* 9. Official Brand Assets & Business Integrations */}
        <section>
          <SectionHeading
            badge="Brand & Business"
            title="9. Official Brand Assets, Udyam Verification & WhatsApp"
            subtitle="Authentic PNG logo proportions, statutory Udyam badge, and contextual WhatsApp click-to-chat actions."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Variations */}
            <Card variant="default" className="space-y-4">
              <h4 className="text-sm font-bold text-brand-navy">Official Logo Proportions</h4>
              <p className="text-xs text-slate-500">
                Pixel-perfect 3:2 ratio rendering from official <code className="text-xs bg-slate-100 p-0.5 rounded font-mono">logo.png</code>.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-center">
                <Logo size="lg" />
              </div>
              <div className="p-4 bg-brand-navy-dark rounded-xl flex items-center justify-center">
                <Logo size="lg" variant="on-dark" />
              </div>
            </Card>

            {/* Udyam Badges */}
            <Card variant="default" className="space-y-4">
              <h4 className="text-sm font-bold text-brand-navy">Udyam Registration Indicators</h4>
              <p className="text-xs text-slate-500">
                Links directly to the official government portal without fabricated numbers or false claims.
              </p>
              <div className="space-y-3 pt-2">
                <UdyamBadge variant="default" />
                <UdyamBadge variant="card" />
              </div>
            </Card>

            {/* WhatsApp CTA Variants */}
            <Card variant="default" className="space-y-4">
              <h4 className="text-sm font-bold text-brand-navy">WhatsApp Click-to-Chat Actions</h4>
              <p className="text-xs text-slate-500">
                Official WhatsApp: <strong className="text-slate-800">{COMPANY_CONFIG.whatsappDisplay}</strong>
              </p>
              <div className="flex flex-col gap-2.5 pt-2">
                <WhatsAppButton variant="solid" size="sm" label="Solid Variant" />
                <WhatsAppButton variant="outline" size="sm" label="Outline Variant" />
                <div className="flex items-center gap-2">
                  <WhatsAppButton variant="pill" size="sm" label="Pill Button" />
                  <WhatsAppButton variant="icon" size="sm" />
                </div>
              </div>
            </Card>
          </div>
        </section>
      </Container>

      {/* Interactive Liquid Glass Modal Component */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Property Tour (Example Modal)"
        size="md"
        glass={true}
        actions={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm Schedule
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          This dialog demonstrates the <strong>Liquid Glass</strong> design system. It uses <code className="text-xs bg-slate-100 p-1 rounded font-mono">backdrop-filter: blur(14px)</code>, translucent borders, and accessible keyboard escape dismissal.
        </p>
        <Input
          label="Preferred Contact Time"
          placeholder="e.g. 10:00 AM - 1:00 PM"
          helperText="A MasterJi property executive will escort your walkthrough."
        />
      </Modal>
    </div>
  );
}

function ColorCard({ name, hex, bg, text, role, border = false }) {
  return (
    <div className={`rounded-xl p-3 shadow-subtle border ${border ? 'border-slate-200' : 'border-transparent'} ${bg} ${text} flex flex-col justify-between min-h-[95px]`}>
      <div>
        <div className="text-xs font-bold leading-tight">{name}</div>
        <div className="text-[10px] opacity-75 font-mono mt-0.5">{hex}</div>
      </div>
      <div className="text-[10px] font-semibold opacity-85 uppercase tracking-wider mt-2">
        {role}
      </div>
    </div>
  );
}

