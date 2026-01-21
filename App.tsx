
import React, { useState, useCallback } from 'react';
import {
  Petitioner,
  Respondent,
  Advocate,
  Annotation,
  WritFormData,
  Annexure,
  DateEntry,
  Application,
  NoteEntry,
  Reply
} from './types';
import { TextInput, SectionHeader, RepeatableBlock, SelectInput } from './components/FormFields';
import { DocumentPreview } from './components/DocumentPreview';
import { supabase } from './lib/supabase';
import { CheckCircle, FileText, Send, Printer, AlertTriangle, Trash2, Mail, Gavel, Plus, Paperclip, MessageSquare, StickyNote, Download as DownloadIcon, DownloadCloud, Edit, CornerUpRight, CheckCircle2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

const INITIAL_DATA: WritFormData = {
  highCourt: "IN THE HIGH COURT OF DELHI AT NEW DELHI",
  jurisdiction: "EXTRA ORDINARY CIVIL WRIT JURISDICTION",
  petitionType: 'Civil',
  year: '2025',
  petitioners: [{ id: '1', name: '', addresses: [''], city: '', pin: '', state: '' }],
  respondents: [{ id: '1', name: '', addresses: [''], city: '', pin: '', state: '', email: '' }],
  petitionDescription: 'GROUP CAPTAIN VS CENTRAL PUBLIC + GLASS MANUFACTURERS',
  annexures: [],
  applications: [],
  notes: [],
  letterOfAuthorityUpload: null,
  location: 'New Delhi',
  filingDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
  advocates: [{ id: '1', name: '', enrolmentNumber: '', addresses: [''], phoneNumbers: [''], email: '' }],
  addresses: [''],
  phoneNumbers: [''],
  userEmail: '',
  urgentPinCode: '110003',
  urgentContent: 'The present matter involves a direct violation of constitutional rights and requires urgent adjudication...',
  certificateContent: 'Certified that the petition contains no false or misleading statements.',
  noticeAddressedTo: 'STANDING COUNSEL',
  noticeDesignation: 'GNCTD / UOI',
  noticeOrg: 'DEPARTMENT OF LAW',
  noticeOffice: 'HIGH COURT OF DELHI',
  noticeLocation: 'NEW DELHI',
  noticeHearingDate: '',
  courtFeeUin: '',
  courtFeeAmount: '500',
  courtFeeAttachment: null,
  synopsisDescription: 'WRIT PETITION UNDER ARTICLE 226 & 227...',
  preSynopsisContent: '',
  synopsisContent: '',
  dateList: [{ id: '1', dates: [''], event: '' }],
  petitionDescriptionMain: 'WRIT PETITION UNDER ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA SEEKING...',
  petitionShoweth: '',
  petitionFacts: '',
  petitionGrounds: '',
  petitionPrayers: '',
  groundEnumerationType: 'Alpha',
  affidavitIdentity: 'Petitioner',
  affidavitName: '',
  affidavitAge: '',
  affidavitAddress: '',
  affidavitLocation: 'New Delhi',
  verificationDate: '',
  proofOfServiceUploads: [],
  includeListingProforma: false,
  includeCertificate: false,
};

export default function App() {
  const [formData, setFormData] = useState<WritFormData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // ☁️ Cloud Sync Implementation
  React.useEffect(() => {
    const fetchAnnotations = async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) setAnnotations(data.map(item => ({
        ...item,
        elementId: item.element_id,
        pageNum: item.page_num,
        isResolved: item.is_resolved
      })));
      if (error) console.error('Error fetching annotations:', error);
    };

    fetchAnnotations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('annotations_realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'annotations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newAnno = payload.new as any;
          setAnnotations(prev => [...prev, {
            ...newAnno,
            elementId: newAnno.element_id,
            pageNum: newAnno.page_num,
            isResolved: newAnno.is_resolved
          }]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as any;
          setAnnotations(prev => prev.map(a => a.id === updated.id ? {
            ...updated,
            elementId: updated.element_id,
            pageNum: updated.page_num,
            isResolved: updated.is_resolved
          } : a));
        } else if (payload.eventType === 'DELETE') {
          setAnnotations(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddAnnotation = async (anno: Annotation) => {
    const { error } = await supabase.from('annotations').insert({
      id: anno.id,
      element_id: anno.elementId,
      text: anno.text,
      author: anno.author,
      x: anno.x,
      y: anno.y,
      page_num: anno.pageNum,
      is_resolved: false,
      replies: []
    });
    if (error) console.error('Error saving annotation:', error);
  };

  const removeAnnotation = async (id: string) => {
    const { error } = await supabase.from('annotations').delete().eq('id', id);
    if (error) console.error('Error deleting annotation:', error);
  };

  const editAnnotation = async (id: string) => {
    const anno = annotations.find(a => a.id === id);
    if (!anno) return;
    const newText = prompt("Edit comment:", anno.text);
    if (newText && newText !== anno.text) {
      const { error } = await supabase.from('annotations').update({ text: newText }).eq('id', id);
      if (error) console.error('Error editing annotation:', error);
    }
  };

  const addReply = async (id: string) => {
    const anno = annotations.find(a => a.id === id);
    if (!anno) return;
    const author = prompt("Your name:", "Advocate Partner") || "Anonymous";
    const text = prompt("Enter reply:");
    if (text) {
      const newReply: Reply = {
        id: Math.random().toString(36).substr(2, 9),
        author,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedReplies = [...(anno.replies || []), newReply];
      const { error } = await supabase.from('annotations').update({ replies: updatedReplies }).eq('id', id);
      if (error) console.error('Error adding reply:', error);
    }
  };

  const toggleResolve = async (id: string) => {
    const anno = annotations.find(a => a.id === id);
    if (!anno) return;
    const { error } = await supabase.from('annotations').update({ is_resolved: !anno.isResolved }).eq('id', id);
    if (error) console.error('Error toggling resolve:', error);
  };

  const exportFeedback = () => {
    const text = annotations.map(a => `[PAGE ${a.pageNum}] ${a.author.toUpperCase()}: ${a.text}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Feedback_${formData.petitioners[0]?.name || 'Petition'}.txt`;
    link.click();
  };

  const updateField = useCallback((field: keyof WritFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePrint = () => window.print();

  const gf = (label: string) => ({
    reviewMode: isReviewMode,
    annotations: annotations.filter(a => a.elementId === label && a.pageNum === 0),
    onRemoveAnnotation: removeAnnotation,
    onEditAnnotation: editAnnotation,
    onToggleResolve: toggleResolve,
    onAddReply: addReply,
    onAddAnnotation: (text: string) => handleAddAnnotation({
      id: Math.random().toString(36).substr(2, 9),
      elementId: label,
      text,
      author: prompt("Enter your name:", "Advocate Partner") || "Anonymous",
      x: 0,
      y: 0,
      pageNum: 0 // 0 indicates form field
    })
  });

  const handleGenerate = async () => {
    const newErrors = [];
    if (!formData.userEmail) newErrors.push("Recipient email is required.");
    if (formData.petitioners.some(p => !p.name)) newErrors.push("One or more petitioners are missing names.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col text-black selection:bg-blue-100">

      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm no-print">
        <div className="flex items-center gap-4">
          <Gavel className="text-blue-600 w-8 h-8" />
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Writ Petition Pro</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">v2.0 | Delhi High Court Compliant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReviewMode(!isReviewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isReviewMode ? 'bg-red-50 text-red-600 border-red-200 shadow-inner' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
          >
            <StickyNote className="w-4 h-4" />
            {isReviewMode ? 'REVIEW MODE: ON' : 'PARTNER REVIEW'}
          </button>
          <div className="bg-gray-100 p-1 rounded-xl flex lg:hidden">
            <button onClick={() => setActiveTab('form')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>FORM</button>
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>PREVIEW</button>
          </div>
          <button onClick={handlePrint} className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all active:scale-95"><Printer className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
        {isSuccess ? (
          <div className="bg-white rounded-[2rem] shadow-2xl p-16 text-center max-w-2xl mx-auto mt-10 no-print">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle className="w-12 h-12" /></div>
            <h2 className="text-3xl font-black mb-4">Petition Dispatched</h2>
            <p className="text-gray-500 mb-10 text-lg">The submission-ready document has been emailed to <b>{formData.userEmail}</b>.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsSuccess(false)} className="px-8 py-4 rounded-xl font-bold bg-gray-100">Back to Editor</button>
              <button onClick={handlePrint} className="px-8 py-4 rounded-xl font-bold bg-blue-600 text-white shadow-xl flex items-center gap-2"><DownloadIcon className="w-5 h-5" /> Download PDF</button>
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${isPreviewMaximized ? '' : 'lg:grid-cols-2'} gap-8 items-start`}>
            <div className={`${activeTab === 'form' ? 'block' : 'hidden lg:block'} ${isPreviewMaximized ? 'hidden' : ''} no-print`}>
              <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12">

                {errors.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
                    <div className="flex items-center gap-2 text-red-900 font-bold mb-2"><AlertTriangle className="w-5 h-5" /> CHECK FAILED</div>
                    <ul className="text-sm text-red-700 space-y-1">{errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
                  </div>
                )}

                <SectionHeader title="Introduction" />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="High Court" value={formData.highCourt} onChange={v => updateField('highCourt', v)} {...gf('High Court')} />
                  <TextInput label="Jurisdiction" value={formData.jurisdiction} onChange={v => updateField('jurisdiction', v)} {...gf('Jurisdiction')} />
                  <SelectInput label="Type" value={formData.petitionType} options={[{ label: 'Civil', value: 'Civil' }, { label: 'Criminal', value: 'Criminal' }]} onChange={v => updateField('petitionType', v)} {...gf('Type')} />
                  <TextInput label="Year" value={formData.year} onChange={v => updateField('year', v)} {...gf('Year')} />
                  <TextInput label="Filing Location" value={formData.location} onChange={v => updateField('location', v)} {...gf('Filing Location')} />
                  <TextInput label="Filing Date" value={formData.filingDate} onChange={v => updateField('filingDate', v)} {...gf('Filing Date')} />
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <button
                    onClick={() => updateField('includeListingProforma', !formData.includeListingProforma)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.includeListingProforma ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    <FileText className="w-4 h-4" /> {formData.includeListingProforma ? 'PROFORMA: INCLUDED' : 'PROFORMA: EXCLUDED'}
                  </button>
                  <button
                    onClick={() => updateField('includeCertificate', !formData.includeCertificate)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.includeCertificate ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    <CheckCircle className="w-4 h-4" /> {formData.includeCertificate ? 'CERTIFICATE: INCLUDED' : 'CERTIFICATE: EXCLUDED'}
                  </button>
                </div>

                <RepeatableBlock title="Petitioners" onAdd={() => updateField('petitioners', [...formData.petitioners, { id: Date.now().toString(), name: '', addresses: [''], city: '', pin: '', state: '', authRep: '' }])}>
                  {formData.petitioners.map((p, i) => (
                    <div key={p.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200">
                      <button onClick={() => updateField('petitioners', formData.petitioners.filter(x => x.id !== p.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`Petitioner #${i + 1} Name`} value={p.name} onChange={v => { const up = [...formData.petitioners]; up[i].name = v; updateField('petitioners', up); }} {...gf(`Petitioner #${i + 1} Name`)} />
                      <TextInput label="Authorised Representative (if any)" value={p.authRep} onChange={v => { const up = [...formData.petitioners]; up[i].authRep = v; updateField('petitioners', up); }} {...gf(`Petitioner #${i + 1} Auth Rep`)} />
                      <div className="grid grid-cols-3 gap-2">
                        <TextInput label="City" value={p.city} onChange={v => { const up = [...formData.petitioners]; up[i].city = v; updateField('petitioners', up); }} {...gf(`Petitioner #${i + 1} City`)} />
                        <TextInput label="Pin" value={p.pin} onChange={v => { const up = [...formData.petitioners]; up[i].pin = v; updateField('petitioners', up); }} {...gf(`Petitioner #${i + 1} Pin`)} />
                        <TextInput label="State" value={p.state} onChange={v => { const up = [...formData.petitioners]; up[i].state = v; updateField('petitioners', up); }} {...gf(`Petitioner #${i + 1} State`)} />
                      </div>
                    </div>
                  ))}
                </RepeatableBlock>

                <RepeatableBlock title="Respondents" onAdd={() => updateField('respondents', [...formData.respondents, { id: Date.now().toString(), name: '', addresses: [''], city: '', pin: '', state: '', email: '', authRep: '' }])}>
                  {formData.respondents.map((r, i) => (
                    <div key={r.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200">
                      <button onClick={() => updateField('respondents', formData.respondents.filter(x => x.id !== r.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`Respondent #${i + 1} Name`} value={r.name} onChange={v => { const up = [...formData.respondents]; up[i].name = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} Name`)} />
                      <TextInput label="Authorised Representative (if any)" value={r.authRep} onChange={v => { const up = [...formData.respondents]; up[i].authRep = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} Auth Rep`)} />
                      <div className="grid grid-cols-3 gap-2">
                        <TextInput label="City" value={r.city} onChange={v => { const up = [...formData.respondents]; up[i].city = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} City`)} />
                        <TextInput label="Pin" value={r.pin} onChange={v => { const up = [...formData.respondents]; up[i].pin = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} Pin`)} />
                        <TextInput label="State" value={r.state} onChange={v => { const up = [...formData.respondents]; up[i].state = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} State`)} />
                      </div>
                      <TextInput label="Email (Optional)" type="email" value={r.email} onChange={v => { const up = [...formData.respondents]; up[i].email = v; updateField('respondents', up); }} {...gf(`Respondent #${i + 1} Email`)} />
                    </div>
                  ))}
                </RepeatableBlock>

                <RepeatableBlock title="Advocates" onAdd={() => updateField('advocates', [...formData.advocates, { id: Date.now().toString(), name: '', enrolmentNumber: '', addresses: [''], phoneNumbers: [''], email: '' }])}>
                  {formData.advocates.map((adv, i) => (
                    <div key={adv.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200 mb-4">
                      {formData.advocates.length > 1 && (
                        <button onClick={() => updateField('advocates', formData.advocates.filter(x => x.id !== adv.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <TextInput label={`Advocate #${i + 1} Name`} value={adv.name} onChange={v => { const up = [...formData.advocates]; up[i].name = v; updateField('advocates', up); }} {...gf(`Advocate #${i + 1} Name`)} />
                        <TextInput label="Enrolment Number" value={adv.enrolmentNumber} onChange={v => { const up = [...formData.advocates]; up[i].enrolmentNumber = v; updateField('advocates', up); }} {...gf(`Advocate #${i + 1} Enrolment`)} />

                        <div className="col-span-2">
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Addresses</p>
                          {adv.addresses.map((addr, ai) => (
                            <div key={ai} className="flex gap-2 mb-2">
                              <div className="flex-1"><TextInput label={`Address ${ai + 1}`} value={addr} onChange={v => { const up = [...formData.advocates]; up[i].addresses[ai] = v; updateField('advocates', up); }} /></div>
                              <button onClick={() => { const up = [...formData.advocates]; up[i].addresses.splice(ai, 1); updateField('advocates', up); }} className="text-gray-300 hover:text-red-500 mt-6"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => { const up = [...formData.advocates]; up[i].addresses.push(''); updateField('advocates', up); }} className="text-[10px] font-bold text-blue-600 uppercase">+ Add Address</button>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Phone Numbers</p>
                          {adv.phoneNumbers.map((phone, pi) => (
                            <div key={pi} className="flex gap-2 items-center mb-2">
                              <div className="flex-1"><TextInput label={`Phone ${pi + 1}`} value={phone} onChange={v => { const up = [...formData.advocates]; up[i].phoneNumbers[pi] = v; updateField('advocates', up); }} {...gf(`Advocate #${i + 1} Phone #${pi + 1}`)} /></div>
                              {adv.phoneNumbers.length > 1 && (
                                <button onClick={() => { const up = [...formData.advocates]; up[i].phoneNumbers = up[i].phoneNumbers.filter((_, idx) => idx !== pi); updateField('advocates', up); }} className="text-gray-300 hover:text-red-500 mt-2"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          ))}
                          <button onClick={() => { const up = [...formData.advocates]; up[i].phoneNumbers.push(''); updateField('advocates', up); }} className="text-[10px] font-bold text-blue-600 uppercase">+ Add Phone</button>
                        </div>

                        <div className="col-span-2">
                          <TextInput label="Email" type="email" value={adv.email} onChange={v => { const up = [...formData.advocates]; up[i].email = v; updateField('advocates', up); }} {...gf(`Advocate #${i + 1} Email`)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="Index Notes (displayed below Index)" />
                <RepeatableBlock title="Notes" onAdd={() => updateField('notes', [...formData.notes, { id: Date.now().toString(), text: '' }])}>
                  {formData.notes.map((note, i) => (
                    <div key={note.id} className="flex gap-2 items-start bg-white p-3 rounded-xl shadow-sm mb-2">
                      <div className="px-3 py-2 font-bold text-gray-400">Note {i + 1}</div>
                      <div className="flex-1"><TextInput label="Note Content" value={note.text} onChange={v => { const up = [...formData.notes]; up[i].text = v; updateField('notes', up); }} {...gf(`Note #${i + 1}`)} /></div>
                      <button onClick={() => updateField('notes', formData.notes.filter(x => x.id !== note.id))} className="text-gray-300 hover:text-red-500 mt-3"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="Certificate Details" />
                <TextInput label="Certificate Content" multiline value={formData.certificateContent} onChange={v => updateField('certificateContent', v)} {...gf('Certificate Content')} />

                <SectionHeader title="Urgent Application" />
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1"><TextInput label="Pin Code" value={formData.urgentPinCode} onChange={v => updateField('urgentPinCode', v)} {...gf('Urgent Pin Code')} /></div>
                  <div className="col-span-3"><TextInput label="Grounds for Urgency" multiline value={formData.urgentContent} onChange={v => updateField('urgentContent', v)} {...gf('Grounds for Urgency')} /></div>
                </div>

                <SectionHeader title="Notice of Motion" />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="Addressed To" value={formData.noticeAddressedTo} onChange={v => updateField('noticeAddressedTo', v)} {...gf('Notice Addressed To')} />
                  <TextInput label="Designation" value={formData.noticeDesignation} onChange={v => updateField('noticeDesignation', v)} {...gf('Notice Designation')} />
                  <TextInput label="Organisation" value={formData.noticeOrg} onChange={v => updateField('noticeOrg', v)} {...gf('Notice Organisation')} />
                  <TextInput label="Hearing Date (Est)" value={formData.noticeHearingDate} onChange={v => updateField('noticeHearingDate', v)} {...gf('Notice Hearing Date (Est)')} />
                </div>
                <TextInput label="Petition Through" value={formData.petitionDescription} onChange={v => updateField('petitionDescription', v)} {...gf('Petition Through')} />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="Location" value={formData.location} onChange={v => updateField('location', v)} {...gf('Location')} />
                  <TextInput label="Filing Date" value={formData.filingDate} onChange={v => updateField('filingDate', v)} {...gf('Filing Date')} />
                </div>

                <SectionHeader title="Annexures" />
                <RepeatableBlock title="Annexures" onAdd={() => updateField('annexures', [...formData.annexures, { id: Date.now().toString(), title: '', pageCount: '1', contentText: '', files: [] }])}>
                  {formData.annexures.map((ann, i) => (
                    <div key={ann.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200 mb-4">
                      <button onClick={() => updateField('annexures', formData.annexures.filter(x => x.id !== ann.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3">
                          <TextInput label={`Annexure #${i + 1} Title`} value={ann.title} onChange={v => { const up = [...formData.annexures]; up[i].title = v; updateField('annexures', up); }} {...gf(`Annexure #${i + 1} Title`)} />
                        </div>
                        <div className="col-span-1">
                          <TextInput label="Total Pages" type="number" value={ann.pageCount} onChange={v => { const up = [...formData.annexures]; up[i].pageCount = v; updateField('annexures', up); }} {...gf(`Annexure #${i + 1} Pages`)} />
                        </div>
                      </div>
                      <div className="border-2 border-dashed rounded-xl p-4 text-center text-gray-400 font-bold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Paperclip className="w-4 h-4" /> UPLOAD DOCUMENT
                      </div>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="Miscellaneous Applications" />
                <RepeatableBlock title="Applications" onAdd={() => updateField('applications', [...formData.applications, { id: Date.now().toString(), description: '', showethContent: '', prayerContent: '', useMainAffidavit: true, verificationDate: '' }])}>
                  {formData.applications.map((app, i) => (
                    <div key={app.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200 mb-4">
                      <button onClick={() => updateField('applications', formData.applications.filter(x => x.id !== app.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`App #${i + 1} Description`} value={app.description} onChange={v => { const up = [...formData.applications]; up[i].description = v; updateField('applications', up); }} {...gf(`App #${i + 1} Desc`)} />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <TextInput label="Showeth Content" multiline value={app.showethContent} onChange={v => { const up = [...formData.applications]; up[i].showethContent = v; updateField('applications', up); }} {...gf(`App #${i + 1} Showeth`)} />
                        <TextInput label="Prayer Content" multiline value={app.prayerContent} onChange={v => { const up = [...formData.applications]; up[i].prayerContent = v; updateField('applications', up); }} {...gf(`App #${i + 1} Prayer`)} />
                      </div>
                      <TextInput label="Specific Verification Date (if different)" value={app.verificationDate} onChange={v => { const up = [...formData.applications]; up[i].verificationDate = v; updateField('applications', up); }} {...gf(`App #${i + 1} Verification Date`)} />
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="Court Fee" />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="UIN" value={formData.courtFeeUin} onChange={v => updateField('courtFeeUin', v)} />
                  <TextInput label="Amount (INR)" value={formData.courtFeeAmount} onChange={v => updateField('courtFeeAmount', v)} />
                  <div className="col-span-2 border-2 border-dashed rounded-xl p-8 text-center text-gray-400 font-bold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Paperclip className="w-5 h-5" /> ATTACH COURT FEE COPY
                  </div>
                </div>

                <SectionHeader title="Synopsis & List of Dates" />
                <TextInput label="Synopsis Header" value={formData.synopsisDescription} onChange={v => updateField('synopsisDescription', v)} {...gf('Synopsis Header')} />
                <TextInput label="Preliminary Statement (Optional)" multiline value={formData.preSynopsisContent} onChange={v => updateField('preSynopsisContent', v)} {...gf('Pre-Synopsis')} />
                <TextInput label="Synopsis Content" multiline value={formData.synopsisContent} onChange={v => updateField('synopsisContent', v)} {...gf('Synopsis')} />
                <RepeatableBlock title="List of Dates" onAdd={() => updateField('dateList', [...formData.dateList, { id: Date.now().toString(), dates: [''], event: '' }])}>
                  {formData.dateList.map((d, i) => (
                    <div key={d.id} className="flex gap-2 items-start bg-white p-3 rounded-xl shadow-sm">
                      <div className="w-32"><TextInput label="Date" value={d.dates[0]} onChange={v => { const up = [...formData.dateList]; up[i].dates = [v]; updateField('dateList', up); }} /></div>
                      <div className="flex-1"><TextInput label="Event" value={d.event} onChange={v => { const up = [...formData.dateList]; up[i].event = v; updateField('dateList', up); }} /></div>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="The Writ Petition" />
                <TextInput label="Header / Showeth" multiline value={formData.petitionShoweth} onChange={v => updateField('petitionShoweth', v)} {...gf('Header / Showeth')} />
                <TextInput label="Facts" multiline value={formData.petitionFacts} onChange={v => updateField('petitionFacts', v)} {...gf('Facts')} />
                <TextInput label="Grounds" multiline value={formData.petitionGrounds} onChange={v => updateField('petitionGrounds', v)} {...gf('Grounds')} />
                <TextInput label="Prayers" multiline value={formData.petitionPrayers} onChange={v => updateField('petitionPrayers', v)} {...gf('Prayers')} />

                <SectionHeader title="Letter of Authority" />
                <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-400 font-bold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2 mb-6"
                  onClick={() => updateField('letterOfAuthorityUpload', 'loa.pdf')}>
                  <Paperclip className="w-5 h-5" /> {formData.letterOfAuthorityUpload ? 'LOA_ATTACHED.PDF' : 'UPLOAD LETTER OF AUTHORITY'}
                </div>

                <SectionHeader title="Proof of Service" />
                <RepeatableBlock title="Service Receipts" onAdd={() => updateField('proofOfServiceUploads', [...formData.proofOfServiceUploads, 'receipt.pdf'])}>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.proofOfServiceUploads.map((file, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><FileText className="w-4 h-4" /> {file.toUpperCase()} #{i + 1}</div>
                        <button onClick={() => updateField('proofOfServiceUploads', formData.proofOfServiceUploads.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </RepeatableBlock>

                <SectionHeader title="Affidavit Details" />
                <div className="grid grid-cols-2 gap-4">
                  <SelectInput label="Identity" value={formData.affidavitIdentity} options={[{ label: 'Petitioner', value: 'Petitioner' }, { label: 'Auth Rep', value: 'Authorized Representative' }]} onChange={v => updateField('affidavitIdentity', v)} {...gf('Affidavit Identity')} />
                  <TextInput label="Name" value={formData.affidavitName} onChange={v => updateField('affidavitName', v)} {...gf('Affidavit Name')} />
                  <TextInput label="Age" value={formData.affidavitAge} onChange={v => updateField('affidavitAge', v)} {...gf('Affidavit Age')} />
                  <TextInput label="Verification Date" value={formData.verificationDate} onChange={v => updateField('verificationDate', v)} {...gf('Verification Date')} />
                  <div className="col-span-2"><TextInput label="Address" value={formData.affidavitAddress} onChange={v => updateField('affidavitAddress', v)} {...gf('Affidavit Address')} /></div>
                  <div className="col-span-2"><TextInput label="Present Location" value={formData.affidavitLocation} onChange={v => updateField('affidavitLocation', v)} {...gf('Affidavit Location')} /></div>
                </div>

                <div className="mt-12 bg-blue-600 rounded-3xl p-10 text-white shadow-2xl">
                  <h3 className="text-2xl font-black mb-6">Dispatch Details</h3>
                  <TextInput label="Recipient Email" type="email" value={formData.userEmail} onChange={v => updateField('userEmail', v)} placeholder="advocate@dhc.in" {...gf('Recipient Email')} />
                  <button disabled={isSubmitting} onClick={handleGenerate} className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {isSubmitting ? 'GENERATING...' : <><Send className="w-5 h-5" /> GENERATE & EMAIL PETITION</>}
                  </button>
                </div>

              </div>
            </div>

            <div className={`${activeTab === 'preview' ? 'block' : 'hidden lg:block'} ${isPreviewMaximized ? 'col-span-full' : 'sticky top-24 self-start'} no-print`}>
              <div className={`bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-800 transition-all duration-500 ${isPreviewMaximized ? 'w-full' : ''}`}>
                <div className="bg-gray-800 px-8 py-3 flex justify-between items-center text-white border-b border-gray-700">
                  <div className="flex gap-1.5 items-center">
                    <div className="flex gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span></div>
                    <span className="ml-4 text-[9px] font-black tracking-widest uppercase opacity-40">Live_Preview_V2</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div><span className="text-[9px] font-black tracking-widest uppercase opacity-60">Synced</span></div>
                    <button onClick={() => setIsPreviewMaximized(!isPreviewMaximized)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-white/60 hover:text-white" title={isPreviewMaximized ? "Exit Maximize" : "Maximize"}>
                      {isPreviewMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={handlePrint} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-white/60 hover:text-white"><Printer className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className={`bg-gray-200 overflow-auto h-[calc(100vh-12rem)] relative custom-scrollbar`}>
                  <div className={`flex flex-col items-center p-4 lg:p-8 min-w-full ${isPreviewMaximized ? 'scale-100' : 'scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9]'} origin-top transition-transform duration-300`}>
                    <DocumentPreview
                      data={formData}
                      reviewMode={isReviewMode}
                      annotations={annotations}
                      onAddAnnotation={handleAddAnnotation}
                      onRemoveAnnotation={removeAnnotation}
                    />
                  </div>

                  {isReviewMode && annotations.filter(a => a.pageNum > 0).length > 0 && (
                    <div className={`absolute top-8 right-8 transition-all duration-500 ease-in-out z-[100] no-print ${isSidebarExpanded ? 'w-80' : 'w-14'}`}>
                      {isSidebarExpanded ? (
                        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100 p-6 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-right duration-500">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsSidebarExpanded(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <h4 className="text-sm font-black tracking-widest uppercase text-blue-600 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Feedback ({annotations.filter(a => a.pageNum > 0).length})
                              </h4>
                            </div>
                            <button onClick={exportFeedback} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Export Feedback">
                              <DownloadCloud className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {annotations.filter(a => a.pageNum > 0).map(anno => (
                              <div key={anno.id} className={`p-4 rounded-2xl border transition-all group ${anno.isResolved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-blue-50 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${anno.pageNum === 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                                    {anno.pageNum === 0 ? 'FORM FIELD' : `PAGE ${anno.pageNum}`}
                                  </span>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => editAnnotation(anno.id)} className="text-gray-400 hover:text-blue-600"><Edit className="w-3 h-3" /></button>
                                    <button onClick={() => toggleResolve(anno.id)} className={`text-gray-400 hover:text-green-600 ${anno.isResolved ? 'text-green-600' : ''}`}><CheckCircle2 className="w-3 h-3" /></button>
                                    <button onClick={() => removeAnnotation(anno.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <p className="text-[11px] font-black text-gray-900 leading-none mb-1 flex items-center gap-2">
                                    {anno.author}
                                    {anno.isResolved && <span className="text-[10px] font-medium text-green-600 lowercase bg-green-50 px-1.5 rounded">resolved</span>}
                                  </p>
                                  <p className="text-xs text-gray-600 leading-relaxed italic">"{anno.text}"</p>
                                </div>

                                {anno.replies && anno.replies.length > 0 && (
                                  <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                                    {anno.replies.map(reply => (
                                      <div key={reply.id} className="text-[11px]">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                          <span className="font-black text-gray-900">{reply.author}</span>
                                          <span className="text-[9px] text-gray-400 uppercase font-bold">{reply.timestamp}</span>
                                        </div>
                                        <p className="text-gray-600">"{reply.text}"</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => addReply(anno.id)}
                                  className="mt-3 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-widest"
                                >
                                  <CornerUpRight className="w-3 h-3" /> Reply
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsSidebarExpanded(true)}
                          className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all group relative animate-in zoom-in duration-300"
                        >
                          <ChevronLeft className="w-6 h-6 mr-1" />
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            {annotations.filter(a => a.pageNum > 0).length}
                          </div>
                          <div className="absolute right-full mr-4 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap uppercase tracking-widest">
                            Review Feed
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                  <p className="mt-4 text-[9px] text-gray-400 font-bold uppercase text-center tracking-widest">Collaborative Review Active</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="hidden print:block">
        <DocumentPreview
          data={formData}
          annotations={annotations}
        />
      </div>
    </div>
  );
}
