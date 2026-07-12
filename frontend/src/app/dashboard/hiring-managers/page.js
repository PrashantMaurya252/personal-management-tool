"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, UserCircle, X, Loader2, Pencil, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function HiringManagersPage() {
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      const response = await axiosInstance.get(`/hiring-managers?page=${currentPage}&limit=10&search=${searchQuery}`);
      if (response.data.success) {
        setManagers(response.data.data.managers || []);
        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch hiring managers:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchManagers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get("/companies?pagination=false");
      if (response.data.success) {
        setCompanies(response.data.data.companies || []);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddOrUpdateManager = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingManager) {
        const response = await axiosInstance.put(`/hiring-managers/${editingManager._id}`, formData);
        if (response.data.success) {
          toast.success("Manager updated successfully");
          closeModals();
          fetchManagers();
        }
      } else {
        const response = await axiosInstance.post("/hiring-managers", formData);
        if (response.data.success) {
          toast.success("Manager added successfully");
          closeModals();
          fetchManagers();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (editingManager ? "Failed to update manager" : "Failed to add manager"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hiring manager?")) return;
    
    try {
      const response = await axiosInstance.delete(`/hiring-managers/${id}`);
      if (response.data.success) {
        toast.success("Manager deleted successfully");
        fetchManagers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete manager");
    }
  };

  const openEditModal = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name || "",
      company: manager.company?._id || manager.company || "",
      email: manager.email || "",
      phone: manager.phone || "",
      linkedinUrl: manager.linkedinUrl || "",
      status: manager.status || "active",
    });
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingManager(null);
    setFormData({ name: "", company: "", email: "", phone: "", linkedinUrl: "", status: "active" });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Hiring Managers</h1>
          <p className="text-gray-500 dark:text-neutral-400 mt-2">Keep track of your HR contacts and hiring managers.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Manager
        </button>
      </header>

      <div className="bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-2xl dark:backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search managers..." 
              className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-sm font-medium text-gray-500 dark:text-neutral-400">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/50">
              {managers.map((manager) => (
                <tr key={manager._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <UserCircle className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{manager.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300 font-medium">{manager.company?.name || "Unknown"}</td>
                  <td className="p-4 text-gray-500 dark:text-neutral-400">
                    {manager.email ? (
                      <a href={`mailto:${manager.email}`} className="hover:text-indigo-600 dark:hover:text-white transition-colors">{manager.email}</a>
                    ) : "-"}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-neutral-400">{manager.phone || "-"}</td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(manager)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Manager"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteManager(manager._id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete Manager"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-neutral-500">
                    No hiring managers found. Click "Add Manager" to start tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Manager Modal */}
      {(isAddModalOpen || editingManager) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl w-full max-w-md my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingManager ? "Edit Manager" : "Add Manager"}</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdateManager} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. Jane Doe" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Company</label>
                <select required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                  <option value="" disabled>Select a company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. jane@stripe.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="E.g. +1 234 567 8900" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">LinkedIn URL</label>
                <input type="url" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button type="button" onClick={closeModals} className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingManager ? "Update Manager" : "Save Manager")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
