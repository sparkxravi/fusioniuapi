import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import sparkLogo from "@/assets/spark-logo.png";
import { MapPin, GraduationCap, Send, Code2, Shield, Terminal, Bot } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Developer — Spark (Ravi Yadav) · fusioniuApi" },
      { name: "description", content: "Meet Spark (Ravi Yadav) — the developer behind fusioniuApi. Class 12 PCM graduate, JEE aspirant, web & cybersecurity enthusiast." },
      { property: "og:title", content: "About Spark — Developer of fusioniuApi" },
      { property: "og:description", content: "Builder of fusioniuApi. Web, cybersecurity, Linux, and bots." },
    ],
  }),
  component: About,
});

function About() {
  const skills = [
    { icon: Code2, label: "Web Development" },
    { icon: Shield, label: "Cybersecurity" },
    { icon: Terminal, label: "Linux" },
    { icon: Bot, label: "Smart Bots" },
  ];

  return (
    <SiteLayout>
      <section className="px-5 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 blur-3xl bg-primary/40 rounded-full" />
              <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto rounded-3xl overflow-hidden ring-2 ring-primary/50 shadow-[var(--shadow-glow-lg)] float">
                <img src={sparkLogo} alt="Spark" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Hey, I'm <span className="text-primary glow-text">Spark</span>
            </h1>
            <p className="mt-3 text-muted-foreground">aka Ravi Yadav · Developer of fusioniuApi</p>
          </div>

          <div className="card-3d rounded-2xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-4">About Me</h2>
            <p className="text-muted-foreground leading-relaxed">
              I'm a recent <span className="text-foreground font-medium">Class 12 PCM graduate</span> currently preparing for <span className="text-foreground font-medium">JEE</span>.
              I have a strong passion for technology and creativity, with hands-on experience in building web projects,
              exploring cybersecurity, working with Linux, and developing smart bots that solve real problems.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              I enjoy learning independently through coding, experimentation, and continuous improvement.
              My goal is to become a skilled developer and cybersecurity expert — creating secure and impactful
              digital solutions while growing consistently in both knowledge and discipline.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 rounded-xl border border-border/60 bg-card/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MapPin className="w-3.5 h-3.5" /> From</div>
                <div className="font-semibold">Gurgaon</div>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-card/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /> Profession</div>
                <div className="font-semibold">Student / JEE Aspirant</div>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-card/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /> Class</div>
                <div className="font-semibold">12 PCM Graduate</div>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-10 mb-4">What I Work With</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm">
                  <s.icon className="w-4 h-4 text-primary" />
                  {s.label}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://t.me/btwspark" target="_blank" rel="noreferrer" className="btn-3d px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                <Send className="w-4 h-4" /> Telegram @btwspark
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
