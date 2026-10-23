import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react';

interface CalculatorCtaProps {
  compact?: boolean;
}

export const CalculatorCta = ({ compact = false }: CalculatorCtaProps) => (
  <aside
    className={`relative overflow-hidden rounded-3xl border border-brand/15 bg-ink text-white shadow-xl shadow-ink/10 ${
      compact ? 'p-5' : 'p-6 sm:p-8'
    }`}
  >
    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

    <div className="relative z-10">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-200">
        <Calculator className="h-3.5 w-3.5" />
        Free calculator
      </div>
      <h2 className={`font-extrabold tracking-tight ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
        Turn the numbers into a split plan
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        Scan a merchant QR, check the installment amounts and open each payment
        in your own UPI app.
      </p>
      <a
        href="/split"
        className="btn-primary mt-4 min-h-11 w-full px-4 text-sm"
      >
        Open the split calculator
        <ArrowRight className="h-4 w-4" />
      </a>
      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-white/40">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
        No account, no PIN storage. Plans stay in this browser for 7 days.
      </p>
    </div>
  </aside>
);
