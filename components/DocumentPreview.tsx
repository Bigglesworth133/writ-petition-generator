import React, { useMemo } from 'react';
import { Annotation, WritFormData } from '../types';
import { FORMATTING, HIGH_COURT_DEFAULT, JURISDICTION_DEFAULT, getAnnexureTitle } from '../constants';
import { Trash2 } from 'lucide-react';

interface PreviewProps {
  data: WritFormData;
  reviewMode?: boolean;
  annotations?: Annotation[];
  onAddAnnotation?: (anno: Annotation) => void;
  onRemoveAnnotation?: (id: string) => void;
}

export const DocumentPreview: React.FC<PreviewProps> = ({
  data,
  reviewMode = false,
  annotations = [],
  onAddAnnotation,
  onRemoveAnnotation
}) => {
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {
    if (!reviewMode || !onAddAnnotation) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const author = prompt("Enter your name:", "Advocate Partner") || "Anonymous";
    const text = prompt("Enter your comment/suggestion:");

    if (text) {
      onAddAnnotation({
        id: Math.random().toString(36).substr(2, 9),
        elementId: `page-${pageNum}`,
        text,
        author,
        x,
        y,
        pageNum
      });
    }
  };

  const Page = ({ children, className = "", pageNum, actualPageNum, key }: { children: React.ReactNode, className?: string, pageNum?: number | string, actualPageNum: number, key?: React.Key }) => (
    <div
      onClick={(e) => handlePageClick(e, actualPageNum)}
      key={key}
      className={`bg-white shadow-lg mx-auto mb-10 print:mb-0 print:shadow-none print:break-after-page relative ${className} ${reviewMode ? 'cursor-crosshair hover:ring-2 hover:ring-blue-400 transition-all' : ''}`}
      style={{ width: '210mm', minHeight: '297mm', padding: `${FORMATTING.MARGINS.TOP} ${FORMATTING.MARGINS.RIGHT} ${FORMATTING.MARGINS.BOTTOM} ${FORMATTING.MARGINS.LEFT}` }}>
      <div className="times-new-roman text-justify" style={{ fontSize: '14pt', lineHeight: '1.5', color: 'black' }}>
        {children}
      </div>
      <PageNumber num={pageNum} />
      {/* Annotation Pins */}
      {annotations.filter(a => a.pageNum === actualPageNum).map(anno => (
        <div
          key={anno.id}
          className="absolute z-50 group"
          style={{ left: `${anno.x}%`, top: `${anno.y}%` }}
        >
          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg -translate-x-1/2 -translate-y-1/2 animate-bounce cursor-help group-hover:scale-125 transition-transform border-2 border-white">
            !
          </div>
          <div className="absolute left-8 top-0 w-56 bg-white p-3 rounded-xl shadow-2xl border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{anno.author}</span>
              {onRemoveAnnotation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAnnotation(anno.id);
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-800 leading-relaxed font-medium">"{anno.text}"</p>
          </div>
        </div>
      ))}
    </div>
  );
  // Auto-indexing logic with dynamic page length estimation
  const indexItems = useMemo(() => {
    let p = 1; // Start at Page 1 (Index)
    const items = [];

    // 1. Listing Proforma (if enabled, it comes before Index)
    if (data.includeListingProforma) {
      items.push({ title: 'LISTING PROFORMA', p: 'A-1' }); // Usually A-series or Roman
    }

    // 2. Index (Always Page 1)
    items.push({ title: 'INDEX', p: p++ });

    // 3. Urgent Application
    items.push({ title: 'URGENT APPLICATION', p: p++ });

    // 4. Certificate
    if (data.includeCertificate) {
      items.push({ title: 'CERTIFICATE', p: p++ });
    }

    // 5. Notice of Motion
    items.push({ title: 'NOTICE OF MOTION', p: p++ });

    // 6. Court Fees
    items.push({ title: 'COURT FEES', p: p++ });

    // 7. Memo of Parties
    items.push({ title: 'MEMO OF PARTIES', p: p++ });

    // 8. Synopsis and List of Dates
    const contentChars = (data.preSynopsisContent?.length || 0) + (data.synopsisContent?.length || 0);
    const contentPages = Math.max(1, Math.ceil(contentChars / 3200));
    const listPages = Math.max(1, Math.ceil(data.dateList.length / 15));
    const synopsisPages = contentPages + listPages;
    items.push({ title: 'SYNOPSIS AND LIST OF DATES', p: synopsisPages > 1 ? `${p}-${p + synopsisPages - 1}` : p });
    p += synopsisPages;

    // 9. Writ Petition
    const factsPages = Math.max(1, Math.ceil((data.petitionFacts?.length || 0) / 3200));
    const groundsPages = Math.max(1, Math.ceil(data.petitionGrounds.split('\n').filter(g => g.trim()).length / 4));
    const petitionPages = factsPages + groundsPages + 1;
    items.push({ title: 'WRIT PETITION', p: `${p}-${p + petitionPages - 1}` });
    p += petitionPages;

    // 10. Affidavit
    items.push({ title: 'AFFIDAVIT', p: p++ });

    // 11. Annexures
    data.annexures.forEach((ann, idx) => {
      const pageCount = parseInt(ann.pageCount || '1', 10);
      const pageStr = pageCount > 1 ? `${p}-${p + pageCount - 1}` : p;
      items.push({ title: `ANNEXURE ${getAnnexureTitle(idx)}: A TRUE COPY OF ${ann.title}`, p: pageStr });
      p += pageCount;
    });

    // 12. Applications
    data.applications.forEach((app) => {
      const appPages = 2; // Application + Affidavit
      items.push({ title: `MISC. APPL.: ${app.description}`, p: `${p}-${p + appPages - 1}` });
      p += appPages;
    });

    // 13. Letter of Authority
    if (data.letterOfAuthorityUpload) {
      items.push({ title: 'LETTER OF AUTHORITY', p: p++ });
    }

    // 14. Vakalatnama
    items.push({ title: 'VAKALATNAMA', p: p++ });

    // 15. Proof of Service
    if (data.proofOfServiceUploads.length > 0) items.push({ title: 'PROOF OF SERVICE', p: p++ });

    return items;
  }, [data.annexures, data.applications, data.proofOfServiceUploads, data.letterOfAuthorityUpload, data.year, data.synopsisContent, data.preSynopsisContent, data.petitionFacts, data.petitionGrounds, data.dateList, data.includeListingProforma, data.includeCertificate]);


  const getGroundsAlpha = (index: number) => {
    let result = '';
    let i = index;
    while (i >= 0) {
      result = String.fromCharCode((i % 26) + 65) + result;
      i = Math.floor(i / 26) - 1;
    }
    return result;
  };

  const getCauseTitle = () => {
    const pCount = data.petitioners.length;
    const rCount = data.respondents.length;

    // Petitioner side
    let pText = (data.petitioners[0]?.name || "________________").toUpperCase();
    if (data.petitioners[0]?.authRep) pText += ` (THROUGH ${data.petitioners[0].authRep.toUpperCase()})`;
    if (pCount === 2) pText += " & ANR.";
    else if (pCount > 2) pText += " & ORS.";

    // Respondent side
    let rText = (data.respondents[0]?.name || "________________").toUpperCase();
    if (data.respondents[0]?.authRep) rText += ` (THROUGH ${data.respondents[0].authRep.toUpperCase()})`;
    if (rCount === 2) rText += " & ANR.";
    else if (rCount > 2) rText += " & ORS.";

    return { pText, rText };
  };

  const getWpShorthand = () => {
    return data.petitionType === 'Civil' ? 'W.P.(C)' : 'W.P.(CRL)';
  };

  const PageNumber = ({ num }: { num?: string | number }) => {
    if (num === undefined) return null;
    return (
      <div className="absolute top-8 right-12 text-right font-bold text-[12pt] no-print-pagination">
        {num}
      </div>
    );
  };

  const Header = () => (
    <div className="text-center font-bold mb-10 uppercase">
      <p>{data.highCourt || HIGH_COURT_DEFAULT}</p>
      <p>{data.jurisdiction || JURISDICTION_DEFAULT}</p>
      <div className="my-4">
        <p>{getWpShorthand()} NO. _______ OF {data.year}</p>
        {data.petitionType === 'Criminal' && <p>AND<br />CRL.M.A. NO. ______ OF {data.year}</p>}
      </div>
      <div className="mb-4 text-sm">
        <p className="mb-4 font-normal">IN THE MATTER OF:</p>
        <div className="space-y-6">
          <div className="px-10 flex justify-between items-end">
            <div className="flex-1 text-center">
              <p className="font-black text-base">{getCauseTitle().pText}</p>
            </div>
            <div className="italic text-xs font-bold w-32 text-right ml-4 whitespace-nowrap">... PETITIONER(S)</div>
          </div>

          <div className="font-normal italic text-sm lowercase">Versus</div>

          <div className="px-10 flex justify-between items-end">
            <div className="flex-1 text-center">
              <p className="font-black text-base">{getCauseTitle().rText}</p>
            </div>
            <div className="italic text-xs font-bold w-32 text-right ml-4 whitespace-nowrap">... RESPONDENT(S)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const Signature = () => (
    <div className="mt-12 relative h-40">
      <div className="absolute left-0 bottom-0 font-bold uppercase text-xs">
        {data.location}, {data.filingDate}
      </div>
      <div className="absolute right-0 top-0 flex flex-col items-end text-right font-bold text-xs uppercase">
        <div className="w-64 border-t border-black mb-1"></div>
        <p>PETITIONER(S)</p>
        <p>THROUGH</p>
        {data.advocates.map((adv) => (
          <div key={adv.id} className="mt-2 text-[10pt]">
            <p>({adv.name || "ADVOCATE"})</p>
            <p className="font-normal normal-case">Advocate for Petitioner(s)</p>
            <p className="font-normal normal-case">Enrolment No: {adv.enrolmentNumber}</p>
            {adv.addresses[0] && <p className="font-normal normal-case w-64">{adv.addresses[0]}</p>}
            {adv.phoneNumbers[0] && <p className="font-normal normal-case">M: {adv.phoneNumbers[0]}</p>}
            {adv.email && <p className="font-normal normal-case">Email: {adv.email}</p>}
          </div>
        ))}
      </div>
      <div className="clearfix"></div>
    </div>
  );

  const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </>
    );
  };

  let p = 0;
  let ap = 0;

  // Helper to sync pagination for long sections
  const renderPagination = (estimatedPages: number) => {
    const start = p + 1;
    const end = p + estimatedPages;
    p += estimatedPages;
    ap++; // Only 1 DOM page
    return start;
  };

  return (
    <div className="flex flex-col items-center gap-12 pb-20" id="document-preview">
      {/* 0. LISTING PROFORMA (Conditional) */}
      {data.includeListingProforma && (
        <Page pageNum="A-1" actualPageNum={++ap}>
          <div className="text-center font-bold underline mb-10 uppercase text-lg">Listing Proforma</div>
          <table className="w-full border-collapse border border-black text-sm uppercase text-justify">
            <tbody>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold w-1/3">1. COURT</td>
                <td className="border border-black p-4">{data.highCourt || HIGH_COURT_DEFAULT}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">2. CASE NUMBER</td>
                <td className="border border-black p-4">{getWpShorthand()} NO. _______ OF {data.year}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">3. PETITIONER(S)</td>
                <td className="border border-black p-4">{getCauseTitle().pText}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">4. RESPONDENT(S)</td>
                <td className="border border-black p-4">{getCauseTitle().rText}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">5. DATE OF FILING</td>
                <td className="border border-black p-4 underline">{data.filingDate}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">6. JURISDICTION</td>
                <td className="border border-black p-4">{data.jurisdiction || JURISDICTION_DEFAULT}</td>
              </tr>
              <tr className="border border-black">
                <td className="border border-black p-4 font-bold">7. COURT FEE PAID</td>
                <td className="border border-black p-4">RS. {data.courtFeeAmount} /-</td>
              </tr>
            </tbody>
          </table>
          <Signature />
        </Page>
      )}

      {/* 1. INDEX */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 mt-10 uppercase text-xl">Index</div>
        <table className="w-full border-collapse border border-black text-sm uppercase">
          <thead>
            <tr className="border border-black bg-gray-50">
              <th className="border border-black p-2 font-bold w-16 text-center">S.NO</th>
              <th className="border border-black p-2 font-bold text-left">DESCRIPTION</th>
              <th className="border border-black p-2 font-bold w-32 text-center">PAGENO</th>
            </tr>
          </thead>
          <tbody>
            {indexItems.map((item, idx) => (
              <tr key={idx} className="border border-black">
                <td className="border border-black p-2 text-center">{idx + 1}</td>
                <td className="border border-black p-2 uppercase">{item.title}</td>
                <td className="border border-black p-2 text-center">{item.p}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.notes && data.notes.length > 0 && (
          <div className="mt-8 text-sm">
            <div className="font-bold underline mb-2 uppercase">Notes:</div>
            <ol className="list-decimal ml-6 space-y-2">
              {data.notes.map((note) => (
                <li key={note.id} className="text-justify"><FormattedText text={note.text} /></li>
              ))}
            </ol>
          </div>
        )}

        <Signature />
      </Page>

      {/* 2. URGENT APPLICATION */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase text-xl">Urgent Application</div>
        <p className="mb-4">To,</p>
        <p className="mb-4 font-bold uppercase">The Registrar,<br />{data.highCourt || HIGH_COURT_DEFAULT},<br />{data.location || "NEW DELHI"} - {data.urgentPinCode}</p>
        <p className="mb-10 font-bold italic">Sub: Application for urgent listing of the captioned writ petition.</p>
        <div className="whitespace-pre-wrap mb-10 text-justify leading-relaxed">
          <FormattedText text={data.urgentContent} />
        </div>
        <Signature />
      </Page>

      {/* 2A. CERTIFICATE (Conditional) */}
      {data.includeCertificate && (
        <Page pageNum={++p} actualPageNum={++ap}>
          <Header />
          <div className="text-center font-bold underline mb-10 uppercase text-xl">Certificate</div>
          <p className="whitespace-pre-wrap text-justify leading-relaxed">
            <FormattedText text={data.certificateContent} />
          </p>
          <Signature />
        </Page>
      )}

      {/* 3. NOTICE OF MOTION */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase">Notice of Motion</div>
        <p className="mb-4">To,</p>
        <p className="mb-10">
          {data.noticeAddressedTo && <span>{data.noticeAddressedTo}<br /></span>}
          {data.noticeDesignation && <span>{data.noticeDesignation}<br /></span>}
          {data.noticeOrg && <span>{data.noticeOrg}<br /></span>}
          {data.noticeOffice && <span>{data.noticeOffice}<br /></span>}
          {data.noticeLocation || data.noticeOrg}
        </p>
        <p className="mb-10">Sir/Madam,</p>
        <p className="mb-10">Please take notice that the accompanying Writ Petition is likely to be listed before the Hon'ble Court on <span className="font-bold underline">{data.noticeHearingDate || "Next Hearing Date"}</span> or any other date the Hon'ble Court may deem fit.</p>
        <Signature />
      </Page>

      {/* 4. COURT FEES (New) */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase text-lg">Court Fees</div>
        <div className="border-2 border-dashed border-gray-300 h-[400px] flex items-center justify-center text-gray-400 font-bold italic mb-10 overflow-hidden">
          {data.courtFeeAttachment ? (
            <img src={data.courtFeeAttachment} className="w-full h-full object-contain" alt="Court Fee" />
          ) : (
            <span>[COURT FEE CERTIFICATE / E-RECEIPT TO BE ATTACHED HERE]</span>
          )}
        </div>
        <table className="w-full border-collapse border border-black text-sm uppercase">
          <tbody>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold w-1/3">Amount Paid</td>
              <td className="border border-black p-4">RS. {data.courtFeeAmount} /-</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">UIN/Reference No.</td>
              <td className="border border-black p-4">{data.courtFeeUin || "____________________"}</td>
            </tr>
          </tbody>
        </table>
        <Signature />
      </Page>

      {/* 3A. MEMO OF PARTIES */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase text-lg">Memo of Parties</div>

        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              {data.petitioners.map((pet, i) => (
                <div key={pet.id} className="mb-6">
                  <p className="font-bold">{i + 1}. {pet.name.toUpperCase()}</p>
                  {pet.authRep && <p className="italic text-sm">Through its Authorised Representative {pet.authRep}</p>}
                  {pet.addresses.map((addr, ai) => <p key={ai} className="pl-6">{addr}</p>)}
                  <p className="pl-6 uppercase">{pet.city} - {pet.pin}, {pet.state}</p>
                </div>
              ))}
            </div>
            <div className="w-40 text-right font-bold italic mb-6">...PETITIONER(S)</div>
          </div>

          <div className="text-center font-bold italic py-4">VERSUS</div>

          <div className="flex justify-between items-end">
            <div className="flex-1">
              {data.respondents.map((r, i) => (
                <div key={r.id} className="mb-6">
                  <p className="font-bold">{i + 1}. {r.name.toUpperCase()}</p>
                  {r.authRep && <p className="italic text-sm">Through its Authorised Representative {r.authRep}</p>}
                  {r.addresses.map((addr, ai) => <p key={ai} className="pl-6">{addr}</p>)}
                  <p className="pl-6 uppercase">{r.city} - {r.pin}, {r.state}</p>
                  {r.email && <p className="pl-6 text-sm">Email: {r.email}</p>}
                </div>
              ))}
            </div>
            <div className="w-40 text-right font-bold italic mb-6">...RESPONDENT(S)</div>
          </div>
        </div>

        <Signature />
      </Page>

      {/* 4. SYNOPSIS & DATES */}
      {(() => {
        const contentChars = (data.preSynopsisContent?.length || 0) + (data.synopsisContent?.length || 0);
        const contentPages = Math.max(1, Math.ceil(contentChars / 3200));
        const listPages = Math.max(1, Math.ceil(data.dateList.length / 15));
        const synopsisPages = contentPages + listPages;
        const pageLabel = renderPagination(synopsisPages);

        return (
          <Page pageNum={pageLabel} actualPageNum={ap}>
            <Header />
            <div className="uppercase font-bold underline mb-4 text-center">
              {data.synopsisDescription}
            </div>
            <div className="text-center font-bold underline mb-6 uppercase">Synopsis</div>

            {data.preSynopsisContent && (
              <div className="whitespace-pre-wrap mb-10 text-justify">
                {data.preSynopsisContent}
              </div>
            )}

            <div className="whitespace-pre-wrap mb-10 text-justify">
              <FormattedText text={data.synopsisContent} />
            </div>
            <div className="text-center font-bold underline mb-6 uppercase">List of Dates</div>
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="border border-black font-bold">
                  <th className="border border-black p-2 text-left w-32">DATE</th>
                  <th className="border border-black p-2 text-left">EVENTS</th>
                </tr>
              </thead>
              <tbody>
                {data.dateList.map((d, i) => (
                  <tr key={i} className="border border-black">
                    <td className="border border-black p-2 align-top">{d.dates.join(", ")}</td>
                    <td className="border border-black p-2"><FormattedText text={d.event} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Signature />
          </Page>
        );
      })()}

      {/* 5. MAIN PETITION */}
      {(() => {
        const factsPages = Math.max(1, Math.ceil((data.petitionFacts?.length || 0) / 3200));
        const groundsPages = Math.max(1, Math.ceil(data.petitionGrounds.split('\n').filter(g => g.trim()).length / 4));
        const petitionPages = factsPages + groundsPages + 1;
        const pageLabel = renderPagination(petitionPages);

        return (
          <Page pageNum={pageLabel} actualPageNum={ap}>
            <Header />
            <div className="text-center font-bold mb-8 text-xl px-10">
              {data.petitionDescriptionMain || `WRIT PETITION UNDER ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA SEEKING THE ISSUANCE OF A WRIT, ORDER OR DIRECTION IN THE NATURE OF CERTIORARI, MANDAMUS OR ANY OTHER APPROPRIATE WRIT...`}
            </div>
            <div className="font-bold mb-6">MOST RESPECTFULLY SHOWETH:</div>
            <div className="whitespace-pre-wrap mb-10">
              <p className="mb-4">1. The present Writ Petition is being filed by the Petitioner seeking the kind indulgence of this Hon'ble Court under Article 226/227 of the Constitution of India.</p>
              {data.petitionShoweth}
            </div>

            <div className="font-bold underline mb-4 uppercase">Facts:</div>
            <div className="whitespace-pre-wrap mb-10 text-justify"><FormattedText text={data.petitionFacts} /></div>

            {/* Truncated for preview... */}
            <div className="font-bold underline mb-4 uppercase">Grounds:</div>
            <div className="space-y-6 mb-10">
              {data.petitionGrounds.split('\n').filter(g => g.trim()).map((ground, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-bold">GROUND {getGroundsAlpha(idx)}:</span>
                  <div className="flex-1">
                    <FormattedText text={ground} />
                  </div>
                </div>
              ))}
            </div>

            <div className="font-bold underline mb-6 uppercase">Prayer:</div>
            <div className="mb-6">
              IN THE LIGHT OF THE FACTS AND CIRCUMSTANCES STATED HEREIN ABOVE...
            </div>
            <div className="space-y-4 mb-10">
              <div className="flex gap-4 pl-10">
                <span>(a)</span>
                <div className="flex-1"><FormattedText text={data.petitionPrayers || "Issue an appropriate writ..."} /></div>
              </div>
            </div>
            <Signature />
          </Page>
        );
      })()}

      {/* 6. AFFIDAVIT */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase text-lg">Affidavit</div>
        <p className="mb-6 leading-relaxed">
          I, <span className="font-bold underline">{data.affidavitName || "________________"}</span>,
          aged about <span className="font-bold underline">{data.affidavitAge || "____"}</span> years,
          s/o d/o w/o <span className="font-bold underline">________________</span>,
          resident of <span className="font-bold underline">{data.affidavitAddress || "________________"}</span>,
          presently at <span className="font-bold underline">{data.affidavitLocation || "New Delhi"}</span>,
          do hereby solemnly affirm and declare as under:
        </p>
        <ol className="list-decimal ml-10 space-y-6 leading-relaxed text-justify">
          <li>
            That I am the {data.affidavitIdentity === 'Petitioner' ? 'Petitioner' : 'Authorised Representative of the Petitioner'} in the above-mentioned Writ Petition
            and as such, I am well conversant with the facts and circumstances of the case and am competent to depose this affidavit.
          </li>
          <li>
            That the accompanying Writ Petition and the applications filed along with it have been drafted by my counsel under my instructions.
            I have read and understood the contents thereof and state that the same are true and correct to my knowledge and based on records of the case.
          </li>
          <li>
            That the Annexures filed along with the Writ Petition are true copies of their respective originals.
          </li>
        </ol>
        <div className="mt-20 text-right font-bold uppercase">Deponent</div>

        <div className="mt-20 border-t border-black pt-10">
          <div className="text-center font-bold underline mb-6 uppercase">Verification</div>
          <p className="leading-relaxed text-justify">
            Verified at <span className="font-bold uppercase">{data.affidavitLocation}</span> on this <span className="font-bold underline">{data.verificationDate || '____ day of ______ 2025'}</span> that the contents of the above affidavit are true and correct to my knowledge, no part of it is false and nothing material has been concealed therefrom.
          </p>
          <div className="mt-10 text-right font-bold uppercase">Deponent</div>
        </div>
      </Page>

      {/* 7. ANNEXURES */}
      {/* 7. ANNEXURES */}
      <div id="annexure-section">
        {data.annexures.map((ann, idx) => {
          const pageCount = parseInt(ann.pageCount || '1', 10);
          const pageLabel = renderPagination(pageCount);

          return (
            <Page key={ann.id} pageNum={pageLabel} actualPageNum={ap}>
              <div className="flex justify-between font-bold mb-10 uppercase">
                <span>Annexure {getAnnexureTitle(idx)}</span>
              </div>
              <div className="text-center font-bold underline mb-20 uppercase text-lg">
                A TRUE COPY OF {ann.title}
              </div>
              <div className="border-2 border-dashed border-gray-300 h-[500px] flex items-center justify-center text-gray-400 font-bold italic">
                [DOCUMENT: {ann.title} - {pageCount} PAGES]
              </div>
              <Signature />
            </Page>
          );
        })}
      </div>

      {/* 8. APPLICATIONS */}
      {data.applications.map((app) => (
        <React.Fragment key={app.id}>
          <Page pageNum={++p} actualPageNum={++ap}>
            <Header />
            <div className="text-center font-bold mb-8 text-xl px-10 uppercase">
              IN THE MATTER OF:<br />
              MISC. APPL. NO. ______ OF {data.year}<br />
              IN<br />
              {getWpShorthand()} NO. _______ OF {data.year}
            </div>
            <div className="text-center font-bold underline mb-10 uppercase text-lg">
              APPLICATION UNDER SECTION 151 OF CPC FOR {app.description.toUpperCase()}
            </div>
            <div className="whitespace-pre-wrap mb-10"><FormattedText text={app.showethContent} /></div>
            <div className="font-bold underline mb-6 uppercase">Prayer:</div>
            <div className="whitespace-pre-wrap mb-10"><FormattedText text={app.prayerContent} /></div>
            <Signature />
          </Page>

          {/* Application Affidavit */}
          <Page pageNum={++p} actualPageNum={++ap}>
            <Header />
            <div className="text-center font-bold underline mb-10 uppercase text-lg">Affidavit</div>
            <p className="mb-6 leading-relaxed">
              I, <span className="font-bold underline">{data.affidavitName}</span>, aged about <span className="font-bold underline">{data.affidavitAge}</span> years,
              resident of <span className="font-bold underline">{data.affidavitAddress}</span>, presently at <span className="font-bold underline">{data.affidavitLocation}</span>,
              do hereby solemnly affirm and declare as under:
            </p>
            <ol className="list-decimal ml-10 space-y-4 leading-relaxed">
              <li>That I am the deponent herein and am well conversant with the facts of the case.</li>
              <li>That the accompanying application has been drafted under my instructions and the contents are true and correct.</li>
            </ol>
            <div className="mt-20 text-right font-bold uppercase">Deponent</div>
            <div className="mt-20 border-t border-black pt-10">
              <div className="text-center font-bold underline mb-6 uppercase text-sm">Verification</div>
              <p>Verified at <span className="font-bold uppercase">{data.affidavitLocation}</span> on <span className="font-bold">{app.verificationDate || data.verificationDate}</span> that the contents of the above affidavit are true and correct.</p>
              <div className="mt-10 text-right font-bold uppercase">Deponent</div>
            </div>
          </Page>
        </React.Fragment>
      ))}
      {/* 9. LETTER OF AUTHORITY */}
      {data.letterOfAuthorityUpload && (
        <Page pageNum={++p} actualPageNum={++ap}>
          <Header />
          <div className="text-center font-bold underline mb-20 uppercase text-lg">Letter of Authority</div>
          <div className="border-2 border-dashed border-gray-300 h-[600px] flex items-center justify-center text-gray-400 font-bold italic overflow-hidden">
            {data.letterOfAuthorityUpload?.startsWith('data:') ? (
              <img src={data.letterOfAuthorityUpload} className="w-full h-full object-contain" alt="LOA" />
            ) : (
              <span>[ATTACHED LETTER OF AUTHORITY]</span>
            )}
          </div>
          <Signature />
        </Page>
      )}

      {/* 10. VAKALATNAMA */}
      <Page pageNum={++p} actualPageNum={++ap}>
        <Header />
        <div className="text-center font-bold underline mb-6 uppercase text-lg">Vakalatnama</div>

        <div className="border border-black p-3 mb-4 text-xs font-bold uppercase bg-gray-50">
          <p>CASE: {getCauseTitle().pText} VS {getCauseTitle().rText}</p>
          <p>{getWpShorthand()} NO. _______ OF {data.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="border border-black p-6 h-40 flex flex-col justify-between">
            <p className="font-bold underline text-center uppercase text-[10px]">Advocate(s) Signature</p>
            <div>
              {data.advocates.map(adv => (
                <p key={adv.id} className="text-[10px] font-bold uppercase leading-none">{adv.name}</p>
              ))}
            </div>
          </div>
          <div className="border border-black p-6 h-40 flex flex-col justify-between italic text-[10px]">
            <p className="font-bold underline text-center uppercase not-italic">Petitioner(s) Signature</p>
            <p className="text-right mt-auto font-bold uppercase">Petitioner(s)</p>
          </div>
        </div>
        <div className="mt-4 p-4 border border-black text-[9pt] text-justify space-y-2 leading-tight opacity-90">
          <p>
            I/We, the Petitioner(s) in the above-mentioned Case, do hereby appoint and retain the Advocate(s) named above to appear, plead and act for me/us in the above-mentioned Case and in connection therewith, to deposit, receive and take back any and all such monies as may be deposited, received or taken back by me/us and also to file such documents, to make such statements, and to take all such proceedings as may be necessary in the said case at all stages.
          </p>
          <p>
            I/We also authorize the said Advocate(s) to appoint and retain any other Advocate/Counsel or to delegate the above powers to any other Advocate/Counsel to act on my/our behalf as and when necessary.
          </p>
          <p>
            And I/We hereby agree that everything done by the said Advocate(s) or any of them in connection with the said case shall be binding on me/us as if done by me/us in person.
          </p>
        </div>

        <div className="mt-8 flex justify-between items-end text-[10px] font-bold uppercase">
          <div>{data.location}, {data.filingDate}</div>
          <div className="text-right">
            <div className="w-48 border-t border-black mb-1"></div>
            <p>Signature of Petitioner(s)</p>
          </div>
        </div>
      </Page>

      {/* 11. PROOF OF SERVICE */}
      {data.proofOfServiceUploads.length > 0 && (
        <Page pageNum={++p} actualPageNum={++ap}>
          <Header />
          <div className="text-center font-bold underline mb-20 uppercase text-lg">Proof of Service</div>
          <div className="space-y-4">
            {data.proofOfServiceUploads.map((file, i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 h-96 flex items-center justify-center text-gray-400 font-bold italic overflow-hidden">
                {file.startsWith('data:') ? (
                  <img src={file} className="w-full h-full object-contain" alt={`Receipt ${i + 1}`} />
                ) : (
                  <span>[RECEIPT / PROOF OF SERVICE #{i + 1}]</span>
                )}
              </div>
            ))}
          </div>
          <Signature />
        </Page>
      )}
    </div>
  );
};
