"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Building2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
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
    fetchCompanies();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Companies</h1>
          <p className="text-neutral-400 mt-2">Manage and track your target companies.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </button>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-sm font-medium text-neutral-400">
                <th className="p-4 pl-6">Company</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-300">{company.industry}</td>
                  <td className="p-4 text-neutral-300">{company.location}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${company.status === 'interview'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
