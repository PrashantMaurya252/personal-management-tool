"use client";


import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, Star, Trash2, Edit2, Eye, ChevronRight } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function ResumePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  
  // States for the currently selected resume details
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [desiredRoles, setDesiredRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  
  const [isUpdatingLinks, setIsUpdatingLinks] = useState(false);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    try {
      const response = await axiosInstance.get("/resume");
      if (response.data.success) {
        setResumes(response.data.data);
        if (response.data.data.length > 0 && !selectedResumeId) {
          // Select default or first one
          const def = response.data.data.find(r => r.isDefault) || response.data.data[0];
          handleSelectResume(def);
        }
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSelectResume = (resume) => {
    setSelectedResumeId(resume._id);
    const data = resume.extractedData || {};
    setGithub(data.github || "");
    setLinkedin(data.linkedin || "");
    setPortfolio(data.portfolio || "");
    setDesiredRoles(data.desiredRoles || []);
  };

  const selectedResume = resumes.find(r => r._id === selectedResumeId);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!e.target.files?.[0]) return;
    
    if (resumes.length >= 3) {
      return toast.error("Maximum 3 resumes allowed. Please delete one first.");
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", e.target.files[0]);

    try {
      const response = await axiosInstance.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success && response.data.data) {
        toast.success("Resume uploaded and parsed successfully!");
        await fetchResumes();
        handleSelectResume(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetDefault = async (e, id) => {
    e.stopPropagation();
    setIsSettingDefault(true);
    try {
      const response = await axiosInstance.put(`/resume/default/${id}`);
      if (response.data.success) {
        toast.success("Default resume updated!");
        fetchResumes();
      }
    } catch (error) {
      toast.error("Failed to set default");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/resume/${id}`);
      if (response.data.success) {
        toast.success("Resume deleted!");
        if (selectedResumeId === id) setSelectedResumeId(null);
        fetchResumes();
      }
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  const updateSelectedResumeData = async (payload) => {
    try {
      await axiosInstance.put(`/resume/data/${selectedResumeId}`, payload);
      // Update local state to avoid refetch
      setResumes(resumes.map(r => {
        if (r._id === selectedResumeId) {
          return { ...r, extractedData: { ...r.extractedData, ...payload } };
        }
        return r;
      }));
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Resume Management</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">Upload up to 3 resumes, set a default, and manage your AI-extracted profiles.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Sidebar: List of Resumes & Upload Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Resumes ({resumes.length}/3)</h3>
            
            <div className="space-y-3">
              {resumes.map(resume => (
                <div 
                  key={resume._id} 
                  onClick={() => handleSelectResume(resume)}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                    selectedResumeId === resume._id 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/50" 
                    : "border-gray-100 hover:border-blue-200 dark:border-neutral-800 dark:hover:border-neutral-700 bg-gray-50 dark:bg-neutral-950"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-5 h-5 ${selectedResumeId === resume._id ? "text-blue-500" : "text-gray-400"}`} />
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[140px]">
                        {resume.fileName || "Resume"}
                      </span>
                    </div>
                    {resume.isDefault && (
                      <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center">
                        <Star className="w-3 h-3 mr-1" fill="currentColor" /> Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-neutral-500 mb-4 line-clamp-1">
                    {resume.extractedData?.desiredRoles?.join(", ") || "No roles defined"}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 border-t border-gray-200 dark:border-neutral-800 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleSetDefault(e, resume._id)}
                      disabled={resume.isDefault || isSettingDefault}
                      className="text-xs font-medium text-gray-500 hover:text-blue-600 disabled:opacity-30 transition-colors"
                    >
                      {resume.isDefault ? "Default" : "Set Default"}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, resume._id)}
                      disabled={isDeleting}
                      className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {resumes.length < 3 && (
                <div className="pt-2">
                   <label className="cursor-pointer relative block">
                     <input type="file" className="hidden" onChange={handleUpload} accept=".pdf" disabled={isUploading} />
                     <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
                       isUploading ? "bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 cursor-not-allowed" : "border-gray-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-500 hover:text-blue-600"
                     }`}>
                       {isUploading ? (
                         <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                       ) : (
                         <UploadCloud className="w-6 h-6 mb-2" />
                       )}
                       <span className="text-sm font-medium">
                         {isUploading ? "Uploading..." : "Upload New Resume"}
                       </span>
                     </div>
                   </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Selected Resume Details */}
        <div className="lg:col-span-2">
          {!selectedResume ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl bg-gray-50 dark:bg-neutral-900/50">
                <FileText className="w-12 h-12 text-gray-300 dark:text-neutral-700 mb-4" />
                <p className="text-gray-500 dark:text-neutral-400 font-medium">Select a resume to view and edit details</p>
             </div>
          ) : (
             <div className="space-y-6 animate-in fade-in duration-300">
                
                <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/> Profile Extracted</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-gray-500 dark:text-neutral-500 text-xs uppercase tracking-wider mb-1">Full Name</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedResume.extractedData?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-neutral-500 text-xs uppercase tracking-wider mb-1">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedResume.extractedData?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-neutral-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedResume.extractedData?.phone || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 dark:border-neutral-800">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.extractedData?.skills?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Social Links Form */}
                  <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Social Links</h4>
                    <div className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">GitHub</label>
                        <input
                          type="url"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">LinkedIn</label>
                        <input
                          type="url"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-neutral-400">Portfolio</label>
                        <input
                          type="url"
                          value={portfolio}
                          onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://yourportfolio.com"
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          setIsUpdatingLinks(true);
                          try {
                            await updateSelectedResumeData({ github, linkedin, portfolio });
                            toast.success("Social links updated!");
                          } catch (error) {
                            toast.error("Failed to update links");
                          } finally {
                            setIsUpdatingLinks(false);
                          }
                        }}
                        disabled={isUpdatingLinks}
                        className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                      >
                        {isUpdatingLinks ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isUpdatingLinks ? "Saving..." : "Save Links"}
                      </button>
                    </div>
                  </div>
                  
                  {/* Desired Roles */}
                  <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
                     <h4 className="font-bold text-gray-900 dark:text-white mb-4">Desired Roles</h4>
                     <div className="flex flex-wrap gap-2 mb-4">
                       {desiredRoles.map((role, i) => (
                         <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-sm flex items-center">
                           {role}
                           <button 
                            onClick={async () => {
                              const updatedRoles = desiredRoles.filter((_, idx) => idx !== i);
                              setDesiredRoles(updatedRoles);
                              setIsUpdatingRoles(true);
                              try {
                                await updateSelectedResumeData({ desiredRoles: updatedRoles });
                                toast.success("Role removed");
                              } catch (error) {
                                toast.error("Failed to remove role");
                                setDesiredRoles(desiredRoles);
                              } finally {
                                setIsUpdatingRoles(false);
                              }
                            }} 
                            className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-white">&times;</button>
                         </span>
                       ))}
                       {desiredRoles.length === 0 && <span className="text-gray-500 dark:text-neutral-500 text-sm">No desired roles added.</span>}
                     </div>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         value={newRole}
                         onChange={(e) => setNewRole(e.target.value)}
                         onKeyDown={async (e) => {
                           if (e.key === 'Enter' && newRole.trim()) {
                             const roleToAdd = newRole.trim();
                             const updatedRoles = [...desiredRoles, roleToAdd];
                             setDesiredRoles(updatedRoles);
                             setNewRole("");
                             setIsUpdatingRoles(true);
                             try {
                               await updateSelectedResumeData({ desiredRoles: updatedRoles });
                               toast.success("Role added");
                             } catch (error) {
                               toast.error("Failed to add role");
                               setDesiredRoles(desiredRoles);
                             } finally {
                               setIsUpdatingRoles(false);
                             }
                           }
                         }}
                         placeholder="e.g. Frontend Developer"
                         className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                       />
                       <button 
                         onClick={async () => {
                           if (newRole.trim()) {
                             const roleToAdd = newRole.trim();
                             const updatedRoles = [...desiredRoles, roleToAdd];
                             setDesiredRoles(updatedRoles);
                             setNewRole("");
                             setIsUpdatingRoles(true);
                             try {
                               await updateSelectedResumeData({ desiredRoles: updatedRoles });
                               toast.success("Role added");
                             } catch (error) {
                               toast.error("Failed to add role");
                               setDesiredRoles(desiredRoles);
                             } finally {
                               setIsUpdatingRoles(false);
                             }
                           }
                         }}
                         disabled={isUpdatingRoles || !newRole.trim()}
                         className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-sm transition-colors disabled:opacity-50 font-medium"
                       >
                         {isUpdatingRoles ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                       </button>
                     </div>
                  </div>
                </div>
                
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
