'use client';
import React, { useState, useEffect } from 'react';
import { Database, Key, Globe, CheckCircle, AlertCircle, X, ShieldCheck, Copy, Check } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials, isSupabaseConfigured } from '@/lib/supabase';
export default function SupabaseConfigModal({ isOpen, onClose }) {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [status, setStatus] = useState('idle');
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (isOpen) {
            const creds = getSupabaseCredentials();
            if (creds) {
                setUrl(creds.url);
                setKey(creds.key);
            }
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const handleSave = (e) => {
        e.preventDefault();
        if (!url || !key) {
            setStatus('error');
            return;
        }
        saveSupabaseCredentials(url, key);
        setStatus('success');
        setTimeout(() => {
            onClose();
        }, 800);
    };
    const handleResetToDemo = () => {
        clearSupabaseCredentials();
        setUrl('');
        setKey('');
        setStatus('idle');
        onClose();
    };
    const handleCopySchema = () => {
        navigator.clipboard.writeText(`-- Run schema.sql from the supabase/ folder in your Supabase SQL Editor`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const isConfigured = isSupabaseConfigured();
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-gold-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-gold-500/10 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors">
          <X className="w-5 h-5"/>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <Database className="w-6 h-6"/>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-100">Supabase Storage & DB Setup</h3>
            <p className="text-xs text-stone-400">Dual-Mode: Local Mock Engine & Live Supabase PostgreSQL</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`p-3.5 rounded-xl border mb-5 flex items-start gap-3 ${isConfigured
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'}`}>
          {isConfigured ? (<CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400"/>) : (<AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400"/>)}
          <div className="text-xs">
            <span className="font-semibold block mb-0.5">
              {isConfigured ? 'Supabase Connected' : 'Running in Local Interactive Demo Mode'}
            </span>
            <span>
              {isConfigured
            ? 'High-res photos are uploaded directly to your Supabase `event-photos` bucket and PostgreSQL database.'
            : 'All event creations, client-compressed photo uploads, and downloads run instantly in your browser with pre-loaded demo events.'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider">
              Supabase Project URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"/>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xyzcompany.supabase.co" className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition-all"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider">
              Supabase Anon Key
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"/>
              <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 focus:border-gold-500 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition-all"/>
            </div>
          </div>

          {/* Quick SQL schema reminder */}
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400"/>
              Database Schema: <code className="text-gold-300">supabase/schema.sql</code>
            </span>
            <button type="button" onClick={handleCopySchema} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] flex items-center gap-1 transition-colors">
              {copied ? <Check className="w-3 h-3 text-emerald-400"/> : <Copy className="w-3 h-3"/>}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-800">
            <button type="button" onClick={handleResetToDemo} className="text-xs text-stone-400 hover:text-stone-200 underline decoration-dotted transition-colors">
              Reset to Demo Mode
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-stone-950 rounded-xl text-sm font-semibold shadow-lg shadow-gold-500/20 transition-all">
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>);
}
