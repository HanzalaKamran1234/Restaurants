"use client";

import React, { useState } from 'react';
import { Award, Briefcase, FileText, CheckCircle } from 'lucide-react';

export default function Careers() {
  const jobs = [
    {
      title: "Line Chef (Desi Specialty)",
      dept: "Kitchen Operations",
      type: "Full-Time",
      loc: "North Nazimabad, Karachi"
    },
    {
      title: "Logistics Dispatch Rider",
      dept: "Delivery Operations",
      type: "Flexible Shift",
      loc: "North Nazimabad, Karachi"
    },
    {
      title: "Restaurant Host / Concierge",
      dept: "Guest Relations",
      type: "Full-Time",
      loc: "Karachi HQ"
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
    <div className="max-w-5xl mx-auto px-4 py-16 font-sans relative z-10 space-y-12">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs tracking-widest text-gold font-bold uppercase">Join the Team</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Careers at Ziyafat</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          We are always searching for passionate chefs, dedicated logistics riders, and customer-service visionaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Open Job Listings */}
        <section className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase size={16} className="text-gold" />
            <span>Open Opportunities</span>
          </h3>

          {jobs.map((job, idx) => (
            <div key={idx} className="glass p-5 rounded-2xl border border-white/5 space-y-2 hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm sm:text-base font-bold text-white">{job.title}</h4>
                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-text-muted">
                  {job.type}
                </span>
              </div>
              <div className="flex gap-4 text-[11px] text-text-muted">
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
            <div className="glass-premium p-8 rounded-3xl border border-gold/20 text-center space-y-4">
              <div className="flex justify-center text-green-400">
                <CheckCircle size={48} className="animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-white">Application Received</h4>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Thank you for applying to Ziyafat. Our HR operations team will review your application and reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-1.5">
                <FileText size={16} className="text-gold" />
                <span>Submit Application</span>
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hamza Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Apply Position</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.title} value={j.title}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Why do you want to join Ziyafat?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Briefly pitch your experience..."
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-light text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors"
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
