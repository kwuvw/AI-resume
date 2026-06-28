"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Header } from "@/components/shared/Header";
import { useI18n } from "@/lib/i18n/context";
import { EASE_APPLE, EASE_SPRING, fadeUp, stagger } from "@/lib/animations";

export default function PricingPage() {
  const { t } = useI18n();

  const plans = [
    {
      name: t.pricing.free.name,
      price: "$0",
      period: t.pricing.forever,
      description: t.pricing.free.description,
      features: [
        { text: t.pricing.free.f1, included: true },
        { text: t.pricing.free.f2, included: true },
        { text: t.pricing.free.f3, included: true },
        { text: t.pricing.free.f4, included: false },
        { text: t.pricing.free.f5, included: false },
        { text: t.pricing.free.f6, included: false },
      ],
      cta: t.pricing.cta,
      href: "/upload",
      popular: false,
    },
    {
      name: t.pricing.pro.name,
      price: "$19",
      period: t.pricing.perMonth,
      description: t.pricing.pro.description,
      features: [
        { text: t.pricing.pro.f1, included: true },
        { text: t.pricing.pro.f2, included: true },
        { text: t.pricing.pro.f3, included: true },
        { text: t.pricing.pro.f4, included: true },
        { text: t.pricing.pro.f5, included: true },
        { text: t.pricing.pro.f6, included: true },
      ],
      cta: t.pricing.ctaPro,
      href: "/upload",
      popular: true,
    },
    {
      name: t.pricing.enterprise.name,
      price: "$99",
      period: t.pricing.perMonth,
      description: t.pricing.enterprise.description,
      features: [
        { text: t.pricing.enterprise.f1, included: true },
        { text: t.pricing.enterprise.f2, included: true },
        { text: t.pricing.enterprise.f3, included: true },
        { text: t.pricing.enterprise.f4, included: true },
        { text: t.pricing.enterprise.f5, included: true },
        { text: t.pricing.enterprise.f6, included: true },
      ],
      cta: t.pricing.ctaEnterprise,
      href: "/upload",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t.pricing.title}</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.pricing.subtitle}</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3, ease: EASE_APPLE },
                }}
                className={`rounded-2xl glass p-8 relative transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/40 shadow-lg shadow-primary/10"
                    : "hover:border-primary/20"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-lg shadow-primary/20"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3, ease: EASE_SPRING }}
                  >
                    {t.pricing.mostPopular}
                  </motion.div>
                )}

                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-7">{plan.description}</p>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/40"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.href}
                  className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                      : "border border-border text-foreground hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
