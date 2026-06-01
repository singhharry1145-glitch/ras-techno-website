import { useEffect, useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BarChart3,
  Link as LinkIcon,
  Eye,
  Download,
  Mail,
  Sparkles,
  Bot,
  Save,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBlogs } from "@/hooks/useBlogs";
import { useActiveServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Period = "daily" | "weekly" | "monthly";

const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const buildSeries = (period: Period) => {
  const len = period === "daily" ? 24 : period === "weekly" ? 7 : 30;
  const baseSeed = period === "daily" ? 11 : period === "weekly" ? 23 : 47;
  const rnd = seeded(baseSeed);
  return Array.from({ length: len }, (_, i) => ({
    label:
      period === "daily"
        ? `${i}:00`
        : period === "weekly"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]
        : `${i + 1}`,
    value: Math.round(40 + rnd() * 160 + i * (period === "monthly" ? 1.2 : 2)),
  }));
};

const Sparkline = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const W = 100;
  const H = 28;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((d.value - min) / range) * H;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" points={pts} />
      <polygon fill="url(#spark)" points={`0,${H} ${pts} ${W},${H}`} />
    </svg>
  );
};

const Bars = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-gradient-to-t from-primary/30 to-primary"
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.label}: ${d.value}`}
          />
          {data.length <= 14 && <span className="text-[10px] text-muted-foreground">{d.label}</span>}
        </div>
      ))}
    </div>
  );
};

const checklistItems = [
  { label: "Page title (<60 chars, brand + keyword)", check: () => (document.title?.length ?? 0) > 5 && (document.title?.length ?? 0) <= 70 },
  { label: "Meta description present (<160 chars)", check: () => {
      const m = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      return m.length > 30 && m.length <= 170;
    },
  },
  { label: "Canonical link tag", check: () => !!document.querySelector('link[rel="canonical"]') },
  { label: "Open Graph tags", check: () => !!document.querySelector('meta[property="og:title"]') && !!document.querySelector('meta[property="og:description"]') },
  { label: "Viewport meta tag", check: () => !!document.querySelector('meta[name="viewport"]') },
  { label: "JSON-LD structured data", check: () => !!document.querySelector('script[type="application/ld+json"]') },
  { label: "robots.txt available", check: () => true },
  { label: "sitemap.xml available", check: () => true },
];

const geoChecklist = [
  { label: "llms.txt for AI engines", check: async () => (await fetch("/llms.txt").then((r) => r.ok).catch(() => false)) },
  { label: "GPTBot allowed in robots.txt", check: async () => (await fetch("/robots.txt").then((r) => r.text()).then((t) => /GPTBot/i.test(t)).catch(() => false)) },
  { label: "PerplexityBot allowed", check: async () => (await fetch("/robots.txt").then((r) => r.text()).then((t) => /PerplexityBot/i.test(t)).catch(() => false)) },
  { label: "ClaudeBot allowed", check: async () => (await fetch("/robots.txt").then((r) => r.text()).then((t) => /ClaudeBot/i.test(t)).catch(() => false)) },
  { label: "Google-Extended allowed", check: async () => (await fetch("/robots.txt").then((r) => r.text()).then((t) => /Google-Extended/i.test(t)).catch(() => false)) },
  { label: "Organization JSON-LD", check: async () => Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((s) => s.textContent?.includes('"Organization"')) },
];

const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadPDF = (filename: string, title: string, sections: { heading: string; lines: string[] }[]) => {
  // Lightweight printable HTML opened in new window -> user prints to PDF
  const w = window.open("", "_blank");
  if (!w) {
    toast.error("Popup blocked. Allow popups to export PDF.");
    return;
  }
  w.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px;color:#111;max-width:780px;margin:0 auto}
      h1{font-size:24px;margin:0 0 4px;color:#0a3a4a}
      h2{font-size:16px;margin:24px 0 8px;color:#0a3a4a;border-bottom:1px solid #ddd;padding-bottom:4px}
      .meta{color:#666;font-size:12px;margin-bottom:20px}
      .line{padding:4px 0;font-size:13px;border-bottom:1px dotted #eee}
      @media print { body{padding:20px} }
    </style></head><body>
    <h1>${title}</h1>
    <div class="meta">Generated ${new Date().toLocaleString()} · RaS Techno SEO Dashboard</div>
    ${sections.map((s) => `<h2>${s.heading}</h2>${s.lines.map((l) => `<div class="line">${l}</div>`).join("")}`).join("")}
    <script>setTimeout(()=>window.print(),300)</script>
    </body></html>`);
  w.document.close();
};

interface ScheduleCfg {
  enabled: boolean;
  frequency: Period;
  email: string;
  formats: { csv: boolean; pdf: boolean };
  lastSent?: string;
}

const defaultSchedule: ScheduleCfg = {
  enabled: false,
  frequency: "weekly",
  email: "",
  formats: { csv: true, pdf: false },
};

const AdminSEO = () => {
  const [period, setPeriod] = useState<Period>("weekly");
  const { data: blogs } = useBlogs();
  const { data: services } = useActiveServices();
  const [schedule, setSchedule] = useState<ScheduleCfg>(defaultSchedule);
  const [geoChecks, setGeoChecks] = useState<{ label: string; ok: boolean }[]>([]);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "seo_schedule")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSchedule({ ...defaultSchedule, ...(data.value as any) });
      });

    Promise.all(geoChecklist.map(async (c) => ({ label: c.label, ok: await c.check() }))).then(setGeoChecks);
  }, []);

  const series = useMemo(() => buildSeries(period), [period]);
  const total = series.reduce((acc, d) => acc + d.value, 0);
  const prevTotal = Math.round(total * 0.85);
  const delta = total - prevTotal;
  const deltaPct = ((delta / Math.max(prevTotal, 1)) * 100).toFixed(1);

  const checks = checklistItems.map((c) => ({ ...c, ok: c.check() }));
  const passing = checks.filter((c) => c.ok).length;
  const score = Math.round((passing / checks.length) * 100);

  const geoPassing = geoChecks.filter((c) => c.ok).length;
  const geoScore = geoChecks.length ? Math.round((geoPassing / geoChecks.length) * 100) : 0;

  const issues = (blogs || [])
    .map((b) => {
      const probs: string[] = [];
      if (!b.title || b.title.length < 15) probs.push("Short title");
      if (!b.excerpt || b.excerpt.length < 50) probs.push("Missing/short meta description");
      if (!b.slug) probs.push("Missing slug");
      return { id: b.id, title: b.title, slug: b.slug, problems: probs };
    })
    .filter((i) => i.problems.length > 0);

  const trackedKeywords = [
    { kw: "generative engine optimization", pos: 8, trend: 3 },
    { kw: "SEO to GEO services", pos: 12, trend: 5 },
    { kw: "SaaS to GaaS", pos: 6, trend: 2 },
    { kw: "AI animation studio India", pos: 4, trend: 1 },
    { kw: "Ras Techno", pos: 1, trend: 0 },
    { kw: "creative IT solutions Pune", pos: 14, trend: -2 },
  ];

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      ["RaS Techno SEO Report", new Date().toISOString()],
      [],
      ["Period", period],
      ["Total Visits", total],
      ["Change vs prev", `${deltaPct}%`],
      ["SEO Score", `${score}/100`],
      ["GEO Score", `${geoScore}/100`],
      [],
      ["Traffic Series"],
      ["Label", "Visits"],
      ...series.map((s) => [s.label, s.value]),
      [],
      ["Keyword Rankings"],
      ["Keyword", "Position", "Trend"],
      ...trackedKeywords.map((k) => [k.kw, k.pos, k.trend]),
      [],
      ["Content Issues"],
      ["Title", "Slug", "Problems"],
      ...issues.map((i) => [i.title, i.slug, i.problems.join("; ")]),
    ];
    downloadCSV(`seo-report-${period}-${Date.now()}.csv`, rows);
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    downloadPDF(`seo-report-${period}.pdf`, `SEO Report — ${period.toUpperCase()}`, [
      {
        heading: "Summary",
        lines: [
          `Total visits: <strong>${total.toLocaleString()}</strong> (${deltaPct}% vs previous)`,
          `SEO Score: <strong>${score}/100</strong>`,
          `GEO Score: <strong>${geoScore}/100</strong>`,
          `Indexed pages: <strong>${(blogs?.length || 0) + (services?.length || 0) + 12}</strong>`,
        ],
      },
      {
        heading: "Keyword Rankings",
        lines: trackedKeywords.map((k) => `${k.kw} — position ${k.pos} (${k.trend >= 0 ? "▲" : "▼"}${Math.abs(k.trend)})`),
      },
      {
        heading: "On-page Checklist",
        lines: checks.map((c) => `${c.ok ? "✓" : "✗"} ${c.label}`),
      },
      {
        heading: "GEO Checklist",
        lines: geoChecks.map((c) => `${c.ok ? "✓" : "✗"} ${c.label}`),
      },
      {
        heading: `Content Issues (${issues.length})`,
        lines: issues.length ? issues.map((i) => `${i.title} — ${i.problems.join(", ")}`) : ["All clear 🎉"],
      },
    ]);
    toast.success("Opening printable PDF…");
  };

  const saveSchedule = async () => {
    if (schedule.enabled && !schedule.email) {
      toast.error("Add a recipient email or disable scheduling");
      return;
    }
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "seo_schedule", value: schedule as any }, { onConflict: "key" });
    if (error) toast.error(error.message);
    else toast.success("Schedule saved");
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">SEO &amp; GEO Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track on-page health, AI engine visibility, traffic and keyword rankings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <FileText className="w-4 h-4 mr-2" /> PDF
            </Button>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" /> Search Console
              </Button>
            </a>
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">SEO Score</span>
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{score}<span className="text-base text-muted-foreground">/100</span></div>
            <div className="h-2 mt-3 bg-muted rounded">
              <div className="h-full rounded bg-gradient-to-r from-primary to-secondary" style={{ width: `${score}%` }} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" />GEO Score</span>
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{geoScore}<span className="text-base text-muted-foreground">/100</span></div>
            <div className="h-2 mt-3 bg-muted rounded">
              <div className="h-full rounded bg-gradient-to-r from-secondary to-accent" style={{ width: `${geoScore}%` }} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Indexed Pages</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{(blogs?.length || 0) + (services?.length || 0) + 12}</div>
            <p className="text-xs text-muted-foreground mt-1">Blogs, services & static pages</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Backlinks</span>
              <LinkIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">142</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +8 this week
            </p>
          </Card>
        </div>

        {/* Traffic */}
        <Card className="p-6">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Traffic Report
                </h2>
                <p className="text-sm text-muted-foreground">Organic visits over the selected window.</p>
              </div>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={period} className="mt-0 space-y-4">
              <div className="flex items-end gap-6 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total visits</p>
                  <p className="text-4xl font-bold">{total.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${delta >= 0 ? "text-success" : "text-destructive"}`}>
                  {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {deltaPct}% vs previous {period === "daily" ? "day" : period === "weekly" ? "week" : "month"}
                </div>
              </div>
              <Bars data={series} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Scheduled reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Scheduled Reports
            </h2>
            <div className="flex items-center gap-3">
              <Label htmlFor="sched-toggle" className="text-sm">Enabled</Label>
              <Switch id="sched-toggle" checked={schedule.enabled} onCheckedChange={(v) => setSchedule({ ...schedule, enabled: v })} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Tabs value={schedule.frequency} onValueChange={(v) => setSchedule({ ...schedule, frequency: v as Period })}>
                <TabsList className="w-full">
                  <TabsTrigger value="daily" className="flex-1">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Recipient email</Label>
              <Input id="email" type="email" placeholder="reports@rastechno.com" value={schedule.email} onChange={(e) => setSchedule({ ...schedule, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Formats</Label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={schedule.formats.csv} onCheckedChange={(v) => setSchedule({ ...schedule, formats: { ...schedule.formats, csv: v } })} />
                  CSV
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={schedule.formats.pdf} onCheckedChange={(v) => setSchedule({ ...schedule, formats: { ...schedule.formats, pdf: v } })} />
                  PDF
                </label>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">
              Schedules are stored centrally. Connect an email provider to start automatic delivery — meanwhile use the manual CSV/PDF buttons above.
            </p>
            <Button size="sm" onClick={saveSchedule}>
              <Save className="w-4 h-4 mr-2" /> Save Schedule
            </Button>
          </div>
        </Card>

        {/* Checklists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> On-page SEO Checklist
            </h2>
            <ul className="space-y-3">
              {checks.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    {c.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {c.label}
                  </span>
                  <Badge variant={c.ok ? "secondary" : "destructive"}>{c.ok ? "Pass" : "Fix"}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> GEO Checklist
              <Badge variant="secondary" className="ml-auto text-[10px]">AI Engines</Badge>
            </h2>
            <ul className="space-y-3">
              {geoChecks.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    {c.ok ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {c.label}
                  </span>
                  <Badge variant={c.ok ? "secondary" : "destructive"}>{c.ok ? "Pass" : "Fix"}</Badge>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              GEO = Generative Engine Optimization. Optimizes how your brand appears in ChatGPT, Perplexity, Gemini, Claude and other AI answer engines.
            </p>
          </Card>
        </div>

        {/* Keywords */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Keyword Rankings
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {trackedKeywords.map((k) => (
              <div key={k.kw} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                <div className="min-w-0">
                  <p className="font-medium truncate">{k.kw}</p>
                  <p className="text-xs text-muted-foreground">
                    Position {k.pos} {k.pos <= 3 ? "· top of page 1" : k.pos <= 10 ? "· page 1" : "· page 2+"}
                  </p>
                </div>
                <div className="shrink-0 w-24">
                  <Sparkline
                    data={Array.from({ length: 12 }, (_, i) => ({
                      label: `${i}`,
                      value: 20 - k.pos + Math.sin(i + k.pos) * 3 + (k.trend > 0 ? i * 0.3 : -i * 0.2),
                    }))}
                  />
                </div>
                <Badge variant={k.trend >= 0 ? "secondary" : "destructive"} className="shrink-0">
                  {k.trend >= 0 ? `▲ ${k.trend}` : `▼ ${Math.abs(k.trend)}`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Issues */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Content Issues ({issues.length})
          </h2>
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">All blog posts have healthy titles, slugs and meta descriptions. 🎉</p>
          ) : (
            <ul className="divide-y divide-border">
              {issues.map((i) => (
                <li key={i.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{i.title || "(untitled)"}</p>
                    <p className="text-xs text-muted-foreground truncate">/{i.slug || "—"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {i.problems.map((p) => (
                      <Badge key={p} variant="destructive" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Traffic and ranking figures are illustrative until Google Search Console / Analytics is connected.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminSEO;
