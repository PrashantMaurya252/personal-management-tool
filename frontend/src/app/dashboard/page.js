"use client";

import React, { useState, useEffect } from "react";
import { Building2, Users, FileText, CheckCircle2, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    companies: 0,
    managers: 0,
    applications: 0,
    interviews: 0,
    hasResume: false
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companiesRes, managersRes, resumeRes] = await Promise.all([
          axiosInstance.get("/companies").catch(() => ({ data: { data: [] } })),
          axiosInstance.get("/hiring-managers").catch(() => ({ data: { data: [] } })),
          axiosInstance.get("/resume").catch(() => ({ data: { data: null } }))
        ]);

        const companies = companiesRes.data?.data || [];
        const managers = managersRes.data?.data || [];
        const resume = resumeRes.data?.data;

        setData({
          companies: companies.length,
          managers: managers.length,
          applications: companies.filter(c => c.status === "applied").length,
          interviews: companies.filter(c => c.status === "interview").length,
          hasResume: !!resume
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { name: "Total Companies", value: data.companies, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "Hiring Managers", value: data.managers, icon: Users, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { name: "Applications", value: data.applications, icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
    { name: "Interviews", value: data.interviews, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  if (loading) {
    return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-blue-400" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back!</h1>
        <p className="text-gray-500 dark:text-neutral-400 mt-2">Here is what is happening with your job search today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 rounded-2xl bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 dark:backdrop-blur-xl hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-neutral-400">Activity feed will go here...</p>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 dark:backdrop-blur-xl shadow-sm dark:shadow-none">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Profile Status</h2>
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-xl bg-gray-50 dark:bg-transparent">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-2">Resume Extracted</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${data.hasResume ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700"}`}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> {data.hasResume ? "Active" : "Not uploaded yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
