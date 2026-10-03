import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Search,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api, { getErrorMessage } from '../../api/axios';

const navItems = [
  { label: '← AI Hub', to: '/ai-hub' },
  { label: 'Certificate Studio', to: '/ai-hub/certificate' },
  { label: 'Poster Studio', to: '/ai-hub/poster' },
  { label: 'Event Copy', to: '/ai-hub/description' },
  { label: 'Email Studio', to: '/ai-hub/email' },
  { label: 'Feedback', to: '/ai-hub/feedback' },
];

const certificateTypes = [
  { id: 'Participation', label: 'Participation', subtitle: 'OF PARTICIPATION' },
  { id: 'Excellence', label: 'Excellence', subtitle: 'OF EXCELLENCE' },
  { id: 'Appreciation', label: 'Appreciation', subtitle: 'OF APPRECIATION' },
  { id: 'Winner', label: 'Prize Winner', subtitle: 'OF ACHIEVEMENT' },
];

const CertificateGenerator = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Form State
  const [form, setForm] = useState({
    participantName: 'Aarav Sharma',
    eventName: 'Dance Smash 2026',
    certificateType: 'Participation',
    organizerName: 'Faculty Coordinator',
    hodName: 'Dr. Animesh Tayal',
    citation: '',
    customCitation: false,
    verificationId: 'CERT-SBJ-AIML-7842',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  // Batch Generation State
  const [batchMode, setBatchMode] = useState(false);
  const [batchNames, setBatchNames] = useState('Aarav Sharma\nRohan Verma\nSneha Patel\nVikram Aditya');
  const [batchIndex, setBatchIndex] = useState(0);

  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const certificateRef = useRef(null);

  // Load faculty events to populate dropdown
  useEffect(() => {
    setLoadingEvents(true);
    api.get('/events/my-events')
      .then((res) => {
        const evs = res.data.events || [];
        setEvents(evs);
        if (evs.length > 0) {
          const first = evs[0];
          setSelectedEventId(first._id);
          setForm((prev) => ({
            ...prev,
            eventName: first.title,
            organizerName: first.createdBy?.name || 'Department Faculty Coordinator',
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not load faculty events for certificates', err);
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleEventSelect = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    const ev = events.find((item) => item._id === evId);
    if (ev) {
      setForm((prev) => ({
        ...prev,
        eventName: ev.title,
        organizerName: ev.createdBy?.name || 'Faculty Coordinator',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Generate AI customized citation
  const handleGenerateAiCitation = async () => {
    setLoadingAi(true);
    setErrorMsg('');
    try {
      const res = await api.post('/certificates/ai-citation', {
        participantName: form.participantName,
        eventName: form.eventName,
        certificateType: form.certificateType,
      });
      if (res.data.citation) {
        setForm((prev) => ({
          ...prev,
          citation: res.data.citation,
          customCitation: true,
        }));
        setSuccessMsg('AI Citation generated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to generate AI citation.'));
    } finally {
      setLoadingAi(false);
    }
  };

  // Save / Record Certificate to backend
  const handleIssueCertificate = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        participantName: form.participantName,
        eventName: form.eventName,
        certificateType: form.certificateType,
        citation: form.citation || undefined,
        organizerName: form.organizerName,
        hodName: form.hodName,
        eventId: selectedEventId || undefined,
      };
      const res = await api.post('/certificates/generate', payload);
      if (res.data.certificate) {
        setForm((prev) => ({
          ...prev,
          verificationId: res.data.certificate.verificationId,
        }));
        setSuccessMsg(`Certificate recorded! Verification ID: ${res.data.certificate.verificationId}`);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to save certificate.'));
    } finally {
      setSaving(false);
    }
  };

  // Batch navigation
  const parsedBatchNames = batchNames
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const handleBatchSelect = (idx) => {
    setBatchIndex(idx);
    if (parsedBatchNames[idx]) {
      setForm((prev) => ({ ...prev, participantName: parsedBatchNames[idx] }));
    }
  };

  // Print Certificate (opens native print window styled for certificate)
  const handlePrint = () => {
    window.print();
  };

  // Download high-resolution PNG using HTML5 Canvas
  const handleDownloadImage = () => {
    const certElement = certificateRef.current;
    if (!certElement) return;

    // Create an SVG-based raster image using foreignObject
    const width = 1120;
    const height = 792; // Standard A4 landscape aspect ratio ~1.414

    // Clone element to string
    const clone = certElement.cloneNode(true);
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${certElement.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x high resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(image, 0, 0);

      const pngURL = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.download = `Certificate_${form.participantName.replace(/\s+/g, '_')}_${form.eventName.replace(/\s+/g, '_')}.png`;
      dlLink.href = pngURL;
      dlLink.click();
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify/${form.verificationId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Selected subtitle
  const selectedTypeObj = certificateTypes.find((t) => t.id === form.certificateType) || certificateTypes[0];

  return (
    <DashboardLayout navItems={navItems}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">
            <Award size={14} /> AI Certificate Generation Module
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Institutional Certificate Generator</h1>
          <p className="text-sm opacity-60">
            Generate verifiable, high-resolution certificates matching the S.B. Jain Institute & AURON official format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            className="px-4 py-2 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
          >
            <Download size={14} /> Download Certificate (PNG)
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-mono opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs mb-6 flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs mb-6 flex items-center gap-2 font-mono">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-[#1A1A1E] space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Sliders size={18} className="text-accent" /> Certificate Details
              </h2>
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setBatchMode(false)}
                  className={`px-3 py-1 rounded-full transition-colors ${!batchMode ? 'bg-accent text-white font-medium' : 'opacity-60'}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setBatchMode(true)}
                  className={`px-3 py-1 rounded-full transition-colors ${batchMode ? 'bg-accent text-white font-medium' : 'opacity-60'}`}
                >
                  Batch
                </button>
              </div>
            </div>

            {/* Event Selection Dropdown */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                Load from My Events
              </label>
              <select
                value={selectedEventId}
                onChange={handleEventSelect}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              >
                <option value="">-- Select Event Draft / Approved --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({ev.category}) • {ev.status?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Type */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                Certificate Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {certificateTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, certificateType: t.id }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono text-center transition-all ${
                      form.certificateType === t.id
                        ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm'
                        : 'border-border-light dark:border-border-dark bg-white dark:bg-[#242429] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Single Participant or Batch Mode */}
            {!batchMode ? (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                  Participant Full Name *
                </label>
                <input
                  type="text"
                  name="participantName"
                  value={form.participantName}
                  onChange={handleInputChange}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors font-medium"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider opacity-60">
                    Batch Participant Names (One per line)
                  </label>
                  <span className="text-[11px] font-mono opacity-50">{parsedBatchNames.length} names</span>
                </div>
                <textarea
                  rows={4}
                  value={batchNames}
                  onChange={(e) => setBatchNames(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors font-mono"
                  placeholder="Aarav Sharma&#10;Rohan Verma&#10;Sneha Patel"
                />

                {/* Batch Name Selector Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedBatchNames.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBatchSelect(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        batchIndex === idx && form.participantName === name
                          ? 'bg-accent text-white font-bold'
                          : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Event Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                Event Name *
              </label>
              <input
                type="text"
                name="eventName"
                value={form.eventName}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Signatures & HOD */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                  Organizer Name / Title
                </label>
                <input
                  type="text"
                  name="organizerName"
                  value={form.organizerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Faculty Coordinator"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1.5">
                  Head of Department
                </label>
                <input
                  type="text"
                  name="hodName"
                  value={form.hodName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* AI Citation Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider opacity-60">
                  Certificate Commendation Body
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiCitation}
                  disabled={loadingAi}
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  {loadingAi ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Enhance with AI
                </button>
              </div>
              <textarea
                name="citation"
                rows={2}
                value={
                  form.citation ||
                  `WE GIVE THIS CERTIFICATE BECAUSE ${form.participantName.toUpperCase()} HAS PARTICIPATED IN ${form.eventName.toUpperCase()} THAT WE ORGANIZE.`
                }
                onChange={(e) => setForm((prev) => ({ ...prev, citation: e.target.value, customCitation: true }))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#242429] outline-none focus:border-accent transition-colors leading-relaxed font-mono uppercase"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleIssueCertificate}
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-xl bg-accent text-white text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
                Issue & Record Certificate
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-3 rounded-xl border border-border-light dark:border-border-dark hover:border-accent text-xs font-mono flex items-center gap-1.5 transition-colors"
                title="Copy Public Verification Link"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Preview Column (The Certificate Canvas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">
              Live Preview (Exact Reference Replica)
            </span>
            <span className="text-xs font-mono text-accent">
              ID: {form.verificationId}
            </span>
          </div>

          {/* Certificate Container Styled to Match User Format Strictly */}
          <div className="overflow-x-auto pb-4">
            <div
              ref={certificateRef}
              id="certificate-render-node"
              className="w-[740px] h-[520px] bg-white text-gray-900 rounded-none shadow-2xl relative overflow-hidden flex flex-col justify-between select-none mx-auto border border-gray-200"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: '#FFFFFF',
              }}
            >
              {/* TOP ACCENT BAR: Royal Blue Top Header Strip */}
              <div className="w-full h-4 bg-[#1E2B60] relative">
                <div
                  className="absolute top-0 right-1/4 w-32 h-full bg-[#182352]"
                  style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)' }}
                />
              </div>

              {/* HEADER ROW: Logos */}
              <div className="px-10 pt-5 flex items-center justify-between">
                {/* Left Logo: S.B. Jain Institute */}
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-600/40 p-1 flex items-center justify-center bg-white shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-600">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#059669" strokeWidth="6" strokeDasharray="6 3" />
                      <path d="M30 65 L50 25 L70 65 Z" fill="#1E3A8A" />
                      <circle cx="50" cy="48" r="10" fill="#059669" />
                      <path d="M25 72 Q50 82 75 72" fill="none" stroke="#059669" strokeWidth="4" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="font-sans font-black text-[17px] tracking-tight text-[#1E3A8A] flex items-center gap-1">
                      <span className="text-[#059669]">S.B.</span> Jain
                    </p>
                    <p className="font-sans font-semibold text-[13px] tracking-wider text-[#1E3A8A]">
                      Institute
                    </p>
                    <p className="text-[6.5px] tracking-widest text-gray-400 uppercase font-mono mt-0.5">
                      Technology • Management • Research
                    </p>
                  </div>
                </div>

                {/* Right Logo: AURON Artificial Intelligence */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right leading-tight">
                    <p className="font-sans font-black text-[17px] tracking-wider text-[#1E3A8A]">
                      AURON
                    </p>
                    <p className="text-[6.5px] font-mono tracking-widest text-gray-500 uppercase">
                      Artificial Intelligence
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#1E3A8A]/30 p-1 flex items-center justify-center bg-white shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E3A8A]">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#1E3A8A" strokeWidth="4" />
                      <path d="M50 18 L24 78 L38 78 L50 48 L62 78 L76 78 Z" fill="#1E3A8A" />
                      <circle cx="50" cy="30" r="4" fill="#0284C7" />
                      <circle cx="34" cy="62" r="3" fill="#0284C7" />
                      <circle cx="66" cy="62" r="3" fill="#0284C7" />
                      <line x1="34" y1="62" x2="66" y2="62" stroke="#0284C7" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="px-10 text-center flex-1 flex flex-col justify-center my-auto -mt-1">
                {/* CERTIFICATE */}
                <h1
                  className="text-[44px] font-black tracking-[0.08em] text-[#0F172A] uppercase leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  CERTIFICATE
                </h1>

                {/* OF PARTICIPATION */}
                <p className="text-[14px] font-bold tracking-[0.35em] text-[#1E293B] uppercase mt-1">
                  {selectedTypeObj.subtitle}
                </p>

                {/* WE ARE PROUDLY PRESENT THIS TO */}
                <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase font-semibold mt-4">
                  WE ARE PROUDLY PRESENT THIS TO
                </p>

                {/* Participant Name in Script Font */}
                <div className="my-1.5">
                  <span
                    className="text-[46px] text-[#253B80] font-normal leading-tight select-all inline-block"
                    style={{
                      fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                    }}
                  >
                    {form.participantName || 'Name of Participant'}
                  </span>
                </div>

                {/* Descriptive Text Body */}
                <p className="text-[10px] font-semibold text-gray-600 max-w-[540px] mx-auto leading-relaxed tracking-wider uppercase px-4">
                  {form.citation ||
                    `WE GIVE THIS CERTIFICATE BECAUSE ${form.participantName.toUpperCase()} HAS PARTICIPATED IN ${form.eventName.toUpperCase()} THAT WE ORGANIZE.`}
                </p>
              </div>

              {/* SIGNATURES & MEDAL ROW */}
              <div className="px-14 pb-8 relative z-20 flex items-end justify-between">
                {/* Left Signature: Organizer */}
                <div className="text-center w-48">
                  <div className="w-40 border-b border-gray-900 mx-auto mb-1.5" />
                  <p className="font-bold text-[13px] text-gray-900 font-sans tracking-tight leading-none">
                    ({form.organizerName || 'Name of the Organizer'})
                  </p>
                  <p className="text-[11px] font-serif italic text-gray-600 font-medium tracking-wide mt-0.5">
                    Organizer
                  </p>
                </div>

                {/* Center: Golden Medal with Ribbon */}
                <div className="relative -mb-1 flex flex-col items-center">
                  <div className="w-16 h-20 relative flex items-center justify-center">
                    {/* Dual Red Ribbon Tails */}
                    <div
                      className="absolute bottom-0 left-2.5 w-4 h-9 bg-[#B91C1C] shadow-md"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                        transform: 'rotate(14deg)',
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-2.5 w-4 h-9 bg-[#991B1B] shadow-md"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                        transform: 'rotate(-14deg)',
                      }}
                    />

                    {/* Scalloped Gold Medallion Circular Badge */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D97706] via-[#FBBF24] to-[#F59E0B] shadow-lg border border-[#FDE68A] flex items-center justify-center relative z-10">
                      <div className="w-11 h-11 rounded-full border border-dashed border-[#78350F]/40 flex items-center justify-center bg-gradient-to-b from-[#FDE047] to-[#D97706]">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#78350F] fill-current opacity-80">
                          <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 16.1l-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span className="text-[7px] font-mono tracking-tighter text-gray-400 mt-0.5">
                    {form.verificationId}
                  </span>
                </div>

                {/* Right Signature: Head Of Department */}
                <div className="text-center w-48">
                  <div className="w-40 border-b border-gray-900 mx-auto mb-1.5" />
                  <p className="font-bold text-[13px] text-gray-900 font-sans tracking-tight leading-none">
                    {form.hodName || 'Dr. Animesh Tayal'}
                  </p>
                  <p className="text-[11px] font-serif italic text-gray-600 font-medium tracking-wide mt-0.5">
                    Head Of Department
                  </p>
                </div>
              </div>

              {/* FOOTER GRAPHICS: Magenta Wedge + Deep Navy Angular Polygon Bar */}
              <div className="relative w-full h-8 overflow-hidden z-10">
                {/* Pink / Magenta Angular Chevron on Bottom Left */}
                <div
                  className="absolute bottom-0 left-0 w-36 h-full bg-[#E11D48]"
                  style={{
                    clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0 100%)',
                  }}
                />

                {/* Navy Blue Angular Bar across Bottom */}
                <div
                  className="absolute bottom-0 left-24 right-0 h-full bg-[#1E2B60]"
                  style={{
                    clipPath: 'polygon(6% 0, 100% 0, 100% 100%, 0% 100%)',
                  }}
                />

                {/* Right edge small magenta accent */}
                <div
                  className="absolute bottom-0 right-0 w-12 h-2 bg-[#E11D48]"
                  style={{
                    clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CertificateGenerator;
