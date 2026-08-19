import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { KeyRound, ShieldCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/app-password")({
  head: () => ({
    meta: [
      { title: "fusioniuApi · How to get a Gmail App Password" },
      { name: "description", content: "Step-by-step guide to create a Gmail App Password for use with fusioniuApi payment verification." },
    ],
  }),
  component: AppPasswordPage,
});

function AppPasswordPage() {
  const steps = [
    {
      title: "Enable 2-Step Verification",
      body: "Go to your Google Account → Security → 2-Step Verification, and turn it ON. App Passwords are only available with 2FA enabled.",
      link: { href: "https://myaccount.google.com/security", label: "Open Google Security" },
    },
    {
      title: "Open the App Passwords page",
      body: "Visit Google's App Passwords page directly. You'll be asked to re-enter your Google password.",
      link: { href: "https://myaccount.google.com/apppasswords", label: "Open App Passwords" },
    },
    {
      title: "Create a new App Password",
      body: 'In the "App name" field type something like "fusioniuApi", then click Create.',
    },
    {
      title: "Copy the 16-character password",
      body: "Google shows a 16-character password in a yellow box. Copy it (you'll never see it again). Spaces don't matter — fusioniuApi strips them automatically.",
    },
    {
      title: "Use it as the apppass parameter",
      body: "Pass this 16-character password as the apppass query parameter on the /check endpoint. Your normal Gmail password will NOT work.",
    },
  ];

  return (
    <SiteLayout>
      <section className="px-5 pt-16 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs">
            <KeyRound className="w-3.5 h-3.5 text-primary" /> Required for /check endpoint
          </div>
          <h1 className="text-5xl font-bold">
            Gmail <span className="text-primary glow-text">App Password</span> Guide
          </h1>
          <p className="mt-4 text-muted-foreground">
            fusioniuApi reads your Gmail inbox via IMAP to detect FamPay payment emails. Google requires a special <strong>App Password</strong> for this — your normal password won't work.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="card-3d rounded-2xl p-6 flex gap-5">
              <div className="shrink-0 w-12 h-12 rounded-xl btn-3d flex items-center justify-center font-bold text-lg">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                {s.link && (
                  <a href={s.link.href} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    {s.link.label} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}

          <div className="card-3d rounded-2xl p-6 border-primary/40">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-success" />
              <h3 className="font-semibold">Security note</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              fusioniuApi never stores your Gmail credentials. They are used only for that single IMAP request and discarded immediately. You can revoke an App Password anytime from Google → Security → App Passwords.
            </p>
          </div>

          <div className="text-center pt-4">
            <Link to="/docs" className="btn-3d px-6 py-3 rounded-xl font-semibold inline-flex">Back to API Docs</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
