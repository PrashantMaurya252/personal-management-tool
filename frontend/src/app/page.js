import React from "react";
import Link from "next/link";
import { ArrowRight, Brain, Briefcase, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
      
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          PersonalManager
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          Now with AI Resume Parsing
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Manage your career <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            with superhuman speed.
          </span>
        </h1>
        
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate personal management tool to track target companies, organize hiring managers, and magically parse your resume using advanced AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-all flex items-center group w-full sm:w-auto justify-center">
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="px-8 py-4 border border-neutral-800 bg-neutral-900/50 rounded-full font-bold hover:bg-neutral-800 transition-all w-full sm:w-auto justify-center text-white backdrop-blur-sm">
            Learn More
          </Link>
        </div>

        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
           <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl hover:border-blue-500/30 transition-colors">
             <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
               <Briefcase className="w-6 h-6 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold mb-3 text-white">Company Tracking</h3>
             <p className="text-neutral-400 leading-relaxed">Organize your job search. Keep tabs on target companies, interview statuses, and application timelines all in one beautiful dashboard.</p>
           </div>
           
           <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl hover:border-indigo-500/30 transition-colors">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
               <Database className="w-6 h-6 text-indigo-400" />
             </div>
             <h3 className="text-xl font-bold mb-3 text-white">Network Management</h3>
             <p className="text-neutral-400 leading-relaxed">Save hiring managers, recruiters, and contacts. Never lose a valuable connection during your job hunt again.</p>
           </div>

           <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl hover:border-purple-500/30 transition-colors">
             <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
               <Brain className="w-6 h-6 text-purple-400" />
             </div>
             <h3 className="text-xl font-bold mb-3 text-white">AI Extraction</h3>
             <p className="text-neutral-400 leading-relaxed">Upload your PDF resume and let Gemini automatically parse your skills, experience, and education directly into your profile database.</p>
           </div>
        </div>
      </main>
    </div>
  );
}
