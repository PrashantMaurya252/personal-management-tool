"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, MoreVertical, Building2, UploadCloud, Loader2, Download, X, Pencil, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-hot-toast";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    companyType: "Product",
    location: "",
    companyCareerPage: "",
    status: "not_applied",
  });

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
    fetchCompanies();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("excel", file);

    try {
      const response = await axiosInstance.post("/companies/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCompanies(); // refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload excel");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddOrUpdateCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCompany) {
        const response = await axiosInstance.put(`/companies/${editingCompany._id}`, formData);
        if (response.data.success) {
          toast.success("Company updated successfully");
          setEditingCompany(null);
          setFormData({ name: "", industry: "", companyType: "Product", location: "", companyCareerPage: "", status: "not_applied" });
          fetchCompanies();
        }
      } else {
        const response = await axiosInstance.post("/companies", formData);
        if (response.data.success) {
          toast.success("Company added successfully");
          setIsAddModalOpen(false);
          setFormData({ name: "", industry: "", companyType: "Product", location: "", companyCareerPage: "", status: "not_applied" });
          fetchCompanies();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (editingCompany ? "Failed to update company" : "Failed to add company"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company? This will also delete all associated hiring managers and job openings!")) return;
    
    try {
      const response = await axiosInstance.delete(`/companies/${id}`);
      if (response.data.success) {
        toast.success("Company deleted successfully");
        fetchCompanies();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete company");
    }
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || "",
      industry: company.industry || "",
      companyType: company.companyType || "Product",
      location: company.location || "",
      companyCareerPage: company.companyCareerPage || "",
      status: company.status || "not_applied",
    });
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingCompany(null);
    setFormData({ name: "", industry: "", companyType: "Product", location: "", companyCareerPage: "", status: "not_applied" });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Companies</h1>
          <p className="text-neutral-400 mt-2">Manage and track your target companies.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/companies-template.xlsx"
            download
            className="flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors border border-neutral-700"
          >
            <Download className="w-5 h-5 mr-2 text-neutral-400" />
            Template
          </a>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
          >
            {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2 text-neutral-400" />}
            {isUploading ? "Uploading..." : "Upload Excel"}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Company
          </button>
        </div>
      </header>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search companies..."
              className="bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-800 text-sm font-medium text-neutral-400">
                <th className="p-4 pl-6">Company</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Career Page</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-300">{company.industry || "-"}</td>
                  <td className="p-4 text-neutral-300">{company.companyType || "-"}</td>
                  <td className="p-4 text-neutral-300">{company.location || "-"}</td>
                  <td className="p-4 text-neutral-300">
                    {company.companyCareerPage ? (
                      <a href={company.companyCareerPage} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Link
                      </a>
                    ) : "-"}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${company.status === 'interview'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : company.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(company)}
                        className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Company"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCompany(company._id)}
                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-neutral-500">
                    No companies found. Upload an Excel file or add one manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Company Modal */}
      {(isAddModalOpen || editingCompany) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white">{editingCompany ? "Edit Company" : "Add Company"}</h2>
              <button onClick={closeModals} className="text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdateCompany} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Company Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="E.g. Google" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Industry</label>
                  <input type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="E.g. Technology" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Type</label>
                  <select value={formData.companyType} onChange={e => setFormData({...formData, companyType: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="E.g. Remote, NY" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Career Page URL</label>
                <input type="url" value={formData.companyCareerPage} onChange={e => setFormData({...formData, companyCareerPage: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="not_applied">Not Applied</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button type="button" onClick={closeModals} className="flex-1 py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCompany ? "Update Company" : "Save Company")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
