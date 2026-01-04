import { useState } from "react";
import { useActiveJobPosts, JobPost } from "@/hooks/useJobPosts";
import { useCreateJobApplication } from "@/hooks/useJobApplications";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIBackground from "@/components/effects/AIBackground";
import ScrollToTop from "@/components/effects/ScrollToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Briefcase, MapPin, Clock, Calendar, ChevronRight, Users } from "lucide-react";
import { format } from "date-fns";

const Careers = () => {
  const { data: jobs, isLoading } = useActiveJobPosts();
  const createApplication = useCreateJobApplication();
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience_years: "",
    current_company: "",
    linkedin_url: "",
    cover_letter: "",
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      await createApplication.mutateAsync({
        job_post_id: selectedJob.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        current_company: formData.current_company || null,
        linkedin_url: formData.linkedin_url || null,
        cover_letter: formData.cover_letter || null,
      });
      toast.success("Application submitted successfully!");
      setIsApplyOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        experience_years: "",
        current_company: "",
        linkedin_url: "",
        cover_letter: "",
      });
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AIBackground />
      <Navbar />

      <main className="relative z-10 pt-24 sm:pt-28 pb-16">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Join Our Team</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                Build Your <span className="text-gradient-primary">Career</span> With Us
              </h1>
              <p className="text-lg text-muted-foreground">
                Join our team of talented professionals and work on exciting projects that make a difference.
              </p>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Open <span className="text-gradient-primary">Positions</span>
            </h2>

            {isLoading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass p-6 rounded-xl animate-pulse">
                    <div className="h-6 w-48 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="glass p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-gradient-primary transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          {job.department && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {job.department}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {job.employment_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Posted {format(new Date(job.posted_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                      </div>
                      <Button
                        variant="gradient"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplyOpen(true);
                        }}
                        className="shrink-0"
                      >
                        Apply Now
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {(job.requirements?.length || job.benefits?.length || job.salary_range) && (
                      <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {job.requirements && job.requirements.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground text-sm mb-2">Requirements</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {job.requirements.slice(0, 3).map((req, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {job.benefits && job.benefits.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground text-sm mb-2">Benefits</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {job.benefits.slice(0, 3).map((benefit, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {job.salary_range && (
                          <div>
                            <h4 className="font-semibold text-foreground text-sm mb-2">Salary Range</h4>
                            <p className="text-sm text-muted-foreground">{job.salary_range}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-xl">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  No Open Positions
                </h3>
                <p className="text-muted-foreground">
                  We don't have any open positions at the moment. Please check back later!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />

      {/* Application Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    value={formData.current_company}
                    onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <Label htmlFor="cover">Cover Letter</Label>
                <Textarea
                  id="cover"
                  rows={4}
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={createApplication.isPending}>
                {createApplication.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Careers;
