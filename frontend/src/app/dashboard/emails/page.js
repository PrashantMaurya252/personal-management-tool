"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send, Mail, RefreshCw, Paperclip, Loader2, Eye, Building2, User, AlertTriangle, Users, Calendar, Clock, Edit2, X, Trash2, Search, ArrowRight, SkipForward } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState("generate");

  // Generate Tab State
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  
  // Resume Status State
  const [hasDefaultResume, setHasDefaultResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [customResume, setCustomResume] = useState(null);

  // Send Form State
  const [toEmail, setToEmail] = useState("");
  const [hrName, setHrName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Bulk Enquiry State
  const [allManagers, setAllManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManagers, setSelectedManagers] = useState([]); // Up to 10
  const [wizardTemplateSubject, setWizardTemplateSubject] = useState("Application for Software Developer / Full Stack Developer Opportunity at {{companyName}}");
  const [wizardTemplateBody, setWizardTemplateBody] = useState(`Dear {{hrName}},

I hope you're doing well.

I came across {{companyName}} and was impressed by the work your engineering team is doing. I would like to express my interest in any Software Developer, Full Stack Developer, Backend Developer, Node.js Developer, or MERN Stack Developer opportunities at your organization.

I have 2+ years of experience building scalable web applications using Node.js, NestJS, Express.js, React.js, Next.js, TypeScript, MongoDB, PostgreSQL, MySQL, Redis, Docker, and AWS. Throughout my experience, I have developed 350+ production APIs, contributed to 10+ enterprise-grade applications, and worked across domains including E-commerce, HRMS, Healthcare, LMS, Insurance, and Multi-Vendor platforms.

Some highlights of my experience include:

* Developing scalable backend services with Node.js, NestJS, Express.js, and TypeScript.
* Designing secure authentication and authorization systems using JWT, OAuth2, and RBAC.
* Building full-stack applications with React.js, Next.js, MongoDB, PostgreSQL, and Prisma.
* Integrating AI-powered features, OCR services, payment gateways, real-time notifications, and cloud services.
* Contributing to application architecture, database design, API documentation, and production deployments.

In addition to my professional experience, I have built a production-ready e-commerce platform featuring JWT authentication, Google OAuth, Stripe payments, Redis caching, BullMQ queues, AI-powered semantic search using pgvector, and an admin dashboard.

I am currently based in Noida and am available to join immediately. I have attached my resume for your review and would greatly appreciate it if you could consider my profile for any relevant openings at {{companyName}}. If there isn't a suitable opening at the moment, I would be grateful if you could keep my profile in mind for future opportunities.

Thank you for your time and consideration. I look forward to hearing from you.

Kind regards,

Prashant Kumar Maurya
Full Stack Developer | Backend Developer | Software Developer
📧 prashantmaurya252@outlook.com
📱 +91 6306315885
💼 LinkedIn: {{LINKEDIN_LINK}}
💻 Portfolio: {{PORTFOLIO_LINK}}
🐙 GitHub: {{GITHUB_LINK}}`);
  
  // Wizard Mode State
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [wizardIndex, setWizardIndex] = useState(0);
  const [wizardSubject, setWizardSubject] = useState("");
  const [wizardBody, setWizardBody] = useState("");
  const [wizardScheduledAt, setWizardScheduledAt] = useState("");
  const [wizardCustomResume, setWizardCustomResume] = useState(null);
  const [isWizardProcessing, setIsWizardProcessing] = useState(false);

  // Tracking Tab State
  const [emails, setEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  
  // Edit Scheduled Email State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchResumes = async () => {
    try {
      const response = await axiosInstance.get("/resume");
      if (response.data.success && response.data.data?.length > 0) {
        setResumes(response.data.data);
        setHasDefaultResume(true);
        const defaultRes = response.data.data.find(r => r.isDefault);
        if (defaultRes) {
          setSelectedResumeId(defaultRes._id);
        } else {
          setSelectedResumeId(response.data.data[0]._id);
        }
      } else {
        setResumes([]);
        setHasDefaultResume(false);
      }
    } catch (error) {
      setResumes([]);
      setHasDefaultResume(false);
    }
  };

  const fetchHiringManagers = async () => {
    try {
      const response = await axiosInstance.get("/hiring-managers?pagination=false");
      if (response.data.success) {
        setAllManagers(response.data.data.managers || []);
      }
    } catch (error) {
      console.error("Failed to fetch hiring managers:", error);
    }
  };

  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const response = await axiosInstance.get("/emails");
      if (response.data.success) {
        setEmails(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      toast.error("Failed to load tracking data");
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchHiringManagers();
  }, []);

  useEffect(() => {
    if (activeTab === "track") {
      fetchEmails();
    }
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      return toast.error("Please paste a job description first");
    }

    setIsGenerating(true);
    try {
      const response = await axiosInstance.post("/emails/generate-email", {
        description: jobDescription
      });

      if (response.data.success) {
        const aiData = response.data.data;
        setGeneratedData(aiData);
        setToEmail(aiData.hrEmail || "");
        setHrName(aiData.hrName || "");
        setCompanyName(aiData.companyName || "");
        setSubject(aiData.emailSubject || "");
        setBody(aiData.emailBody || "");
        toast.success("Email generated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!toEmail || !subject || !body) {
      return toast.error("Email, subject, and body are required");
    }

    setIsSending(true);
    try {
      let response;
      if (customResume) {
        const formData = new FormData();
        formData.append("email", toEmail);
        formData.append("subject", subject);
        formData.append("body", body);
        formData.append("companyName", companyName);
        formData.append("hrName", hrName);
        if (scheduledAt) formData.append("scheduledAt", scheduledAt);
        formData.append("profile", "Application");
        if (selectedResumeId) formData.append("resumeId", selectedResumeId);
        formData.append("resumePdf", customResume);

        response = await axiosInstance.post("/emails/send-hr-email", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        const payload = {
          email: toEmail,
          subject,
          body,
          companyName,
          hrName,
          scheduledAt,
          profile: "Application",
          resumeId: selectedResumeId
        };
        response = await axiosInstance.post("/emails/send-hr-email", payload);
      }

      if (response.data.success) {
        toast.success(scheduledAt ? "Email scheduled successfully!" : "Email sent successfully!");
        setJobDescription("");
        setGeneratedData(null);
        setToEmail("");
        setHrName("");
        setCompanyName("");
        setSubject("");
        setBody("");
        setScheduledAt("");
        setCustomResume(null);
        setActiveTab("track");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  // --- Wizard Logic ---

  const handleAddManager = (manager) => {
    if (selectedManagers.length >= 10) {
      return toast.error("You can select up to 10 managers max");
    }
    if (selectedManagers.find(m => m._id === manager._id)) {
      return toast.error("Manager already added");
    }
    setSelectedManagers([...selectedManagers, manager]);
    setSearchQuery("");
  };

  const removeManagerFromQueue = (id) => {
    setSelectedManagers(selectedManagers.filter(m => m._id !== id));
  };

  const startWizard = () => {
    if (selectedManagers.length === 0) return toast.error("Add at least one manager first");
    if (!hasDefaultResume) return toast.error("Please upload a resume first");
    
    setIsWizardMode(true);
    setWizardIndex(0);
    prepareWizardStep(0);
  };

  const prepareWizardStep = (index) => {
    const manager = selectedManagers[index];
    const hr = manager.name;
    const comp = manager.company?.name || "your company";
    
    setWizardSubject(wizardTemplateSubject.replace(/\{\{hrName\}\}/g, hr).replace(/\{\{companyName\}\}/g, comp));
    setWizardBody(wizardTemplateBody.replace(/\{\{hrName\}\}/g, hr).replace(/\{\{companyName\}\}/g, comp));
    setWizardScheduledAt("");
    setWizardCustomResume(null);
  };

  const handleWizardSkip = () => {
    // Remove from queue completely
    const newQueue = [...selectedManagers];
    newQueue.splice(wizardIndex, 1);
    setSelectedManagers(newQueue);
    
    if (wizardIndex < newQueue.length) {
      // Don't increment index, because the next item falls into current index
      prepareWizardStep(wizardIndex);
    } else {
      finishWizard();
    }
  };

  const handleWizardSend = async () => {
    if (!wizardSubject || !wizardBody) return toast.error("Subject and body are required");
    
    setIsWizardProcessing(true);
    try {
      const manager = selectedManagers[wizardIndex];
      let response;

      if (wizardCustomResume) {
        const formData = new FormData();
        formData.append("email", manager.email);
        formData.append("subject", wizardSubject);
        formData.append("body", wizardBody);
        if (manager.company?.name) formData.append("companyName", manager.company.name);
        formData.append("hrName", manager.name);
        if (wizardScheduledAt) formData.append("scheduledAt", wizardScheduledAt);
        formData.append("profile", "Enquiry");
        if (selectedResumeId) formData.append("resumeId", selectedResumeId);
        formData.append("resumePdf", wizardCustomResume);

        response = await axiosInstance.post("/emails/send-hr-email", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        const payload = {
          email: manager.email,
          subject: wizardSubject,
          body: wizardBody,
          companyName: manager.company?.name,
          hrName: manager.name,
          scheduledAt: wizardScheduledAt,
          profile: "Enquiry",
          resumeId: selectedResumeId
        };
        response = await axiosInstance.post("/emails/send-hr-email", payload);
      }

      if (response.data.success) {
        toast.success(`Email to ${manager.name} ${wizardScheduledAt ? 'scheduled' : 'sent'}!`);
        
        if (wizardIndex + 1 < selectedManagers.length) {
          setWizardIndex(wizardIndex + 1);
          prepareWizardStep(wizardIndex + 1);
        } else {
          finishWizard();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process email");
    } finally {
      setIsWizardProcessing(false);
    }
  };

  const finishWizard = () => {
    toast.success("Enquiry queue finished!");
    setIsWizardMode(false);
    setSelectedManagers([]);
    setWizardIndex(0);
  };

  // --- Track / Edit Modal Logic ---

  const openEditModal = (email) => {
    setEditingEmail(email);
    setEditSubject(email.generatedSubject);
    setEditBody(email.generatedBody);
    
    let dateStr = "";
    if (email.scheduledAt) {
      const d = new Date(email.scheduledAt);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      dateStr = d.toISOString().slice(0, 16);
    }
    setEditScheduledAt(dateStr);
    
    setEditModalOpen(true);
  };

  const handleUpdateScheduledEmail = async () => {
    if (!editingEmail) return;
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/emails/${editingEmail._id}`, {
        subject: editSubject,
        body: editBody,
        scheduledAt: editScheduledAt
      });
      toast.success("Email updated successfully");
      setEditModalOpen(false);
      fetchEmails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelScheduledEmail = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled email?")) return;
    try {
      await axiosInstance.delete(`/emails/${id}`);
      toast.success("Email cancelled");
      fetchEmails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel email");
    }
  };

  const availableManagers = allManagers.filter(m => !selectedManagers.some(sm => sm._id === m._id));
  const filteredManagers = searchQuery.trim() 
    ? availableManagers.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (m.company?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableManagers;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Email Outreach</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">Generate AI emails, send bulk enquiries, schedule and track opens.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-neutral-900/50 p-1 rounded-xl border border-gray-200 dark:border-neutral-800 w-fit shadow-sm dark:shadow-none">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "generate"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Application Email
        </button>
        <button
          onClick={() => { setActiveTab("bulk"); setIsWizardMode(false); }}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "bulk"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Enquiry Wizard
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "track"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          }`}
        >
          <Mail className="w-4 h-4 mr-2" />
          Tracker
        </button>
      </div>

      {hasDefaultResume === false && (
        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-orange-700 dark:text-orange-400">Resume Required</h3>
            <p className="text-xs text-orange-600 dark:text-orange-400/80 mt-1">
              You need to upload a resume in the Resume tab before generating or sending emails. The system automatically attaches your default resume to emails!
            </p>
            <Link href="/dashboard/resume" className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-2 inline-block hover:underline">
              Go to Resume Tab &rarr;
            </Link>
          </div>
        </div>
      )}

      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Job Post Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Paste LinkedIn Job Post</h2>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                disabled={hasDefaultResume === false}
                className="w-full h-[400px] bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || hasDefaultResume === false}
                className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {isGenerating ? "Analyzing & Generating..." : "Generate Email"}
              </button>
            </div>
          </div>

          {/* Right Column: Editable Output & Send Form */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Review & Send</h2>
                {generatedData && <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">Data Extracted Successfully</span>}
              </div>
              
              {!generatedData && !isGenerating && (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 dark:text-neutral-500 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl bg-gray-50 dark:bg-transparent">
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your generated email will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-[400px] flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 border-2 border-dashed border-blue-200 dark:border-neutral-800 rounded-xl bg-blue-50 dark:bg-transparent">
                  <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                  <p className="animate-pulse">Crafting the perfect email...</p>
                </div>
              )}

              {generatedData && !isGenerating && (
                <form onSubmit={handleSendEmail} className="space-y-4 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Company Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">HR Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          value={hrName}
                          onChange={(e) => setHrName(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">To (HR Email)</label>
                      <input
                        type="email"
                        required
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Body</label>
                    <textarea
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-48 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Schedule For (Optional)</label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Custom Resume (Optional)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCustomResume(e.target.files[0])}
                      className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                    <p className="text-xs text-gray-400">Overrides the selected profile resume for attachment.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (scheduledAt ? <Calendar className="w-5 h-5 mr-2"/> : <Send className="w-5 h-5 mr-2" />)}
                    {isSending ? "Processing..." : (scheduledAt ? "Schedule Email" : "Send Now")}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">Your default resume will automatically be attached.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "bulk" && (
        <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl dark:backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-none animate-in fade-in duration-300">
          
          {!isWizardMode ? (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Enquiry Wizard</h2>
                <p className="text-gray-500 dark:text-neutral-400 text-center mb-8">Search and queue up to 10 hiring managers, then review and dispatch emails one by one.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Search and Queue */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">1. Add to Queue ({selectedManagers.length}/10)</h3>
                    <div className="relative mb-4">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search manager or company..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-4">
                      <div className="max-h-48 overflow-y-auto bg-white dark:bg-neutral-900">
                        {filteredManagers.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500 text-center">No available managers found.</div>
                        ) : (
                          filteredManagers.map(m => (
                            <button 
                              key={m._id}
                              onClick={() => handleAddManager(m)}
                              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 border-b border-gray-100 dark:border-neutral-800 last:border-0 flex items-center justify-between transition-colors"
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.company?.name || "Unknown Company"}</p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium rounded-lg">Add +</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-2 min-h-[200px]">
                      {selectedManagers.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">Queue is empty</div>
                      ) : (
                        <ul className="space-y-2">
                          {selectedManagers.map(m => (
                            <li key={m._id} className="flex items-center justify-between p-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-800">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.company?.name}</p>
                              </div>
                              <button onClick={() => removeManagerFromQueue(m._id)} className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Template Setup */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">2. Setup Template</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Template Subject</label>
                        <input
                          type="text"
                          value={wizardTemplateSubject}
                          onChange={(e) => setWizardTemplateSubject(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Template Body</label>
                        <textarea
                          value={wizardTemplateBody}
                          onChange={(e) => setWizardTemplateBody(e.target.value)}
                          className="w-full h-40 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 text-sm text-gray-900 dark:text-neutral-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono"
                        />
                      </div>
                      
                      <button
                        onClick={startWizard}
                        disabled={selectedManagers.length === 0}
                        className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        Start Enquiry Workflow <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-300">
                
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                     Enquiry {wizardIndex + 1} of {selectedManagers.length}
                   </h2>
                   <button onClick={() => setIsWizardMode(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">Exit Wizard</button>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-950/50 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl mb-6 flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0">
                     <User className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-semibold text-gray-900 dark:text-white">{selectedManagers[wizardIndex]?.name}</p>
                     <p className="text-sm text-gray-500">{selectedManagers[wizardIndex]?.company?.name}</p>
                     <p className="text-xs text-gray-400 mt-1">{selectedManagers[wizardIndex]?.email}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Select Resume</label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    >
                      {resumes.map(resume => (
                        <option key={resume._id} value={resume._id}>
                          {resume.fileName || "Resume"} {resume.isDefault ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Subject</label>
                    <input
                      type="text"
                      value={wizardSubject}
                      onChange={(e) => setWizardSubject(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Body</label>
                    <textarea
                      value={wizardBody}
                      onChange={(e) => setWizardBody(e.target.value)}
                      className="w-full h-64 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-neutral-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Schedule For (Optional)</label>
                    <input
                      type="datetime-local"
                      value={wizardScheduledAt}
                      onChange={(e) => setWizardScheduledAt(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Custom Resume (Optional)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setWizardCustomResume(e.target.files[0])}
                      className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Overrides the dropdown selection for this email's attachment.</p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleWizardSkip}
                    disabled={isWizardProcessing}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <SkipForward className="w-5 h-5 mr-2" /> Skip & Remove
                  </button>
                  <button
                    onClick={handleWizardSend}
                    disabled={isWizardProcessing}
                    className="flex-[2] flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {isWizardProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (wizardScheduledAt ? <Calendar className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />)}
                    {isWizardProcessing ? "Processing..." : (wizardScheduledAt ? "Schedule Email" : "Send Email")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "track" && (
        <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl dark:backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50 dark:bg-neutral-900/80">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Sent & Scheduled Emails Log
            </h2>
            <button 
              onClick={fetchEmails}
              disabled={isLoadingEmails}
              className="p-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingEmails ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-800 text-sm font-medium text-gray-500 dark:text-neutral-400 bg-gray-100/50 dark:bg-neutral-950/50">
                  <th className="p-4 pl-6">Company / Recipient</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status / Timing</th>
                  <th className="p-4">Opens</th>
                  <th className="p-4 text-right pr-6">Clicks / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/50">
                {emails.map((email) => (
                  <tr key={email._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="text-gray-900 dark:text-neutral-200 font-medium">{email.company?.name || "-"}</p>
                      <p className="text-xs text-gray-500 dark:text-neutral-500">{email.recipientEmail?.email || "-"}</p>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-neutral-400">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700">
                         {email.purpose || "Application"}
                       </span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-neutral-300 max-w-xs truncate" title={email.generatedSubject}>
                      {email.generatedSubject}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2 py-0.5 w-max rounded text-[10px] font-medium border ${
                          email.status === 'sent' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                          email.status === 'scheduled' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                          email.status === 'failed' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                          'bg-gray-100 dark:bg-neutral-500/10 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-500/20'
                        }`}>
                          {email.status === 'scheduled' ? <Clock className="w-3 h-3 mr-1" /> : null}
                          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                          {email.status === 'scheduled' && email.scheduledAt ? new Date(email.scheduledAt).toLocaleString() : ""}
                          {email.status === 'sent' && email.sentAt ? new Date(email.sentAt).toLocaleString() : ""}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {email.status === 'sent' ? (
                        <div className="flex items-center">
                          <Eye className={`w-4 h-4 mr-2 ${email.tracking?.isOpened ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-neutral-600"}`} />
                          <span className={email.tracking?.isOpened ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-500 dark:text-neutral-500"}>
                            {email.tracking?.openedCount || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6">
                       {email.status === 'scheduled' && (
                         <div className="flex items-center justify-end gap-2">
                           <button onClick={() => openEditModal(email)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleCancelScheduledEmail(email._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       )}
                       {email.status === 'sent' && email.tracking?.linkClicks?.length > 0 && (
                         <div className="flex flex-col items-end gap-1">
                           {Array.from(new Set(email.tracking.linkClicks.map(c => c.url))).map((url, i) => {
                             const count = email.tracking.linkClicks.filter(c => c.url === url).length;
                             return (
                               <span key={i} className="text-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
                                 {url.charAt(0).toUpperCase() + url.slice(1)}: {count} click{count > 1 ? 's' : ''}
                               </span>
                             )
                           })}
                         </div>
                       )}
                       {email.status === 'sent' && (!email.tracking?.linkClicks || email.tracking.linkClicks.length === 0) && (
                         <span className="text-xs text-gray-400 dark:text-neutral-500">No clicks yet</span>
                       )}
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && !isLoadingEmails && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-neutral-500">
                      No emails found. Generate and send one to see tracking data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Scheduled Email</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Subject</label>
                 <input
                   type="text"
                   value={editSubject}
                   onChange={(e) => setEditSubject(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Body</label>
                 <textarea
                   value={editBody}
                   onChange={(e) => setEditBody(e.target.value)}
                   className="w-full h-40 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Scheduled Time</label>
                 <input
                   type="datetime-local"
                   value={editScheduledAt}
                   onChange={(e) => setEditScheduledAt(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                 />
               </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800 flex justify-end gap-3">
               <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                 Cancel
               </button>
               <button onClick={handleUpdateScheduledEmail} disabled={isUpdating} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                 {isUpdating ? "Saving..." : "Save Changes"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
