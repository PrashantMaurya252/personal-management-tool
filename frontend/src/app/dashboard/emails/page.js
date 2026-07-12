"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send, Mail, RefreshCw, Paperclip, Loader2, Eye, Building2, User, AlertTriangle } from "lucide-react";
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
  const [hasResume, setHasResume] = useState(null);

  // Send Form State
  const [toEmail, setToEmail] = useState("");
  const [hrName, setHrName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Tracking Tab State
  const [emails, setEmails] = useState([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const fetchResumeStatus = async () => {
    try {
      const response = await axiosInstance.get("/resume");
      if (response.data.success && response.data.data?.extractedData) {
        setHasResume(true);
      } else {
        setHasResume(false);
      }
    } catch (error) {
      setHasResume(false);
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
    fetchResumeStatus();
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
      const formData = new FormData();
      formData.append("email", toEmail);
      formData.append("subject", subject);
      formData.append("body", body);
      
      if (companyName) formData.append("companyName", companyName);
      if (hrName) formData.append("hrName", hrName);
      
      if (resumeFile) {
        formData.append("resumePdf", resumeFile);
      }

      const response = await axiosInstance.post("/emails/send-hr-email", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        toast.success("Email sent successfully!");
        setJobDescription("");
        setGeneratedData(null);
        setToEmail("");
        setHrName("");
        setCompanyName("");
        setSubject("");
        setBody("");
        setResumeFile(null);
        setActiveTab("track");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Email Outreach</h1>
          <p className="text-neutral-400 mt-2">Generate AI emails from job posts and track opens in real-time.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-neutral-900/50 p-1 rounded-xl border border-neutral-800 w-fit">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "generate"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate & Send
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "track"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Mail className="w-4 h-4 mr-2" />
          Tracker
        </button>
      </div>

      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Job Post Input */}
          <div className="space-y-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white mb-4">1. Paste LinkedIn Job Post</h2>
              
              {hasResume === false && (
                <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-400">Resume Required</h3>
                    <p className="text-xs text-orange-400/80 mt-1">
                      You need to upload and parse your resume before generating emails so the AI can match your specific skills.
                    </p>
                    <Link href="/dashboard/resume" className="text-xs font-semibold text-orange-400 mt-2 inline-block hover:underline">
                      Go to Resume Tab &rarr;
                    </Link>
                  </div>
                </div>
              )}

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                disabled={hasResume === false}
                className="w-full h-[400px] bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || hasResume === false}
                className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                {isGenerating ? "Analyzing & Generating..." : "Generate Email"}
              </button>
            </div>
          </div>

          {/* Right Column: Editable Output & Send Form */}
          <div className="space-y-4">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">2. Review & Send</h2>
                {generatedData && <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Data Extracted Successfully</span>}
              </div>
              
              {!generatedData && !isGenerating && (
                <div className="h-[400px] flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your generated email will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-[400px] flex flex-col items-center justify-center text-blue-400 border-2 border-dashed border-neutral-800 rounded-xl">
                  <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                  <p className="animate-pulse">Crafting the perfect email...</p>
                </div>
              )}

              {generatedData && !isGenerating && (
                <form onSubmit={handleSendEmail} className="space-y-4 animate-in fade-in duration-500">
                  <p className="text-xs text-neutral-400 bg-neutral-800/50 p-3 rounded-lg border border-neutral-800">
                    Verify the extracted data below. You can update any missing or incorrect details before saving them to your database.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Company Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">HR Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="text"
                          value={hrName}
                          onChange={(e) => setHrName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">To (HR Email)</label>
                      <input
                        type="email"
                        required
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Body</label>
                    <textarea
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-64 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-neutral-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all font-mono text-sm"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Links wrapped in {'{{ }}'} placeholders will be automatically converted to tracking links when sent.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Attach Resume (PDF)</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        accept=".pdf"
                        id="resume-upload"
                        className="hidden"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                      <label 
                        htmlFor="resume-upload"
                        className="cursor-pointer flex items-center justify-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl border border-neutral-700 transition-all w-full"
                      >
                        <Paperclip className="w-4 h-4 mr-2 text-neutral-400" />
                        {resumeFile ? resumeFile.name : "Select PDF File"}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !resumeFile}
                    className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                    {isSending ? "Saving Data & Sending..." : "Save Data & Send with Tracking"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "track" && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-400" />
              Sent Emails Log
            </h2>
            <button 
              onClick={fetchEmails}
              disabled={isLoadingEmails}
              className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingEmails ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-neutral-800 text-sm font-medium text-neutral-400 bg-neutral-950/50">
                  <th className="p-4 pl-6">Company</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Sent At</th>
                  <th className="p-4">Opens</th>
                  <th className="p-4">Last Opened</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {emails.map((email) => (
                  <tr key={email._id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 pl-6 text-neutral-200 font-medium">
                      {email.company?.name || "-"}
                    </td>
                    <td className="p-4 text-neutral-400">
                      {email.recipientEmail?.email || "-"}
                    </td>
                    <td className="p-4 text-neutral-300 max-w-xs truncate" title={email.generatedSubject}>
                      {email.generatedSubject}
                    </td>
                    <td className="p-4 text-neutral-400">
                      {email.sentAt ? new Date(email.sentAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Eye className={`w-4 h-4 mr-2 ${email.tracking?.isOpened ? "text-indigo-400" : "text-neutral-600"}`} />
                        <span className={email.tracking?.isOpened ? "text-indigo-400 font-bold" : "text-neutral-500"}>
                          {email.tracking?.openedCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-400">
                      {email.tracking?.openedAt?.length > 0
                        ? new Date(email.tracking.openedAt[email.tracking.openedAt.length - 1]).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        email.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        email.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                      }`}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {emails.length === 0 && !isLoadingEmails && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-neutral-500">
                      No emails sent yet. Generate and send one to see tracking data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
