
import React, { useState, useCallback } from 'react';
import {
  Petitioner,
  Respondent,
  Advocate,
  WritFormData,
  Annexure,
  DateEntry,
  Application,
  NoteEntry
} from './types';
import { TextInput, SectionHeader, RepeatableBlock, SelectInput } from './components/FormFields';
import { DocumentPreview } from './components/DocumentPreview';
import { CheckCircle, FileText, Send, Printer, AlertTriangle, Trash2, Mail, Gavel, Plus, Paperclip } from 'lucide-react';

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
};

export default function App() {
  const [formData, setFormData] = useState<WritFormData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const updateField = useCallback((field: keyof WritFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

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
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">v1.1 | Delhi High Court Compliant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex lg:hidden">
            <button onClick={() => setActiveTab('form')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>FORM</button>
            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>PREVIEW</button>
          </div>
          <button onClick={handlePrint} className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all active:scale-95"><Printer className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1400px]">
        {isSuccess ? (
          <div className="bg-white rounded-[2rem] shadow-2xl p-16 text-center max-w-2xl mx-auto mt-10 no-print">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle className="w-12 h-12" /></div>
            <h2 className="text-3xl font-black mb-4">Petition Dispatched</h2>
            <p className="text-gray-500 mb-10 text-lg">The submission-ready document has been emailed to <b>{formData.userEmail}</b>.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsSuccess(false)} className="px-8 py-4 rounded-xl font-bold bg-gray-100">Back to Editor</button>
              <button onClick={handlePrint} className="px-8 py-4 rounded-xl font-bold bg-blue-600 text-white shadow-xl flex items-center gap-2"><Download className="w-5 h-5" /> Download PDF</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className={`${activeTab === 'form' ? 'block' : 'hidden lg:block'} no-print`}>
              <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12">

                {errors.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
                    <div className="flex items-center gap-2 text-red-900 font-bold mb-2"><AlertTriangle className="w-5 h-5" /> CHECK FAILED</div>
                    <ul className="text-sm text-red-700 space-y-1">{errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
                  </div>
                )}

                <SectionHeader title="Introduction" />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="High Court" value={formData.highCourt} onChange={v => updateField('highCourt', v)} />
                  <TextInput label="Jurisdiction" value={formData.jurisdiction} onChange={v => updateField('jurisdiction', v)} />
                  <SelectInput label="Type" value={formData.petitionType} options={[{ label: 'Civil', value: 'Civil' }, { label: 'Criminal', value: 'Criminal' }]} onChange={v => updateField('petitionType', v)} />
                  <TextInput label="Year" value={formData.year} onChange={v => updateField('year', v)} />
                </div>

                <RepeatableBlock title="Petitioners" onAdd={() => updateField('petitioners', [...formData.petitioners, { id: Date.now().toString(), name: '', addresses: [''], city: '', pin: '', state: '', authRep: '' }])}>
                  {formData.petitioners.map((p, i) => (
                    <div key={p.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200">
                      <button onClick={() => updateField('petitioners', formData.petitioners.filter(x => x.id !== p.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`Petitioner #${i + 1} Name`} value={p.name} onChange={v => { const up = [...formData.petitioners]; up[i].name = v; updateField('petitioners', up); }} />
                      <TextInput label="Authorised Representative (if any)" value={p.authRep} onChange={v => { const up = [...formData.petitioners]; up[i].authRep = v; updateField('petitioners', up); }} />
                      <div className="grid grid-cols-3 gap-2">
                        <TextInput label="City" value={p.city} onChange={v => { const up = [...formData.petitioners]; up[i].city = v; updateField('petitioners', up); }} />
                        <TextInput label="Pin" value={p.pin} onChange={v => { const up = [...formData.petitioners]; up[i].pin = v; updateField('petitioners', up); }} />
                        <TextInput label="State" value={p.state} onChange={v => { const up = [...formData.petitioners]; up[i].state = v; updateField('petitioners', up); }} />
                      </div>
                    </div>
                  ))}
                </RepeatableBlock>

                <RepeatableBlock title="Respondents" onAdd={() => updateField('respondents', [...formData.respondents, { id: Date.now().toString(), name: '', addresses: [''], city: '', pin: '', state: '', email: '', authRep: '' }])}>
                  {formData.respondents.map((r, i) => (
                    <div key={r.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200">
                      <button onClick={() => updateField('respondents', formData.respondents.filter(x => x.id !== r.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`Respondent #${i + 1} Name`} value={r.name} onChange={v => { const up = [...formData.respondents]; up[i].name = v; updateField('respondents', up); }} />
                      <TextInput label="Authorised Representative (if any)" value={r.authRep} onChange={v => { const up = [...formData.respondents]; up[i].authRep = v; updateField('respondents', up); }} />
                      <div className="grid grid-cols-3 gap-2">
                        <TextInput label="City" value={r.city} onChange={v => { const up = [...formData.respondents]; up[i].city = v; updateField('respondents', up); }} />
                        <TextInput label="Pin" value={r.pin} onChange={v => { const up = [...formData.respondents]; up[i].pin = v; updateField('respondents', up); }} />
                        <TextInput label="State" value={r.state} onChange={v => { const up = [...formData.respondents]; up[i].state = v; updateField('respondents', up); }} />
                      </div>
                      <TextInput label="Email (Optional)" type="email" value={r.email} onChange={v => { const up = [...formData.respondents]; up[i].email = v; updateField('respondents', up); }} />
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
                        <TextInput label={`Advocate #${i + 1} Name`} value={adv.name} onChange={v => { const up = [...formData.advocates]; up[i].name = v; updateField('advocates', up); }} />
                        <TextInput label="Enrolment Number" value={adv.enrolmentNumber} onChange={v => { const up = [...formData.advocates]; up[i].enrolmentNumber = v; updateField('advocates', up); }} />

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
                          {adv.phoneNumbers.map((ph, pi) => (
                            <div key={pi} className="flex gap-2 mb-2">
                              <div className="flex-1"><TextInput label={`Phone ${pi + 1}`} value={ph} onChange={v => { const up = [...formData.advocates]; up[i].phoneNumbers[pi] = v; updateField('advocates', up); }} /></div>
                              <button onClick={() => { const up = [...formData.advocates]; up[i].phoneNumbers.splice(pi, 1); updateField('advocates', up); }} className="text-gray-300 hover:text-red-500 mt-6"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => { const up = [...formData.advocates]; up[i].phoneNumbers.push(''); updateField('advocates', up); }} className="text-[10px] font-bold text-blue-600 uppercase">+ Add Phone</button>
                        </div>

                        <div className="col-span-2">
                          <TextInput label="Email" value={adv.email} onChange={v => { const up = [...formData.advocates]; up[i].email = v; updateField('advocates', up); }} />
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
                      <div className="flex-1"><TextInput label="Note Content" value={note.text} onChange={v => { const up = [...formData.notes]; up[i].text = v; updateField('notes', up); }} /></div>
                      <button onClick={() => updateField('notes', formData.notes.filter(x => x.id !== note.id))} className="text-gray-300 hover:text-red-500 mt-3"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="Certificate Details" />
                <TextInput label="Certificate Content" multiline value={formData.certificateContent} onChange={v => updateField('certificateContent', v)} />

                <SectionHeader title="Urgent Application" />
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1"><TextInput label="Pin Code" value={formData.urgentPinCode} onChange={v => updateField('urgentPinCode', v)} /></div>
                  <div className="col-span-3"><TextInput label="Grounds for Urgency" multiline value={formData.urgentContent} onChange={v => updateField('urgentContent', v)} /></div>
                </div>

                <SectionHeader title="Notice of Motion" />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="Addressed To" value={formData.noticeAddressedTo} onChange={v => updateField('noticeAddressedTo', v)} />
                  <TextInput label="Designation" value={formData.noticeDesignation} onChange={v => updateField('noticeDesignation', v)} />
                  <TextInput label="Organisation" value={formData.noticeOrg} onChange={v => updateField('noticeOrg', v)} />
                  <TextInput label="Hearing Date (Est)" value={formData.noticeHearingDate} onChange={v => updateField('noticeHearingDate', v)} />
                </div>

                <SectionHeader title="Annexures" />
                <RepeatableBlock title="Annexures" onAdd={() => updateField('annexures', [...formData.annexures, { id: Date.now().toString(), title: '', contentText: '', files: [] }])}>
                  {formData.annexures.map((ann, i) => (
                    <div key={ann.id} className="bg-gray-50 p-6 rounded-2xl relative border border-gray-200 mb-4">
                      <button onClick={() => updateField('annexures', formData.annexures.filter(x => x.id !== ann.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <TextInput label={`Annexure #${i + 1} Title`} value={ann.title} onChange={v => { const up = [...formData.annexures]; up[i].title = v; updateField('annexures', up); }} />
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
                      <TextInput label={`Application #${i + 1} Title / Purpose`} value={app.description} onChange={v => { const up = [...formData.applications]; up[i].description = v; updateField('applications', up); }} />
                      <TextInput label="Showeth Content" multiline value={app.showethContent} onChange={v => { const up = [...formData.applications]; up[i].showethContent = v; updateField('applications', up); }} />
                      <TextInput label="Prayer Content" multiline value={app.prayerContent} onChange={v => { const up = [...formData.applications]; up[i].prayerContent = v; updateField('applications', up); }} />
                      <TextInput label="Specific Verification Date (if different)" value={app.verificationDate} onChange={v => { const up = [...formData.applications]; up[i].verificationDate = v; updateField('applications', up); }} />
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
                <TextInput label="Synopsis" multiline value={formData.synopsisContent} onChange={v => updateField('synopsisContent', v)} />
                <RepeatableBlock title="List of Dates" onAdd={() => updateField('dateList', [...formData.dateList, { id: Date.now().toString(), dates: [''], event: '' }])}>
                  {formData.dateList.map((d, i) => (
                    <div key={d.id} className="flex gap-2 items-start bg-white p-3 rounded-xl shadow-sm">
                      <div className="w-32"><TextInput label="Date" value={d.dates[0]} onChange={v => { const up = [...formData.dateList]; up[i].dates = [v]; updateField('dateList', up); }} /></div>
                      <div className="flex-1"><TextInput label="Event" value={d.event} onChange={v => { const up = [...formData.dateList]; up[i].event = v; updateField('dateList', up); }} /></div>
                    </div>
                  ))}
                </RepeatableBlock>

                <SectionHeader title="The Writ Petition" />
                <TextInput label="Header / Showeth" multiline value={formData.petitionShoweth} onChange={v => updateField('petitionShoweth', v)} />
                <TextInput label="Facts" multiline value={formData.petitionFacts} onChange={v => updateField('petitionFacts', v)} />
                <TextInput label="Grounds" multiline value={formData.petitionGrounds} onChange={v => updateField('petitionGrounds', v)} />
                <TextInput label="Prayers" multiline value={formData.petitionPrayers} onChange={v => updateField('petitionPrayers', v)} />

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
                  <SelectInput label="Identity" value={formData.affidavitIdentity} options={[{ label: 'Petitioner', value: 'Petitioner' }, { label: 'Auth Rep', value: 'Authorized Representative' }]} onChange={v => updateField('affidavitIdentity', v)} />
                  <TextInput label="Name" value={formData.affidavitName} onChange={v => updateField('affidavitName', v)} />
                  <TextInput label="Age" value={formData.affidavitAge} onChange={v => updateField('affidavitAge', v)} />
                  <TextInput label="Verification Date" value={formData.verificationDate} onChange={v => updateField('verificationDate', v)} />
                  <div className="col-span-2"><TextInput label="Address" value={formData.affidavitAddress} onChange={v => updateField('affidavitAddress', v)} /></div>
                  <div className="col-span-2"><TextInput label="Present Location" value={formData.affidavitLocation} onChange={v => updateField('affidavitLocation', v)} /></div>
                </div>

                <div className="mt-12 bg-blue-600 rounded-3xl p-10 text-white shadow-2xl">
                  <h3 className="text-2xl font-black mb-6">Dispatch Details</h3>
                  <TextInput label="Recipient Email" type="email" value={formData.userEmail} onChange={v => updateField('userEmail', v)} placeholder="advocate@dhc.in" />
                  <button disabled={isSubmitting} onClick={handleGenerate} className="w-full bg-white text-blue-600 font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {isSubmitting ? 'GENERATING...' : <><Send className="w-5 h-5" /> GENERATE & EMAIL PETITION</>}
                  </button>
                </div>

              </div>
            </div>

            <div className={`${activeTab === 'preview' ? 'block' : 'hidden lg:block'} sticky top-24 self-start no-print`}>
              <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-800">
                <div className="bg-gray-800 px-8 py-3 flex justify-between items-center text-white border-b border-gray-700">
                  <div className="flex gap-1.5 items-center">
                    <div className="flex gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span></div>
                    <span className="ml-4 text-[9px] font-black tracking-widest uppercase opacity-40">Live_Preview_V2</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div><span className="text-[9px] font-black tracking-widest uppercase opacity-60">Synced</span></div>
                    <button onClick={handlePrint} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-white/60 hover:text-white"><Printer className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="bg-gray-200 overflow-auto h-[calc(100vh-12rem)] flex justify-center p-4 lg:p-8">
                  <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] origin-top transition-transform duration-300">
                    <DocumentPreview data={formData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="hidden print:block"><DocumentPreview data={formData} /></div>
    </div>
  );
}

function Download(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
