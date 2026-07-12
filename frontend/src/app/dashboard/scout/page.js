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
  const [isManualScouting, setIsManualScouting] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 500);
    return () => clearTimeout(timer);
  }, [companySearchQuery]);

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
      const response = await axiosInstance.get(`/companies?pagination=false&search=${companySearchQuery}`);
      if (response.data.success) {
        setCompanies(response.data.data.companies || []);
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

  const scoutableCompanies = companies.filter(c => c.companyCareerPage);
  const allScoutableEnabled = scoutableCompanies.length > 0 && scoutableCompanies.every(c => c.isScoutEnabled);

  const toggleAllScout = async () => {
    const newStatus = !allScoutableEnabled;
    setIsUpdatingCompany(true);
    try {
      const companyIds = scoutableCompanies.map(c => c._id);
      await axiosInstance.put("/companies/bulk/scout", { companyIds, isScoutEnabled: newStatus });
      
      setCompanies(companies.map(c => 
        c.companyCareerPage ? { ...c, isScoutEnabled: newStatus } : c
      ));
      toast.success(`Scouting ${newStatus ? 'enabled' : 'disabled'} for all visible companies`);
    } catch (error) {
      toast.error("Failed to update companies");
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const runManualScout = async () => {
    setIsManualScouting(true);
    try {
      await axiosInstance.post("/scout-settings/run");
      toast.success("Job Scout finished successfully!");
      fetchJobOpenings();
    } catch (error) {
      toast.error("Failed to run Job Scout");
    } finally {
      setIsManualScouting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
            <Telescope className="w-8 h-8 mr-3 text-indigo-500 dark:text-indigo-400" />
            Automated Job Scout
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">
            Configure your AI assistant to automatically scan career pages for matching roles.
          </p>
        </div>
        <button
          onClick={() => saveSettings({ ...settings, isActive: !settings.isActive })}
          disabled={isSaving}
          className={`px-5 py-2.5 rounded-xl font-medium flex items-center transition-all w-full sm:w-auto justify-center ${
            settings.isActive
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          {settings.isActive ? <Power className="w-4 h-4 mr-2" /> : <PowerOff className="w-4 h-4 mr-2" />}
          {settings.isActive ? "Scout Active" : "Scout Paused"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1">
          {/* Settings Panel */}
          <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              Scout Schedule
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              Select what times (24h format) the AI should check your enabled companies.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {settings.timeSlots.map((slot) => (
                <span
                  key={slot}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm flex items-center"
                >
                  {slot}
                  <button
                    onClick={() => removeTimeSlot(slot)}
                    className="ml-2 text-blue-400/70 hover:text-blue-600 dark:hover:text-white"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="time"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addTimeSlot}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-xl transition-colors font-medium"
              >
                Add
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Instant Action</h4>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mb-4">
                Manually trigger the scout immediately without waiting for the schedule.
              </p>
              <button
                onClick={runManualScout}
                disabled={isManualScouting || companies.length === 0}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isManualScouting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Telescope className="w-5 h-5 mr-2" />}
                {isManualScouting ? "Scouting in progress..." : "Run Scout Now"}
              </button>
            </div>
          </div>

          {/* Companies Panel */}
          <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <Building className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                Companies to Scout
              </h3>
              
              {scoutableCompanies.length > 0 && (
                <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-neutral-300 cursor-pointer select-none bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700">
                  <span className="font-medium">Enable All</span>
                  <div className="relative inline-flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={allScoutableEnabled}
                      disabled={isUpdatingCompany}
                      onChange={toggleAllScout}
                    />
                    <div className="w-7 h-4 bg-gray-300 dark:bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 disabled:opacity-50"></div>
                  </div>
                </label>
              )}
            </div>
            
            <input
              type="text"
              value={companySearchQuery}
              onChange={(e) => setCompanySearchQuery(e.target.value)}
              placeholder="Search companies..."
              className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-sm rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {companies.map(company => (
                <div key={company._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-950 rounded-xl border border-gray-100 dark:border-neutral-800/50">
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{company.name}</p>
                    {company.companyCareerPage ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Has career page</p>
                    ) : (
                      <p className="text-xs text-red-500 dark:text-red-400">No career page link</p>
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
                    <div className="w-9 h-5 bg-gray-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-neutral-500 text-center py-4">No companies added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Discovered Openings</h3>
              <div className="flex items-center bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-neutral-400 mr-2" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none w-full"
                />
              </div>
            </div>

            {isLoadingJobs ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-neutral-400 text-sm">Fetching discovered openings...</p>
              </div>
            ) : jobOpenings.length > 0 ? (
              <div className="space-y-4">
                {jobOpenings.map((job) => (
                  <div
                    key={job._id}
                    className="group bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.jobTitle}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-neutral-400 flex items-center">
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
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors sm:w-auto w-full shadow-sm"
                    >
                      View & Apply
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-xl bg-gray-50 dark:bg-transparent">
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 shadow-sm dark:shadow-none rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-transparent">
                  <Telescope className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Openings Found</h4>
                <p className="text-gray-500 dark:text-neutral-400 max-w-sm mx-auto text-sm">
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
