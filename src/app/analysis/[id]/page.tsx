"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  Target,
  FileText,
  Lightbulb,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/shared/Header";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/Toast";
import { getScoreColor, getScoreLabel } from "@/lib/utils";
import { EASE_APPLE, fadeUp, stagger } from "@/lib/animations";

interface Report {
  id: string;
  scores: {
    ats: number;
    ats_breakdown: {
      keywords: number;
      format: number;
      sections: number;
      quantification: number;
      length: number;
    };
    job_match: number | null;
    hiring_probability: number;
  };
  weaknesses: Array<{
    text: string;
    severity: "critical" | "warning" | "info";
    section: string;
  }>;
  recommendations: Array<{
    text: string;
    priority: number;
    effort: "low" | "medium" | "high";
  }>;
  skill_match: {
    matched: string[];
    missing: string[];
    partial: Array<{ skill: string; note: string }>;
  } | null;
  cover_letter: string | null;
  changes_summary: string[];
  created_at: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { addToast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "weaknesses" | "recommendations" | "cover-letter">("overview");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (!res.ok) throw new Error("Failed to load report");
        const data = await res.json();
        setReport(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load report";
        setError(msg);
        addToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t.analysis.title}...</p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE_APPLE }}
          >
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load report</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => router.push("/upload")}
              className="text-primary hover:underline"
            >
              {t.analysis.newAnalysis}
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const severityConfig = {
    critical: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  };

  const effortColors = { low: "text-success", medium: "text-yellow-400", high: "text-orange-400" };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <motion.button
            onClick={() => router.push("/upload")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowLeft className="h-4 w-4" />
            {t.analysis.newAnalysis}
          </motion.button>

          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_APPLE }}
          >
            <div>
              <h1 className="text-2xl font-bold">{t.analysis.title}</h1>
              <p className="text-sm text-muted-foreground">
                {t.analysis.analyzedOn.replace("{date}", new Date(report.created_at).toLocaleDateString())}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white/5 transition-all duration-200 active:scale-[0.98]">
              <Download className="h-4 w-4" />
              {t.analysis.exportPdf}
            </button>
          </motion.div>

          {/* Score Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            {/* ATS Score */}
            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">{t.analysis.atsScore}</h3>
              </div>
              <ScoreRing score={report.scores.ats} size={130} strokeWidth={8} />
              <p className={`mt-3 text-sm font-medium ${getScoreColor(report.scores.ats)}`}>
                {getScoreLabel(report.scores.ats)}
              </p>
            </motion.div>

            {/* Job Match */}
            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">{t.analysis.jobMatch}</h3>
              </div>
              {report.scores.job_match !== null ? (
                <>
                  <ScoreRing score={report.scores.job_match} size={130} strokeWidth={8} delay={300} />
                  <p className={`mt-3 text-sm font-medium ${getScoreColor(report.scores.job_match)}`}>
                    {getScoreLabel(report.scores.job_match)}
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center h-[130px]">
                  <p className="text-sm text-muted-foreground/60">{t.analysis.noJobDesc}</p>
                </div>
              )}
            </motion.div>

            {/* Hiring Probability */}
            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">{t.analysis.hiringProbability}</h3>
              </div>
              <ScoreRing score={report.scores.hiring_probability} size={130} strokeWidth={8} delay={400} />
              <p className={`mt-3 text-sm font-medium ${getScoreColor(report.scores.hiring_probability)}`}>
                {getScoreLabel(report.scores.hiring_probability)}
              </p>
            </motion.div>
          </motion.div>

          {/* ATS Breakdown */}
          <motion.div
            className="glass rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE_APPLE }}
          >
            <h3 className="text-lg font-semibold mb-5">{t.analysis.atsBreakdown}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(report.scores.ats_breakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    <AnimatedCounter value={value} suffix="%" />
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{key}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border/50">
            {(["overview", "weaknesses", "recommendations", "cover-letter"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "cover-letter" ? t.analysis.coverLetter : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_APPLE }}
              className="glass rounded-2xl p-6"
            >
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{t.analysis.changesMade}</h3>
                    <ul className="space-y-3">
                      {report.changes_summary.map((change, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 text-sm"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span>{change}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {report.skill_match && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t.analysis.skillMatch}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-success mb-3">
                            {t.analysis.matched} ({report.skill_match.matched.length})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {report.skill_match.matched.map((skill) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-success/10 text-success border border-success/20">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-destructive mb-3">
                            {t.analysis.missing} ({report.skill_match.missing.length})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {report.skill_match.missing.map((skill) => (
                              <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-destructive/10 text-destructive border border-destructive/20">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-400 mb-3">
                            {t.analysis.partial} ({report.skill_match.partial.length})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {report.skill_match.partial.map((item) => (
                              <span
                                key={item.skill}
                                className="px-2.5 py-1 rounded-lg text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                                title={item.note}
                              >
                                {item.skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Weaknesses */}
              {activeTab === "weaknesses" && (
                <div className="space-y-3">
                  {report.weaknesses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t.analysis.noWeaknesses}</p>
                  ) : (
                    report.weaknesses.map((weakness, i) => {
                      const config = severityConfig[weakness.severity];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={i}
                          className={`flex items-start gap-3 p-4 rounded-2xl border ${config.bg} ${config.border}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3, ease: EASE_APPLE }}
                        >
                          <Icon className={`h-5 w-5 ${config.color} mt-0.5 shrink-0`} />
                          <div>
                            <p className="text-sm">{weakness.text}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {t.analysis.section}: {weakness.section}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Recommendations */}
              {activeTab === "recommendations" && (
                <div className="space-y-3">
                  {report.recommendations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t.analysis.noRecommendations}</p>
                  ) : (
                    report.recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-2xl border border-border/50 hover:border-border transition-colors"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3, ease: EASE_APPLE }}
                      >
                        <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{rec.text}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground/60">
                              {t.analysis.priority}: {rec.priority}
                            </span>
                            <span className={`text-xs ${effortColors[rec.effort]}`}>
                              {t.analysis.effort}: {rec.effort}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Cover Letter */}
              {activeTab === "cover-letter" && (
                <div>
                  {report.cover_letter ? (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold">{t.analysis.coverLetter}</h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(report.cover_letter!);
                            addToast("Copied to clipboard", "success");
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-white/5 transition-all duration-200"
                        >
                          {t.analysis.copy}
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {report.cover_letter}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">{t.analysis.noCoverLetter}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
