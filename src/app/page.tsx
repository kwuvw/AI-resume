"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Target,
  BarChart3,
  FileCheck,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/shared/Header";
import { useI18n } from "@/lib/i18n/context";
import { EASE_APPLE, fadeUp, stagger } from "@/lib/animations";

export default function HomePage() {
  const { t } = useI18n();

  const features = [
    { icon: Target, title: t.features.atsTitle, desc: t.features.atsDesc },
    { icon: BarChart3, title: t.features.scoreTitle, desc: t.features.scoreDesc },
    { icon: FileCheck, title: t.features.matchTitle, desc: t.features.matchDesc },
    { icon: FileText, title: t.features.coverTitle, desc: t.features.coverDesc },
    { icon: Zap, title: t.features.instantTitle, desc: t.features.instantDesc },
    { icon: Shield, title: t.features.privacyTitle, desc: t.features.privacyDesc },
  ];

  const steps = [
    { step: "1", title: t.steps.upload.title, desc: t.steps.upload.description },
    { step: "2", title: t.steps.analyze.title, desc: t.steps.analyze.description },
    { step: "3", title: t.steps.results.title, desc: t.steps.results.description },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              <span className="gradient-text">{t.landing.heroTitle1}</span>
              <br />
              <span className="text-foreground">{t.landing.heroTitle2}</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {t.landing.heroSubtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/upload"
                className="group inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 active:scale-[0.98]"
              >
                {t.landing.cta}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-border px-8 py-4 text-base font-medium text-foreground hover:bg-white/5 transition-all duration-300"
              >
                {t.landing.learnMore}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
            className="text-2xl sm:text-3xl font-bold text-center mb-16"
          >
            {t.landing.howItWorks}
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {steps.map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary text-xl font-bold mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
            className="text-2xl sm:text-3xl font-bold text-center mb-16"
          >
            {t.landing.everythingYouNeed}
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: EASE_APPLE } }}
                className="glass rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 group cursor-default"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.landing.readyTitle}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t.landing.readySubtitle}</p>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 active:scale-[0.98]"
            >
              {t.landing.startFree}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Resume Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.landing.builtWith}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
