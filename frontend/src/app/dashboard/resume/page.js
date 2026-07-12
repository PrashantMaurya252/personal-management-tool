"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function ResumePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  
  // Social Links State
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [isUpdatingLinks, setIsUpdatingLinks] = useState(false);
  
  // Custom Data State
  const [desiredRoles, setDesiredRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [experience, setExperience] = useState([]);
  const [newExp, setNewExp] = useState({ company: "", role: "", duration: "" });
  const [isUpdatingCustom, setIsUpdatingCustom] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axiosInstance.get("/resume");
        if (response.data.success && response.data.data) {
          const data = response.data.data.extractedData;
          setResumeData(data);
          setGithub(data.github || "");
          setLinkedin(data.linkedin || "");
          setPortfolio(data.portfolio || "");
          setDesiredRoles(data.desiredRoles || []);
          setExperience(data.experience || []);
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
        const data = response.data.data.extractedData;
        setResumeData(data);
        setGithub(data.github || "");
        setLinkedin(data.linkedin || "");
        setPortfolio(data.portfolio || "");
        setDesiredRoles(data.desiredRoles || []);
        setExperience(data.experience || []);
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

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl mt-6">
              <h4 className="font-bold text-white mb-4 flex items-center">Social Links</h4>
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">GitHub</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">LinkedIn</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-400">Portfolio</label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  onClick={async () => {
                    setIsUpdatingLinks(true);
                    try {
                      await axiosInstance.put("/resume/data", { github, linkedin, portfolio });
                      toast.success("Social links updated!");
                    } catch (error) {
                      toast.error("Failed to update links");
                    } finally {
                      setIsUpdatingLinks(false);
                    }
                  }}
                  disabled={isUpdatingLinks}
                  className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isUpdatingLinks ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isUpdatingLinks ? "Saving..." : "Save Links"}
                </button>
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
               <h4 className="font-bold text-white mb-4">Desired Roles</h4>
               <div className="flex flex-wrap gap-2 mb-4">
                 {desiredRoles.map((role, i) => (
                   <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm flex items-center">
                     {role}
                     <button onClick={() => setDesiredRoles(desiredRoles.filter((_, idx) => idx !== i))} className="ml-2 text-indigo-400 hover:text-white">&times;</button>
                   </span>
                 ))}
                 {desiredRoles.length === 0 && <span className="text-neutral-500 text-sm">No desired roles added yet.</span>}
               </div>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={newRole}
                   onChange={(e) => setNewRole(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && newRole.trim()) {
                       setDesiredRoles([...desiredRoles, newRole.trim()]);
                       setNewRole("");
                     }
                   }}
                   placeholder="e.g. Frontend Developer"
                   className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                 />
                 <button 
                   onClick={() => {
                     if (newRole.trim()) {
                       setDesiredRoles([...desiredRoles, newRole.trim()]);
                       setNewRole("");
                     }
                   }}
                   className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm transition-colors"
                 >
                   Add
                 </button>
               </div>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
               <h4 className="font-bold text-white mb-4">Experience</h4>
               <div className="space-y-6 mb-6">
                 {experience.map((exp, i) => (
                   <div key={i} className="relative pl-6 border-l-2 border-neutral-800 pb-2 last:pb-0 group">
                     <div className="absolute w-3 h-3 bg-neutral-800 rounded-full -left-[7px] top-1.5 border-2 border-neutral-950"></div>
                     <div className="flex justify-between items-start">
                       <div>
                         <h5 className="font-bold text-white">{exp.role}</h5>
                         <p className="text-blue-400 text-sm mt-1">{exp.company}</p>
                         <p className="text-neutral-500 text-sm mt-1">{exp.duration}</p>
                       </div>
                       <button onClick={() => setExperience(experience.filter((_, idx) => idx !== i))} className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         &times;
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="space-y-3 pt-4 border-t border-neutral-800">
                 <h5 className="text-sm font-medium text-neutral-400">Add Experience</h5>
                 <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="Company" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white" />
                   <input type="text" placeholder="Role" value={newExp.role} onChange={e => setNewExp({...newExp, role: e.target.value})} className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white" />
                   <input type="text" placeholder="Duration (e.g. 2020 - Present)" value={newExp.duration} onChange={e => setNewExp({...newExp, duration: e.target.value})} className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white col-span-2" />
                 </div>
                 <button 
                   onClick={() => {
                     if (newExp.company && newExp.role) {
                       setExperience([...experience, newExp]);
                       setNewExp({ company: "", role: "", duration: "" });
                     }
                   }}
                   className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm transition-colors mt-2"
                 >
                   Add Experience
                 </button>
               </div>
               
               <button
                  onClick={async () => {
                    setIsUpdatingCustom(true);
                    try {
                      await axiosInstance.put("/resume/data", { desiredRoles, experience });
                      toast.success("Profile data saved!");
                    } catch (error) {
                      toast.error("Failed to save data");
                    } finally {
                      setIsUpdatingCustom(false);
                    }
                  }}
                  disabled={isUpdatingCustom}
                  className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isUpdatingCustom ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isUpdatingCustom ? "Saving Changes..." : "Save Roles & Experience"}
                </button>
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
