"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  ShieldCheck,
  ScanLine,
  Activity,
  Zap,
  BarChart3,
  Cpu,
  CheckCircle2,
} from "lucide-react";

/* ── Animation Variants ──────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ── Section Wrapper ─────────────────────────────────── */
function AnimatedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ══════════════════════════════════════════════════════════
   LANDING PAGE CONTENT
   ══════════════════════════════════════════════════════════ */
export function LandingContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <main className="flex-1 flex flex-col">
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="z-10">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary font-data text-xs font-semibold uppercase tracking-widest rounded-full mb-6"
            >
              <Zap className="h-3.5 w-3.5" />
              AI-Driven Inventory Automation
            </motion.span>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-6"
            >
              Smart Battery <br />
              <span className="text-primary">Management.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl mb-10"
            >
              Sistem manajemen inventaris pintar untuk manufaktur EV & Baterai.
              Otomatisasi pelacakan status barang secara real-time untuk mencegah
              keterlambatan produksi dan kesalahan fatal.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/login"}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-heading text-base font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-[0.97]"
              >
                Coba Demo Interaktif
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-4 rounded-xl font-heading text-base font-semibold hover:bg-muted/50 transition-all"
              >
                Lihat Solusi Kami
              </Link>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            variants={scaleUp}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-energy-core.png"
                alt="Elevaite Volt-Guard Energy Core"
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-6 -left-4 sm:-left-8 glass-card p-5 sm:p-6 rounded-xl shadow-xl max-w-[220px] animate-float"
            >
              <p className="font-data text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Real-Time Efficiency
              </p>
              <p className="font-data text-3xl font-medium text-primary tracking-tight">
                99.98%
              </p>
              <div className="w-full bg-muted h-1.5 rounded-full mt-3">
                <div className="bg-primary h-full w-[99%] rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── VALUE PROPS / FEATURES ────────────────────── */}
      <AnimatedSection className="py-20 md:py-28 bg-white dark:bg-card" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4"
            >
              Precision Engineering for Scale
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg">
              Ekosistem Volt-Guard dibangun di atas tiga pilar keunggulan industri,
              memastikan infrastruktur Anda siap masa depan sejak hari pertama.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="AI-Based Inventory"
              description="Prediksi degradasi & Auto-Quarantine. Sistem menganalisis data sensor IoT secara instan. Jika suhu palet melebihi batas aman, status otomatis berubah menjadi REJECT."
              image="/images/feature-battery-cells.png"
              imageAlt="Precision battery cells"
              index={0}
              accentColor="bg-primary/10 text-primary"
            />

            {/* Card 2 */}
            <FeatureCard
              icon={<ScanLine className="h-6 w-6" />}
              title="Circular Sustainability"
              description="Manajemen siklus hidup terintegrasi. 98% komponen dapat dipulihkan dan didaur ulang dalam jaringan Volt-Guard untuk efisiensi operasional."
              image="/images/feature-sustainability.png"
              imageAlt="Sustainable battery facility"
              index={1}
              accentColor="bg-secondary/10 text-secondary"
            />

            {/* Card 3 */}
            <FeatureCard
              icon={<Activity className="h-6 w-6" />}
              title="Predictive Intelligence"
              description="Diagnostik berbasis Edge-AI. Prediksi kebutuhan puncak dan cegah masalah perawatan sebelum berdampak pada waktu operasional Anda."
              image="/images/feature-dashboard.png"
              imageAlt="Data visualization dashboard"
              index={2}
              accentColor="bg-primary/10 text-primary"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* ── TECHNOLOGY / CORE-X ARCHITECTURE ──────────── */}
      <AnimatedSection
        className="py-20 md:py-28 bg-[var(--surface-container-low)] dark:bg-background overflow-hidden"
        id="technology"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            {/* Image */}
            <motion.div variants={scaleUp} className="flex-1 order-2 lg:order-1 relative">
              <div className="bg-white dark:bg-card p-3 sm:p-4 rounded-2xl shadow-2xl">
                <Image
                  src="/images/battery-architecture.png"
                  alt="Core-X Battery Architecture"
                  width={600}
                  height={450}
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <div className="absolute -top-5 -right-5 bg-primary text-primary-foreground p-4 sm:p-5 rounded-xl shadow-lg animate-pulse-glow">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1 order-1 lg:order-2">
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="font-heading text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-6"
              >
                Core-X Architecture
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-muted-foreground text-lg leading-relaxed mb-8"
              >
                Teknologi Core-X menggunakan konduktor keramik berpendingin cair
                untuk menjaga performa puncak bahkan di bawah beban industri
                ekstrem. Ini adalah jantung dari setiap instalasi Volt-Guard.
              </motion.p>

              <motion.ul variants={fadeUp} custom={2} className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-foreground">
                      Thermal Equilibrium
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Disipasi panas tanpa kehilangan untuk throughput tegangan
                      tinggi 24/7 secara kontinu.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-foreground">
                      Modular Scaling
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Modul plug-and-play memungkinkan infrastruktur Anda
                      bertumbuh seiring permintaan.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-foreground">
                      AI Document Scanner
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Pemindaian otomatis dokumen QA lab menggunakan Azure
                      Document Intelligence untuk rilis inventaris instan.
                    </p>
                  </div>
                </li>
              </motion.ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── HOW IT WORKS (The Synergy Cycle) ──────────── */}
      <AnimatedSection className="py-20 md:py-28 bg-white dark:bg-card" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-heading text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4"
          >
            The Volt-Guard Cycle
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto"
          >
            Empat langkah otomatis dari penerimaan baterai hingga rilis produksi.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Ingest",
                desc: "Baterai diterima dari vendor dan didaftarkan ke sistem dengan status Pending QA.",
                icon: <Cpu className="h-5 w-5" />,
              },
              {
                step: "02",
                title: "Monitor",
                desc: "Sensor IoT mengawasi suhu & kelembaban secara real-time di rak penyimpanan.",
                icon: <BarChart3 className="h-5 w-5" />,
              },
              {
                step: "03",
                title: "Scan",
                desc: "AI Scanner memindai dokumen lab secara otomatis untuk ekstraksi data QA.",
                icon: <ScanLine className="h-5 w-5" />,
              },
              {
                step: "04",
                title: "Release",
                desc: "Pallet yang lolos otomatis dirilis; anomali dikarantina tanpa intervensi manusia.",
                icon: <ShieldCheck className="h-5 w-5" />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i + 2}
                className="group p-8 border border-border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-background"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {item.icon}
                </div>
                <div className="font-data text-2xl font-medium text-primary mb-2">
                  {item.step}
                </div>
                <h4 className="font-heading text-lg font-semibold mb-2">{item.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── STATS / DARK SECTION ──────────────────────── */}
      <AnimatedSection className="py-20 md:py-28 bg-[var(--navy)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-6"
            >
              Tantangan <br /> Manufaktur Modern
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-slate-300 text-lg leading-relaxed mb-10"
            >
              Ketergantungan pada proses manual yang rentan kesalahan menghambat
              efisiensi produksi. Volt-Guard mengubah tantangan menjadi peluang
              dengan otomasi cerdas.
            </motion.p>

            <motion.div variants={fadeUp} custom={2} className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-data text-4xl font-medium text-purple-400">40%</p>
                <p className="font-data text-xs uppercase tracking-widest text-slate-400 mt-1">
                  Peningkatan Efisiensi
                </p>
              </div>
              <div>
                <p className="font-data text-4xl font-medium text-purple-400">24/7</p>
                <p className="font-data text-xs uppercase tracking-widest text-slate-400 mt-1">
                  Real-Time Monitoring
                </p>
              </div>
              <div>
                <p className="font-data text-4xl font-medium text-violet-400">98%</p>
                <p className="font-data text-xs uppercase tracking-widest text-slate-400 mt-1">
                  Komponen Recyclable
                </p>
              </div>
              <div>
                <p className="font-data text-4xl font-medium text-violet-400">0</p>
                <p className="font-data text-xs uppercase tracking-widest text-slate-400 mt-1">
                  Human Error
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={scaleUp}
            className="relative rounded-2xl overflow-hidden h-[350px] sm:h-[400px] border border-white/10"
          >
            <Image
              src="/images/feature-dashboard.png"
              alt="Global monitoring dashboard"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)] via-transparent to-transparent" />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── CTA SECTION ───────────────────────────────── */}
      <AnimatedSection className="py-20 md:py-28 bg-white dark:bg-card relative overflow-hidden" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-6"
            >
              Powering Your Transition
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-muted-foreground text-lg mb-10 leading-relaxed"
            >
              Didesain khusus untuk AI Impact Challenge. Elevaite Volt-Guard
              menjembatani gap antara masalah manufaktur tradisional dan teknologi
              masa depan. Mulai transformasi digital Anda hari ini.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/login"}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-10 py-4 rounded-xl font-heading text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-[0.97]"
              >
                Mulai Sekarang
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      </AnimatedSection>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="w-full border-t border-border bg-muted/30 dark:bg-card">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Elevaite Volt-Guard"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-heading text-base font-bold text-foreground">
                Volt-Guard
              </span>
            </div>
            <p className="font-heading text-xs text-muted-foreground">
              © {new Date().getFullYear()} Elevaite Volt-Guard — AI Impact Challenge
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {["Features", "Technology", "How It Works", "About"].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase().replace(/ /g, "-")}`}
                className="font-heading text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Feature Card Component ────────────────────────── */
function FeatureCard({
  icon,
  title,
  description,
  image,
  imageAlt,
  index,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  index: number;
  accentColor: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index + 2}
      className="group bg-white dark:bg-card rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 flex-grow">
        <div
          className={`w-12 h-12 ${accentColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className="px-4 pb-4">
        <Image
          src={image}
          alt={imageAlt}
          width={400}
          height={240}
          className="w-full h-48 object-cover rounded-xl"
        />
      </div>
    </motion.div>
  );
}
