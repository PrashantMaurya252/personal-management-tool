"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, UserCircle, X, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function HiringManagersPage() {
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    status: "active",
  });

  const fetchManagers = async () => {
    try {
      const response = await axiosInstance.get("/hiring-managers");
      if (response.data.success) {
        setManagers(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hiring managers:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies");
      if (response.data.success) {
        setCompanies(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchCompanies();
  }, []);

  const handleAddManager = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/hiring-managers", formData);
      if (response.data.success) {
        toast.success("Manager added successfully");
        setIsAddModalOpen(false);
        setFormData({ name: "", company: "", email: "", phone: "", linkedinUrl: "", status: "active" });
        fetchManagers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hiring Managers</h1>
          <p className="text-neutral-400 mt-2">Keep track of your HR contacts and hiring managers.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Manager
        </button>
      </header>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search managers..." 
              className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-sm font-medium text-neutral-400">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {managers.map((manager) => (
                <tr key={manager._id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{manager.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-300 font-medium">{manager.company?.name || "Unknown"}</td>
                  <td className="p-4 text-neutral-400">
                    {manager.email ? (
                      <a href={`mailto:${manager.email}`} className="hover:text-white transition-colors">{manager.email}</a>
                    ) : "-"}
                  </td>
                  <td className="p-4 text-neutral-400">{manager.phone || "-"}</td>
                  <td className="p-4 text-right pr-6">
                    <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-neutral-500">
                    No hiring managers found. Click "Add Manager" to start tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">Add Manager</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddManager} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. Jane Doe" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Company</label>
                <select required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <option value="" disabled>Select a company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. jane@stripe.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. +1 234 567 8900" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">LinkedIn URL</label>
                <input type="url" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
