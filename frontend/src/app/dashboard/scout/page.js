"use client";

import React, { useState, useEffect } from "react";
import { Telescope, Clock, ExternalLink, Calendar, Loader2, Save, Power, PowerOff, Building } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function JobScoutPage() {
  const [settings, setSettings] = useState({ isActive: true, timeSlots: [] });
  const [newTimeSlot, setNewTimeSlot] = useState("10:00");
  const [isSaving, setIsSaving] = useState(false);
  
  const [jobOpenings, setJobOpenings] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const [companies, setCompanies] = useState([]);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchJobOpenings();
  }, [filterDate]);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get("/scout-settings");
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies");
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const fetchJobOpenings = async () => {
    setIsLoadingJobs(true);
    try {
      const response = await axiosInstance.get(`/job-openings?date=${filterDate}`);
      if (response.data.success) {
        setJobOpenings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch job openings:", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    setIsSaving(true);
    try {
      await axiosInstance.put("/scout-settings", updatedSettings);
      setSettings(updatedSettings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCompanyScout = async (companyId, currentStatus) => {
    setIsUpdatingCompany(true);
    try {
      await axiosInstance.put(`/companies/${companyId}`, { isScoutEnabled: !currentStatus });
      setCompanies(companies.map(c => c._id === companyId ? { ...c, isScoutEnabled: !currentStatus } : c));
      toast.success(`Scouting ${!currentStatus ? 'enabled' : 'disabled'} for company`);
    } catch (error) {
      toast.error("Failed to update company");
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const addTimeSlot = () => {
    if (!settings.timeSlots.includes(newTimeSlot)) {
      saveSettings({ ...settings, timeSlots: [...settings.timeSlots, newTimeSlot].sort() });
    }
  };

  const removeTimeSlot = (slot) => {
    saveSettings({ ...settings, timeSlots: settings.timeSlots.filter(s => s !== slot) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <Telescope className="w-8 h-8 mr-3 text-indigo-400" />
            Automated Job Scout
          </h1>
          <p className="text-neutral-400 mt-2">
            Configure your AI assistant to automatically scan career pages for matching roles.
          </p>
        </div>
        <button
          onClick={() => saveSettings({ ...settings, isActive: !settings.isActive })}
          disabled={isSaving}
          className={`px-5 py-2.5 rounded-xl font-medium flex items-center transition-all ${
            settings.isActive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
          }`}
        >
          {settings.isActive ? <Power className="w-4 h-4 mr-2" /> : <PowerOff className="w-4 h-4 mr-2" />}
          {settings.isActive ? "Scout Active" : "Scout Paused"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          {/* Settings Panel */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Scout Schedule
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Select what times (24h format) the AI should check your enabled companies.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {settings.timeSlots.map((slot) => (
                <span
                  key={slot}
                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm flex items-center"
                >
                  {slot}
                  <button
                    onClick={() => removeTimeSlot(slot)}
                    className="ml-2 text-blue-400/70 hover:text-white"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="time"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addTimeSlot}
                disabled={isSaving}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Companies Panel */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-indigo-400" />
              Companies to Scout
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {companies.map(company => (
                <div key={company._id} className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800/50">
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{company.name}</p>
                    {company.companyCareerPage ? (
                      <p className="text-xs text-emerald-400">Has career page</p>
                    ) : (
                      <p className="text-xs text-red-400">No career page link</p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={company.isScoutEnabled}
                      disabled={!company.companyCareerPage || isUpdatingCompany}
                      onChange={() => toggleCompanyScout(company._id, company.isScoutEnabled)}
                    />
                    <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">No companies added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">Discovered Openings</h3>
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {isLoadingJobs ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-neutral-400 text-sm">Fetching discovered openings...</p>
              </div>
            ) : jobOpenings.length > 0 ? (
              <div className="space-y-4">
                {jobOpenings.map((job) => (
                  <div
                    key={job._id}
                    className="group bg-neutral-950 border border-neutral-800 rounded-xl p-5 hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {job.jobTitle}
                      </h4>
                      <p className="text-sm text-neutral-400 flex items-center">
                        <Building className="w-4 h-4 mr-1.5" />
                        {job.companyId?.name || "Unknown Company"}
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1.5" />
                        {new Date(job.dateFound).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors sm:w-auto w-full"
                    >
                      View & Apply
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-xl">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Telescope className="w-8 h-8 text-neutral-500" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No Openings Found</h4>
                <p className="text-neutral-400 max-w-sm mx-auto text-sm">
                  The AI scout hasn't discovered any roles matching your desired roles on this date.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
