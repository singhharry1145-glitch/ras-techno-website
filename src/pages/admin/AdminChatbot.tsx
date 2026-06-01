import { useState, useEffect } from "react";
import { Bot, MessageSquare, Plus, Trash2, Save, ToggleLeft, ToggleRight, Edit, Check, X, BarChart3, TrendingUp, Users, Clock, MessageCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useChatbotSettings,
  useUpdateChatbotSettings,
  useChatbotQA,
  useCreateChatbotQA,
  useUpdateChatbotQA,
  useDeleteChatbotQA,
  ChatbotQA,
} from "@/hooks/useChatbot";
import { useChatbotAnalyticsSummary, useChatbotAnalytics } from "@/hooks/useChatbotAnalytics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminChatbot = () => {
  const { toast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useChatbotSettings();
  const { data: qaList, isLoading: qaLoading } = useChatbotQA();
  const { data: analyticsSummary, isLoading: analyticsLoading } = useChatbotAnalyticsSummary();
  const { data: recentQueries } = useChatbotAnalytics();
  const updateSettings = useUpdateChatbotSettings();
  const createQA = useCreateChatbotQA();
  const updateQA = useUpdateChatbotQA();
  const deleteQA = useDeleteChatbotQA();

  // Settings state
  const [isEnabled, setIsEnabled] = useState(true);
  const [botName, setBotName] = useState("RaS Tech Assistant");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [botPersonality, setBotPersonality] = useState("");
  const [showBookingButton, setShowBookingButton] = useState(true);
  const [bookingButtonText, setBookingButtonText] = useState("Book a Consultation");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);

  // Q&A state
  const [editingQA, setEditingQA] = useState<ChatbotQA | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qaToDelete, setQaToDelete] = useState<string | null>(null);

  // Load settings
  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.is_enabled);
      setBotName(settings.bot_name);
      setWelcomeMessage(settings.welcome_message);
      setBotPersonality(settings.bot_personality);
      setShowBookingButton(settings.show_booking_button);
      setBookingButtonText(settings.booking_button_text);
      setVoiceEnabled(settings.voice_enabled ?? false);
      setVoiceSpeed(settings.voice_speed ?? 1.0);
      setVoicePitch(settings.voice_pitch ?? 1.0);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        is_enabled: isEnabled,
        bot_name: botName,
        welcome_message: welcomeMessage,
        bot_personality: botPersonality,
        show_booking_button: showBookingButton,
        booking_button_text: bookingButtonText,
        voice_enabled: voiceEnabled,
        voice_speed: voiceSpeed,
        voice_pitch: voicePitch,
      } as any);
      toast({ title: "Chatbot settings saved successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to save settings", variant: "destructive" });
    }
  };

  const handleAddQA = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ title: "Please fill in both question and answer", variant: "destructive" });
      return;
    }

    try {
      const keywords = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      await createQA.mutateAsync({
        question: newQuestion,
        answer: newAnswer,
        keywords,
        is_active: true,
        display_order: (qaList?.length || 0) + 1,
      });
      setNewQuestion("");
      setNewAnswer("");
      setNewKeywords("");
      toast({ title: "Q&A added successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to add Q&A", variant: "destructive" });
    }
  };

  const handleUpdateQA = async () => {
    if (!editingQA) return;

    try {
      const keywords = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      await updateQA.mutateAsync({
        id: editingQA.id,
        question: newQuestion,
        answer: newAnswer,
        keywords,
      });
      setEditingQA(null);
      setNewQuestion("");
      setNewAnswer("");
      setNewKeywords("");
      toast({ title: "Q&A updated successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to update Q&A", variant: "destructive" });
    }
  };

  const handleToggleQA = async (qa: ChatbotQA) => {
    try {
      await updateQA.mutateAsync({
        id: qa.id,
        is_active: !qa.is_active,
      });
    } catch (error: any) {
      toast({ title: error.message || "Failed to toggle Q&A", variant: "destructive" });
    }
  };

  const confirmDeleteQA = async () => {
    if (!qaToDelete) return;
    try {
      await deleteQA.mutateAsync(qaToDelete);
      toast({ title: "Q&A deleted successfully" });
    } catch (error: any) {
      toast({ title: error.message || "Failed to delete Q&A", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setQaToDelete(null);
    }
  };

  const startEditQA = (qa: ChatbotQA) => {
    setEditingQA(qa);
    setNewQuestion(qa.question);
    setNewAnswer(qa.answer);
    setNewKeywords(qa.keywords?.join(", ") || "");
  };

  const cancelEdit = () => {
    setEditingQA(null);
    setNewQuestion("");
    setNewAnswer("");
    setNewKeywords("");
  };

  if (settingsLoading || qaLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">AI Chatbot</h1>
          <p className="text-muted-foreground">
            Configure your AI chatbot settings, manage Q&A responses, and view analytics.
          </p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="rounded-2xl glass p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                General Settings
              </h2>

              <div className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label className="font-medium">Enable Chatbot</Label>
                    <p className="text-sm text-muted-foreground">
                      Show or hide the chatbot on your website
                    </p>
                  </div>
                  <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                </div>

                {/* Bot Name */}
                <div>
                  <Label>Bot Name</Label>
                  <Input
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    placeholder="RaS Tech Assistant"
                    className="mt-1 bg-muted/50"
                  />
                </div>

                {/* Welcome Message */}
                <div>
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hello! I'm here to help..."
                    className="mt-1 bg-muted/50"
                    rows={3}
                  />
                </div>

                {/* Bot Personality */}
                <div>
                  <Label>Bot Personality / System Prompt</Label>
                  <p className="text-xs text-muted-foreground mb-1">
                    Define how the AI should behave and respond
                  </p>
                  <Textarea
                    value={botPersonality}
                    onChange={(e) => setBotPersonality(e.target.value)}
                    placeholder="You are a helpful technology consultant..."
                    className="mt-1 bg-muted/50"
                    rows={4}
                  />
                </div>

                {/* Booking Button Settings */}
                <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Show Booking Button</Label>
                      <p className="text-sm text-muted-foreground">
                        Display a "Book Consultation" button in the chat
                      </p>
                    </div>
                    <Switch checked={showBookingButton} onCheckedChange={setShowBookingButton} />
                  </div>

                  {showBookingButton && (
                    <div>
                      <Label>Button Text</Label>
                      <Input
                        value={bookingButtonText}
                        onChange={(e) => setBookingButtonText(e.target.value)}
                        placeholder="Book a Consultation"
                        className="mt-1 bg-muted/50"
                      />
                    </div>
                  )}
                </div>

                {/* Voice Assistant Settings */}
                <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-primary" />
                        Voice Assistant
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Bot reads responses aloud using text-to-speech
                      </p>
                    </div>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                  {voiceEnabled && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Speech Speed ({voiceSpeed.toFixed(1)}x)</Label>
                        <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))} className="w-full mt-2" />
                        <div className="flex justify-between text-xs text-muted-foreground"><span>0.5x</span><span>1.0x</span><span>2.0x</span></div>
                      </div>
                      <div>
                        <Label>Voice Pitch ({voicePitch.toFixed(1)})</Label>
                        <input type="range" min="0.5" max="2.0" step="0.1" value={voicePitch} onChange={(e) => setVoicePitch(parseFloat(e.target.value))} className="w-full mt-2" />
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Low</span><span>Normal</span><span>High</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="gradient"
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qa">
            <div className="rounded-2xl glass p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Custom Q&A Responses
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add custom questions and answers. The AI will prioritize these responses when relevant.
              </p>

              {/* Add/Edit Q&A Form */}
              <div className="p-4 rounded-lg bg-muted/30 mb-6 space-y-4">
                <h3 className="font-medium">
                  {editingQA ? "Edit Q&A" : "Add New Q&A"}
                </h3>
                <div>
                  <Label>Question</Label>
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What services do you offer?"
                    className="mt-1 bg-muted/50"
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="We offer software development, AI automation..."
                    className="mt-1 bg-muted/50"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="services, offer, provide"
                    className="mt-1 bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Keywords help match user questions to this answer
                  </p>
                </div>
                <div className="flex gap-2">
                  {editingQA ? (
                    <>
                      <Button variant="gradient" onClick={handleUpdateQA} disabled={updateQA.isPending}>
                        <Check className="w-4 h-4 mr-2" />
                        {updateQA.isPending ? "Updating..." : "Update"}
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="gradient" onClick={handleAddQA} disabled={createQA.isPending}>
                      <Plus className="w-4 h-4 mr-2" />
                      {createQA.isPending ? "Adding..." : "Add Q&A"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Q&A List */}
              <div className="space-y-3">
                {qaList?.map((qa) => (
                  <div
                    key={qa.id}
                    className={`p-4 rounded-lg border ${
                      qa.is_active ? "bg-muted/20 border-border" : "bg-muted/5 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{qa.question}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{qa.answer}</p>
                        {qa.keywords && qa.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {qa.keywords.map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleQA(qa)}
                          title={qa.is_active ? "Disable" : "Enable"}
                        >
                          {qa.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => startEditQA(qa)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setQaToDelete(qa.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!qaList || qaList.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No custom Q&A responses yet</p>
                    <p className="text-sm">Add your first Q&A above</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {analyticsSummary?.totalQueries || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Queries</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {analyticsSummary?.uniqueSessions || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Unique Sessions</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {analyticsSummary?.queriesThisWeek || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">This Week</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl glass p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {analyticsSummary?.avgResponseTime || 0}ms
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queries by Day Chart */}
              <div className="rounded-2xl glass p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Queries (Last 7 Days)
                </h2>
                <div className="flex items-end gap-2 h-40">
                  {analyticsSummary?.queriesByDay.map((day, i) => {
                    const maxCount = Math.max(...(analyticsSummary?.queriesByDay.map(d => d.count) || [1]));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-primary/80 rounded-t-md transition-all duration-300 hover:bg-primary"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${day.count} queries`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Queries */}
              <div className="rounded-2xl glass p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Most Common Questions
                </h2>
                {analyticsSummary?.topQueries && analyticsSummary.topQueries.length > 0 ? (
                  <div className="space-y-3">
                    {analyticsSummary.topQueries.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {i + 1}
                          </span>
                          <p className="text-sm text-foreground truncate">{item.query}</p>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          {item.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No queries yet</p>
                    <p className="text-sm">Analytics will appear once users start chatting</p>
                  </div>
                )}
              </div>

              {/* Recent Queries */}
              <div className="rounded-2xl glass p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Recent Queries
                </h2>
                {recentQueries && recentQueries.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {recentQueries.slice(0, 20).map((query) => (
                      <div key={query.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{query.user_query}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(query.created_at).toLocaleString()}
                            {query.response_time_ms && ` • ${query.response_time_ms}ms`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent queries</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Q&A?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The Q&A will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQA}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminChatbot;
