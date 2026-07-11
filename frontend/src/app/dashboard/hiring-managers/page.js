"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, UserCircle } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function HiringManagersPage() {
  const [managers, setManagers] = useState([]);

  useEffect(() => {
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
    fetchManagers();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Hiring Managers</h1>
          <p className="text-neutral-400 mt-2">Keep track of your HR contacts and hiring managers.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
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
          <table className="w-full text-left border-collapse">
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
                  <td className="p-4 text-neutral-300 font-medium">{manager.company}</td>
                  <td className="p-4 text-neutral-400">{manager.email}</td>
                  <td className="p-4 text-neutral-400">{manager.phone}</td>
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
