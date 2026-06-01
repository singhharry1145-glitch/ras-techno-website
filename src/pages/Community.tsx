import { Users, Calendar, UserCheck, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIBackground from "@/components/effects/AIBackground";
import { Button } from "@/components/ui/button";
import { useCommunityMeetings, useCommunityStats } from "@/hooks/useCommunityMeetings";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useMemo } from "react";

const Community = () => {
  const { data: stats } = useCommunityStats();
  const { data: meetings } = useCommunityMeetings(true);
  const { data: settings } = useSiteSettings();
  const visibility = (settings?.section_visibility as Record<string, boolean>) || {};
  const features = (settings?.community as Record<string, boolean>) || {};
  const showStats = features.show_stats !== false;
  const showChart = features.show_chart !== false;
  const showMeetings = features.show_meetings !== false;

  // If admin disabled the whole community page
  if (visibility.community_page === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-3xl font-bold">Community page is currently unavailable.</h1>
        </main>
        <Footer />
      </div>
    );
  }

  const monthlyData = useMemo(() => {
    if (!meetings) return [];
    const map = new Map<string, { month: string; meetings: number; attendees: number }>();
    meetings.forEach((m) => {
      const d = new Date(m.meeting_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
      const cur = map.get(key) || { month: label, meetings: 0, attendees: 0 };
      cur.meetings += 1;
      cur.attendees += m.attendees_count || 0;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [meetings]);

  const statCards = [
    { label: "Community Members", value: stats?.members ?? 0, icon: Users, color: "from-cyan to-blue-500" },
    { label: "Total Meetings", value: stats?.meetings ?? 0, icon: Calendar, color: "from-magenta to-pink-500" },
    { label: "Total Attendees", value: stats?.totalAttendees ?? 0, icon: UserCheck, color: "from-purple-500 to-indigo-500" },
    { label: "Applications", value: stats?.applications ?? 0, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  ];

  const handleJoin = () => {
    document.dispatchEvent(new CustomEvent("open-community-dialog"));
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AIBackground />
      <Navbar />
      <main className="relative z-10 pt-24 pb-20">
        <section className="container mx-auto px-4 text-center mb-16">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gradient-primary">
            RaS Techno Community
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6 text-base sm:text-lg">
            Connect with entrepreneurs, share business ideas, learn growth strategies and join exclusive meetups.
          </p>
          <Button variant="gradient" size="lg" onClick={handleJoin}>
            <Users className="w-5 h-5 mr-2" /> Join the Community
          </Button>
        </section>

        {showStats && (
          <section className="container mx-auto px-4 mb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-5 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} mx-auto mb-3 flex items-center justify-center`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-display text-3xl font-bold">{s.value.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {showChart && monthlyData.length > 0 && (
          <section className="container mx-auto px-4 mb-16">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-xl font-bold mb-4">Meetings per Month</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="meetings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-xl font-bold mb-4">Attendees Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Line type="monotone" dataKey="attendees" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        {showMeetings && meetings && meetings.length > 0 && (
          <section className="container mx-auto px-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6 text-center">Recent & Upcoming Meetings</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.slice(0, 9).map((m) => (
                <div key={m.id} className="glass rounded-2xl p-5 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(m.meeting_date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                    {m.location && <span>• {m.location}</span>}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{m.title}</h3>
                  {m.description && <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{m.description}</p>}
                  <p className="text-xs text-primary">{m.attendees_count} attendees</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Community;
