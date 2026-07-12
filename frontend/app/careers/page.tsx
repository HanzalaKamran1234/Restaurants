"use client";

import React, { useState } from 'react';
import { Briefcase, FileText, CheckCircle } from 'lucide-react';

export default function Careers() {
  const jobs = [
    {
      title: "Fashion Designer (Garment Construction)",
      dept: "Creative Design",
      type: "Full-Time",
      loc: "Karachi Studio"
    },
    {
      title: "Textile Sourcing Coordinator",
      dept: "Supply Chain",
      type: "Full-Time",
      loc: "Karachi HQ"
    },
    {
      title: "Brand Copywriter & Content Strategist",
      dept: "Brand Marketing",
      type: "Full-Time",
      loc: "Karachi / Hybrid"
    }
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedJob, setSelectedJob] = useState(jobs[0].title);
  const [pitch, setPitch] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && pitch) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans relative z-10 space-y-12">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs tracking-[0.25em] text-primary font-bold uppercase block">Join the Team</span>
        <h1 className="text-2xl sm:text-4xl font-serif tracking-widest text-white uppercase">Careers at THE VESTRA</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          We are always searching for passionate designers, supply chain coordinators, and branding visionaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Open Job Listings */}
        <section className="md:col-span-7 space-y-4">
          <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-white/10 pb-3">
            <Briefcase size={14} className="text-primary" />
            <span>Open Opportunities</span>
          </h3>

          {jobs.map((job, idx) => (
            <div key={idx} className="glass p-5 rounded border border-white/5 space-y-2 hover:border-primary/20 transition-all text-xs font-light">
              <div className="flex justify-between items-start gap-4">
                <h4 className="font-bold text-white uppercase tracking-wider">{job.title}</h4>
                <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-text-muted font-bold">
                  {job.type}
                </span>
              </div>
              <div className="flex gap-4 text-[10px] text-text-muted">
                <span><strong>Department:</strong> {job.dept}</span>
                <span>•</span>
                <span><strong>Location:</strong> {job.loc}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Application Form */}
        <aside className="md:col-span-5">
          {submitted ? (
            <div className="glass-premium p-8 rounded border border-primary/20 text-center space-y-4 font-light text-xs">
              <div className="flex justify-center text-primary">
                <CheckCircle size={48} className="animate-bounce" />
              </div>
              <h4 className="font-serif font-bold text-white uppercase tracking-widest">Application Received</h4>
              <p className="text-text-muted leading-relaxed">
                Thank you for applying to THE VESTRA. Our HR operations team will review your credentials and reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="glass p-6 rounded border border-white/5 space-y-4 text-xs font-light">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                <span>Submit Application</span>
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Position</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none font-medium"
                >
                  {jobs.map((j) => (
                    <option key={j.title} value={j.title}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Why do you want to join THE VESTRA?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Briefly pitch your design or business experience..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none leading-relaxed font-light"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-light text-black font-bold py-3 rounded text-[9px] uppercase tracking-widest transition-all"
              >
                Submit Application
              </button>
            </form>
          )}
        </aside>

      </div>
    </div>
  );
}
