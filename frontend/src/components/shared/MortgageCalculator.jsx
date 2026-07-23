import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INPUT_CLS = "rounded-xl border-brand-ink/15 bg-white/70 text-brand-ink focus-visible:ring-1 focus-visible:ring-brand-gold focus-visible:border-brand-gold";

/** Single source for calculator starting inputs — assumption copy is derived from these. */
export const MORTGAGE_CALC_DEFAULTS = {
    price: 420000,
    deposit: 63000,
    rate: 9.5,
    term: 25,
};

function money(n) {
    if (!isFinite(n) || n <= 0) return "—";
    return "US$" + Math.round(n).toLocaleString();
}

function assumptionCopy(defaults) {
    const depositPct = defaults.price > 0 ? Math.round((defaults.deposit / defaults.price) * 100) : 0;
    return (
        `Estimates only, for illustration. Default inputs (about ${depositPct}% deposit, ${defaults.rate}% interest, ${defaults.term}-year term) ` +
        "are starting points for exploration — not a quote, credit offer, or Sagicor rate. " +
        "Actual rates, deposit requirements, and eligibility differ for local and overseas buyers and are confirmed by your lender."
    );
}

export default function MortgageCalculator() {
    const [price, setPrice] = useState(MORTGAGE_CALC_DEFAULTS.price);
    const [deposit, setDeposit] = useState(MORTGAGE_CALC_DEFAULTS.deposit);
    const [rate, setRate] = useState(MORTGAGE_CALC_DEFAULTS.rate);
    const [term, setTerm] = useState(MORTGAGE_CALC_DEFAULTS.term);

    const { loan, monthly } = useMemo(() => {
        const loanAmt = Math.max(0, Number(price) - Number(deposit));
        const r = Number(rate) / 100 / 12;
        const n = Number(term) * 12;
        const m = r > 0 ? (loanAmt * r) / (1 - Math.pow(1 + r, -n)) : loanAmt / n;
        return { loan: loanAmt, monthly: m };
    }, [price, deposit, rate, term]);

    const field = (id, label, value, set, props = {}) => (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} data-testid={id} type="number" className={INPUT_CLS} value={value} onChange={(e) => set(e.target.value)} {...props} />
        </div>
    );

    return (
        <div className={`grid gap-10 lg:grid-cols-2`} data-testid="mortgage-calculator">
            <div className="grid gap-5 sm:grid-cols-2">
                {field("calc-price", "Purchase Price (USD)", price, setPrice)}
                {field("calc-deposit", "Deposit (USD)", deposit, setDeposit)}
                {field("calc-rate", "Interest Rate (%)", rate, setRate, { step: "0.1" })}
                {field("calc-term", "Loan Term (years)", term, setTerm)}
            </div>
            <div className="flex flex-col justify-center gap-6 rounded-[1.5rem] bg-brand-ivory p-8">
                <div>
                    <p className="lux-eyebrow text-brand-ink/45">Estimated Monthly Payment</p>
                    <p className="mt-2 font-display text-5xl text-brand-gold" data-testid="calc-monthly">{money(monthly)}</p>
                </div>
                <div className="border-t border-brand-beige pt-6">
                    <p className="lux-eyebrow text-brand-ink/45">Estimated Loan Amount</p>
                    <p className="mt-2 font-display text-3xl text-brand-blue" data-testid="calc-loan">{money(loan)}</p>
                </div>
                <p className="font-sans text-xs leading-relaxed text-brand-ink/45" data-testid="calc-assumptions">
                    {assumptionCopy(MORTGAGE_CALC_DEFAULTS)}
                </p>
            </div>
        </div>
    );
}
