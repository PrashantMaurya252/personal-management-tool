"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function ResumePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axiosInstance.get("/resume");
        if (response.data.success && response.data.data) {
          setResumeData(response.data.data.extractedData);
        }
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      }
    };
    fetchResume();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", e.target.files[0]);

    try {
      const response = await axiosInstance.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success && response.data.data) {
        setResumeData(response.data.data.extractedData);
        toast.success("Resume parsed successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Resume Extraction</h1>
        <p className="text-neutral-400 mt-2">Upload your resume and let AI extract your profile data automatically.</p>
      </header>

      {!resumeData ? (
        <div className="bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-3xl p-12 text-center backdrop-blur-xl transition-colors hover:border-neutral-700 hover:bg-neutral-900/80">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            ) : (
              <UploadCloud className="w-10 h-10 text-blue-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isUploading ? "Extracting Data using AI..." : "Upload your resume (PDF)"}
          </h3>
          <p className="text-neutral-400 mb-8 max-w-sm mx-auto">
            {isUploading 
              ? "Gemini is analyzing your resume to extract skills, experience, and education."
              : "Drag and drop your PDF here, or click to browse. We'll automatically parse your details."}
          </p>
          
          <div className="flex justify-center">
             <label className="cursor-pointer relative">
               <input type="file" className="hidden" onChange={handleUpload} accept=".pdf" disabled={isUploading} />
               <div className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                 isUploading ? "bg-neutral-800 text-neutral-500 cursor-not-allowed" : "bg-white text-black hover:bg-neutral-200"
               }`}>
                 <Sparkles className="w-5 h-5 mr-2" />
                 {isUploading ? "Processing..." : "Select PDF File"}
               </div>
             </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center backdrop-blur-xl">
               <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="w-8 h-8 text-emerald-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-1">Extraction Complete</h3>
               <p className="text-sm text-emerald-400/80">AI successfully parsed your details</p>
               
               <button 
                onClick={() => setResumeData(null)}
                className="mt-6 w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm transition-colors">
                 Upload New Resume
               </button>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
              <h4 className="font-bold text-white mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-400"/> Contact Info</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500">Full Name</p>
                  <p className="text-white font-medium">{resumeData.name}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Email</p>
                  <p className="text-white font-medium">{resumeData.email}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Phone</p>
                  <p className="text-white font-medium">{resumeData.phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
               <h4 className="font-bold text-white mb-4">Skills</h4>
               <div className="flex flex-wrap gap-2">
                 {resumeData.skills.map((skill, i) => (
                   <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
               <h4 className="font-bold text-white mb-4">Experience</h4>
               <div className="space-y-6">
                 {resumeData.experience.map((exp, i) => (
                   <div key={i} className="relative pl-6 border-l-2 border-neutral-800 pb-2 last:pb-0">
                     <div className="absolute w-3 h-3 bg-neutral-800 rounded-full -left-[7px] top-1.5 border-2 border-neutral-950"></div>
                     <h5 className="font-bold text-white">{exp.role}</h5>
                     <p className="text-blue-400 text-sm mt-1">{exp.company}</p>
                     <p className="text-neutral-500 text-sm mt-1">{exp.duration}</p>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
               <h4 className="font-bold text-white mb-4">Education</h4>
               <div className="space-y-6">
                 {resumeData.education.map((edu, i) => (
                   <div key={i} className="relative pl-6 border-l-2 border-neutral-800 pb-2 last:pb-0">
                     <div className="absolute w-3 h-3 bg-neutral-800 rounded-full -left-[7px] top-1.5 border-2 border-neutral-950"></div>
                     <h5 className="font-bold text-white">{edu.degree}</h5>
                     <p className="text-indigo-400 text-sm mt-1">{edu.institution}</p>
                     <p className="text-neutral-500 text-sm mt-1">{edu.duration}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
