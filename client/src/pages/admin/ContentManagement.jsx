import React, { useState, useEffect } from 'react';
import {
  adminGetContent,
  adminUpdateContent,
  adminGetContactMessages,
  adminUpdateContactMessage,
} from '../../services/api.js';

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Content states
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Contact messages state
  const [messages, setMessages] = useState([]);
  const [messageFilter, setMessageFilter] = useState('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const content = await adminGetContent();
      setCompany(content.company);
      setServices(content.services || []);
      setFaqs(content.faqs || []);

      const msgs = await adminGetContactMessages({ status: messageFilter === 'all' ? '' : messageFilter });
      setMessages(msgs.items || []);
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Failed to load content.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [messageFilter]);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateContent('company', company);
      setNotification({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      await adminUpdateContent('services', services);
      setNotification({ type: 'success', text: 'Allied services configuration updated successfully.' });
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Failed to update services.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMessageStatus = async (msgId, newStatus) => {
    try {
      const updated = await adminUpdateContactMessage(msgId, {
        status: newStatus,
        adminNotes: adminNotesInput,
      });
      setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
      setSelectedMessage(updated);
      setNotification({ type: 'success', text: `Message marked as "${newStatus}".` });
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Failed to update message.' });
    }
  };

  if (loading && !company) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Loading Content Management...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Governance & Content
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Content & Inquiries Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure company branding, manage service delivery visibility, inspect contact inquiries, and review FAQs.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'company', label: 'Company Profile' },
            { id: 'services', label: 'Allied Services' },
            { id: 'inquiries', label: `Inquiries (${messages.length})` },
            { id: 'faqs', label: 'FAQ Directory' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{notification.text}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: Company Profile */}
      {activeTab === 'company' && company && (
        <form onSubmit={handleSaveCompany} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Company Identity & Public Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Updates to these fields instantly reflect on the public About Us and Contact pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={company.brandName || ''}
                onChange={(e) => setCompany({ ...company, brandName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={company.tagline || ''}
                onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Company Introduction</label>
              <textarea
                rows={3}
                value={company.description || ''}
                onChange={(e) => setCompany({ ...company, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary Helpline</label>
              <input
                type="text"
                value={company.contactInfo?.phone || ''}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    contactInfo: { ...company.contactInfo, phone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Inquiries Email</label>
              <input
                type="email"
                value={company.contactInfo?.email || ''}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    contactInfo: { ...company.contactInfo, email: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Registered / Operational Address</label>
              <input
                type="text"
                value={company.contactInfo?.officeAddress || ''}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    contactInfo: { ...company.contactInfo, officeAddress: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Operating Hours</label>
              <input
                type="text"
                value={company.contactInfo?.operatingHours || ''}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    contactInfo: { ...company.contactInfo, operatingHours: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Allied Services Manager */}
      {activeTab === 'services' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Allied Services & Delivery Visibility</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure delivery models (Direct, Partner, Coming Soon) and public visibility.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveServices}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Services'}
            </button>
          </div>

          <div className="space-y-4">
            {services.map((svc, idx) => (
              <div
                key={svc.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{svc.title}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      {svc.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{svc.shortDesc}</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delivery Type Dropdown */}
                  <select
                    value={svc.deliveryType}
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx].deliveryType = e.target.value;
                      setServices(updated);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="direct">Direct (MasterJi)</option>
                    <option value="verified_partner">Verified Partner</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="unavailable">Unavailable</option>
                  </select>

                  {/* Active Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...services];
                      updated[idx].isActive = !updated[idx].isActive;
                      setServices(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      svc.isActive !== false
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {svc.isActive !== false ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Contact Inquiries Inbox */}
      {activeTab === 'inquiries' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Public Contact Inquiries</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inquiries submitted via the public /contact form.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['all', 'new', 'in_progress', 'responded', 'archived'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMessageFilter(status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    messageFilter === status
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No contact inquiries recorded under status: "{messageFilter}".
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Message List (5 cols) */}
              <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => {
                        setSelectedMessage(msg);
                        setAdminNotesInput(msg.adminNotes || '');
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400/80 shadow-sm'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] text-amber-400 font-bold">
                          {msg.referenceCode}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            msg.status === 'new'
                              ? 'bg-rose-950 text-rose-400'
                              : msg.status === 'responded'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{msg.name}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{msg.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Message Detail Card (7 cols) */}
              <div className="lg:col-span-7">
                {selectedMessage ? (
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="font-mono text-xs text-amber-400 font-bold block">
                          {selectedMessage.referenceCode}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{selectedMessage.subject}</h4>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Sender Name:</span>
                        <strong className="text-white">{selectedMessage.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Phone:</span>
                        <strong className="text-white">+91 {selectedMessage.phone}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Email Address:</span>
                        <strong className="text-white">{selectedMessage.email}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Message Content:</span>
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-medium">Internal Admin Notes</label>
                      <textarea
                        rows={2}
                        value={adminNotesInput}
                        onChange={(e) => setAdminNotesInput(e.target.value)}
                        placeholder="Add disposition remarks..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                      />
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Mark In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'responded')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Mark Responded
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(selectedMessage.id, 'archived')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Select an inquiry from the list to review details.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FAQ Directory */}
      {activeTab === 'faqs' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review published FAQs categorized across browsing, verification, site visits, and brokerage.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    {faq.category}
                  </span>
                  <h4 className="text-xs font-bold text-white">{faq.question}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

