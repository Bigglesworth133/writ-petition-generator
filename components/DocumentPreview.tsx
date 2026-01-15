
import React, { useMemo } from 'react';
import { WritFormData } from '../types';
import { FORMATTING, HIGH_COURT_DEFAULT, JURISDICTION_DEFAULT, getAnnexureTitle } from '../constants';

interface PreviewProps {
  data: WritFormData;
}

export const DocumentPreview: React.FC<PreviewProps> = ({ data }) => {
  // Auto-indexing logic simulating high-fidelity PDF pagination
  const indexItems = useMemo(() => {
    let p = 1;
    const items = [];

    // 1. Urgent Application
    items.push({ title: 'URGENT APPLICATION', p: p++ });

    // 2. Certificate
    items.push({ title: 'CERTIFICATE', p: p++ });

    // 3. Notice of Motion
    items.push({ title: 'NOTICE OF MOTION', p: p++ });

    // 4. Court Fees
    items.push({ title: 'COURT FEES', p: p++ });

    // 5. Memo of Parties
    items.push({ title: 'MEMO OF PARTIES', p: p++ });

    // 6. Synopsis and List of Dates
    items.push({ title: 'SYNOPSIS AND LIST OF DATES', p: `${p}-${p + 2}` });
    p += 3;

    // 7. Writ Petition
    items.push({ title: 'WRIT PETITION', p: `${p}-${p + 8}` });
    p += 9;

    // 8. Annexures
    data.annexures.forEach((ann, idx) => {
      items.push({ title: `ANNEXURE ${getAnnexureTitle(idx)}: A TRUE COPY OF ${ann.title}`, p: p });
      p += 2;
    });

    // 9. Applications
    data.applications.forEach((app) => {
      items.push({ title: `MISC. APPL.: ${app.description}`, p: `${p}-${p + 3}` });
      p += 4;
    });

    // 10. Letter of Authority
    if (data.letterOfAuthorityUpload) {
      items.push({ title: 'LETTER OF AUTHORITY', p: p++ });
    }

    // 11. Vakalatnama
    items.push({ title: 'VAKALATNAMA', p: p++ });

    // 12. Proof of Service
    if (data.proofOfServiceUploads.length > 0) items.push({ title: 'PROOF OF SERVICE', p: p++ });

    return items;
  }, [data.annexures, data.applications, data.proofOfServiceUploads, data.letterOfAuthorityUpload, data.year]);

  const Page = ({ children, className = "", pageNum }: { children: React.ReactNode, className?: string, pageNum?: number, key?: React.Key }) => (
    <div className={`bg-white shadow-lg mx-auto mb-10 print:mb-0 print:shadow-none print:break-after-page relative ${className}`}
      style={{ width: '210mm', minHeight: '297mm', padding: `${FORMATTING.MARGINS.TOP} ${FORMATTING.MARGINS.RIGHT} ${FORMATTING.MARGINS.BOTTOM} ${FORMATTING.MARGINS.LEFT}` }}>
      <div className="times-new-roman text-justify" style={{ fontSize: '14pt', lineHeight: '1.5', color: 'black' }}>
        {children}
      </div>
      {pageNum !== undefined && (
        <div className="absolute bottom-8 left-0 right-0 text-center font-bold text-sm no-print-pagination">
          {pageNum}
        </div>
      )}
    </div>
  );



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

  const Header = () => (
    <div className="text-center font-bold mb-10 uppercase">
      <p>{data.highCourt || HIGH_COURT_DEFAULT}</p>
      <p>{data.jurisdiction || JURISDICTION_DEFAULT}</p>
      <div className="my-4">
        <p>W.P. ({data.petitionType.charAt(0)}) NO. _______ OF {data.year}</p>
        {data.petitionType === 'Criminal' && <p>AND<br />CRL.M.A. NO. ______ OF {data.year}</p>}
      </div>
      <div className="mb-4">
        <p>IN THE MATTER OF:</p>
        <div className="flex justify-between items-start px-10 mt-2">
          <div className="w-[45%] text-left">
            <p>{getCauseTitle().pText}</p>
            <p className="italic mt-1">... PETITIONER(S)</p>
          </div>
          <div className="w-[10%] text-center italic font-normal text-sm lowercase">Versus</div>
          <div className="w-[45%] text-right">
            <p>{getCauseTitle().rText}</p>
            <p className="italic mt-1">... RESPONDENT(S)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Signature = () => (
    <div className="mt-20 flex flex-col items-end text-right font-bold text-xs uppercase">
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
      <p className="mt-4">{data.location}, {data.filingDate}</p>
    </div>
  );

  let p = 0;

  return (
    <div className="print:bg-white bg-gray-200 py-10 print:p-0">
      {/* 0. LISTING PROFORMA */}
      <Page pageNum={undefined}>
        <div className="text-center font-bold underline mb-10 uppercase text-lg">Listing Proforma</div>
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold w-1/3">1. CASE TYPE</td>
              <td className="border border-black p-4 uppercase">Writ Petition ({data.petitionType})</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">2. CASE NUMBER</td>
              <td className="border border-black p-4 uppercase">W.P. ({data.petitionType.charAt(0)}) NO. _______ OF {data.year}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">3. PETITIONER(S)</td>
              <td className="border border-black p-4 uppercase">{data.petitioners.map(pet => pet.name).join(", ")}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">4. RESPONDENT(S)</td>
              <td className="border border-black p-4 uppercase">{data.respondents.map(r => r.name).join(", ")}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">5. DATE OF FILING</td>
              <td className="border border-black p-4 font-bold">{data.filingDate}</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">6. PROVISION OF LAW</td>
              <td className="border border-black p-4 font-bold">ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA</td>
            </tr>
            <tr className="border border-black">
              <td className="border border-black p-4 font-bold">7. COURT FEE</td>
              <td className="border border-black p-4 font-bold">INR {data.courtFeeAmount} /-</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-20 flex justify-between px-10">
          <div className="text-center font-bold border-t border-black pt-2 px-6 uppercase text-xs">Petitioner(s) Signature</div>
          <div className="text-center font-bold border-t border-black pt-2 px-6 uppercase text-xs">Advocate(s) Signature</div>
        </div>
      </Page>

      {/* 1. INDEX */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold underline mb-6">INDEX</div>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="border border-black font-bold">
              <th className="border border-black p-2 text-center w-12">S.NO.</th>
              <th className="border border-black p-2 text-left">PARTICULARS</th>
              <th className="border border-black p-2 text-center w-24">PAGE NO.</th>
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
          <div className="mt-8">
            <div className="font-bold underline mb-2">NOTES:</div>
            <ol className="list-decimal ml-6">
              {data.notes.map((note) => (
                <li key={note.id} className="mb-2">{note.text}</li>
              ))}
            </ol>
          </div>
        )}

        <Signature />
      </Page>

      {/* 2. URGENT APPLICATION & CERTIFICATE */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase">Urgent Application</div>
        <p className="mb-4">To,</p>
        <p className="mb-4 font-bold">The Registrar,<br />High Court of Delhi,<br />New Delhi - {data.urgentPinCode}</p>
        <p className="mb-10 font-bold italic">Sub: Application for urgent listing of the captioned writ petition.</p>
        <div className="whitespace-pre-wrap mb-10">{data.urgentContent}</div>
        <Signature />
        <div className="mt-20 border-t-2 border-dashed pt-10">
          <div className="text-center font-bold underline mb-6 uppercase">Certificate</div>
          <p className="whitespace-pre-wrap">{data.certificateContent}</p>
        </div>
      </Page>

      {/* 3. NOTICE OF MOTION */}
      <Page pageNum={++p}>
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

      {/* 3A. MEMO OF PARTIES */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold underline mb-10 uppercase text-lg">Memo of Parties</div>

        <div className="space-y-8">
          <div>
            {data.petitioners.map((pet, i) => (
              <div key={pet.id} className="mb-6">
                <p className="font-bold">{i + 1}. {pet.name.toUpperCase()}</p>
                {pet.authRep && <p className="italic text-sm">Through its Authorised Representative {pet.authRep}</p>}
                {pet.addresses.map((addr, ai) => <p key={ai} className="pl-6">{addr}</p>)}
                <p className="pl-6 uppercase">{pet.city} - {pet.pin}, {pet.state}</p>
              </div>
            ))}
            <p className="text-right font-bold italic">...PETITIONER(S)</p>
          </div>

          <div className="text-center font-bold italic py-4">VERSUS</div>

          <div>
            {data.respondents.map((r, i) => (
              <div key={r.id} className="mb-6">
                <p className="font-bold">{i + 1}. {r.name.toUpperCase()}</p>
                {r.authRep && <p className="italic text-sm">Through its Authorised Representative {r.authRep}</p>}
                {r.addresses.map((addr, ai) => <p key={ai} className="pl-6">{addr}</p>)}
                <p className="pl-6 uppercase">{r.city} - {r.pin}, {r.state}</p>
                {r.email && <p className="pl-6 text-sm">Email: {r.email}</p>}
              </div>
            ))}
            <p className="text-right font-bold italic">...RESPONDENT(S)</p>
          </div>
        </div>

        <Signature />
      </Page>

      {/* 4. SYNOPSIS & DATES */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold underline mb-4 uppercase">Synopsis</div>
        <p className="italic font-bold mb-6">{data.synopsisDescription}</p>
        <div className="whitespace-pre-wrap mb-10">{data.synopsisContent}</div>
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
                <td className="border border-black p-2">{d.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Signature />
      </Page>

      {/* 5. MAIN PETITION */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold mb-8 text-xl px-10">
          {data.petitionDescriptionMain || `WRIT PETITION UNDER ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA SEEKING THE ISSUANCE OF A WRIT, ORDER OR DIRECTION IN THE NATURE OF CERTIORARI, MANDAMUS OR ANY OTHER APPROPRIATE WRIT...`}
        </div>
        <div className="font-bold mb-6">MOST RESPECTFULLY SHOWETH:</div>
        <div className="whitespace-pre-wrap mb-10">
          <p className="mb-4">1. The present Writ Petition is being filed by the Petitioner seeking the kind indulgence of this Hon'ble Court under its Extraordinary Writ Jurisdiction to address the grievances of the Petitioner regarding...</p>
          {data.petitionShoweth}
        </div>
        <div className="font-bold underline mb-4">FACTS:</div>
        <div className="whitespace-pre-wrap mb-10">{data.petitionFacts}</div>

        <div className="mb-10 indent-10 italic text-justify" style={{ fontSize: '12pt', lineHeight: '1.2' }}>
          2. The Petitioner states that they have no other alternate, efficacious and speedy remedy available against the impugned action/order other than the invocation of the Extraordinary Writ Jurisdiction of this Hon'ble Court.
        </div>

        <div className="font-bold underline mb-4 uppercase">Grounds:</div>
        <div className="space-y-6 mb-10">
          {data.petitionGrounds.split('\n').filter(g => g.trim()).map((ground, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="font-bold">GROUND {getGroundsAlpha(idx)}:</span>
              <div className="flex-1">
                <span className="font-bold italic">Because </span>
                {ground}
              </div>
            </div>
          ))}
        </div>

        <div className="font-bold underline mb-6 uppercase">Prayer:</div>
        <div className="mb-6">
          IN THE LIGHT OF THE FACTS AND CIRCUMSTANCES STATED HEREIN ABOVE, IT IS MOST HUMBLY PRAYED THAT THIS HON'BLE COURT MAY BE GRACIOUSLY PLEASED TO:
        </div>
        <div className="space-y-4 mb-10">
          <div className="flex gap-4 pl-10">
            <span>(a)</span>
            <div className="flex-1">{data.petitionPrayers || "Issue an appropriate writ, order or direction..."}</div>
          </div>
          <div className="flex gap-4 pl-10">
            <span>(b)</span>
            <div className="flex-1 text-justify">Pass such further orders as this Hon'ble Court may deem fit and proper in the facts and circumstances of the case and in the interest of justice.</div>
          </div>
        </div>
        <div className="text-center font-bold mt-10 space-y-2 uppercase">
          <p>AND FOR THIS ACT OF KINDNESS THE PETITIONER SHALL REMAIN DUTY BOUND, EVERY PRAY.</p>
        </div>
        <Signature />
      </Page>

      {/* 6. AFFIDAVIT */}
      <Page pageNum={++p}>
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
      {data.annexures.map((ann, idx) => (
        <Page key={ann.id} pageNum={++p}>
          <div className="flex justify-between font-bold mb-10 uppercase">
            <span>Annexure {getAnnexureTitle(idx)}</span>
          </div>
          <div className="text-center font-bold underline mb-20 uppercase text-lg">
            A TRUE COPY OF {ann.title}
          </div>
          <div className="border-2 border-dashed border-gray-300 h-[500px] flex items-center justify-center text-gray-400 font-bold italic">
            [DOCUMENT: {ann.title}]
          </div>
          <Signature />
        </Page>
      ))}

      {/* 8. APPLICATIONS */}
      {data.applications.map((app) => (
        <React.Fragment key={app.id}>
          <Page pageNum={++p}>
            <Header />
            <div className="text-center font-bold mb-8 text-xl px-10 uppercase">
              IN THE MATTER OF:<br />
              MISC. APPL. NO. ______ OF {data.year}<br />
              IN<br />
              W.P. ({data.petitionType.charAt(0)}) NO. _______ OF {data.year}
            </div>
            <div className="text-center font-bold underline mb-10 uppercase text-lg">
              APPLICATION UNDER SECTION 151 OF CPC FOR {app.description.toUpperCase()}
            </div>
            <div className="font-bold mb-6 uppercase">Most Respectfully Showeth:</div>
            <div className="whitespace-pre-wrap mb-10">{app.showethContent}</div>
            <div className="font-bold underline mb-6 uppercase">Prayer:</div>
            <div className="whitespace-pre-wrap mb-10">{app.prayerContent}</div>
            <Signature />
          </Page>

          {/* Application Affidavit */}
          <Page pageNum={++p}>
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
        <Page pageNum={++p}>
          <Header />
          <div className="text-center font-bold underline mb-20 uppercase text-lg">Letter of Authority</div>
          <div className="border-2 border-dashed border-gray-300 h-[600px] flex items-center justify-center text-gray-400 font-bold italic">
            [ATTACHED LETTER OF AUTHORITY]
          </div>
          <Signature />
        </Page>
      )}

      {/* 10. VAKALATNAMA */}
      <Page pageNum={++p}>
        <Header />
        <div className="text-center font-bold underline mb-20 uppercase text-lg">Vakalatnama</div>
        <div className="grid grid-cols-2 gap-10 mt-20">
          <div className="border border-black p-10 h-64 flex flex-col justify-between">
            <p className="font-bold underline text-center uppercase">Advocate(s) Signature</p>
            <div>
              {data.advocates.map(adv => (
                <p key={adv.id} className="text-sm font-bold uppercase">{adv.name}</p>
              ))}
            </div>
          </div>
          <div className="border border-black p-10 h-64 flex flex-col justify-between italic">
            <p className="font-bold underline text-center uppercase not-italic">Petitioner(s) Signature</p>
            <p className="text-right mt-auto font-bold uppercase">Petitioner(s)</p>
          </div>
        </div>
        <div className="mt-10 p-4 border border-black text-sm text-justify">
          The Petitioner(s) hereby appoint and authorize the above mentioned Advocate(s) to represent, appear and act on their behalf in the captioned matter.
        </div>
        <Signature />
      </Page>

      {/* 11. PROOF OF SERVICE */}
      {data.proofOfServiceUploads.length > 0 && (
        <Page pageNum={++p}>
          <Header />
          <div className="text-center font-bold underline mb-20 uppercase text-lg">Proof of Service</div>
          <div className="space-y-4">
            {data.proofOfServiceUploads.map((_, i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 h-96 flex items-center justify-center text-gray-400 font-bold italic">
                [RECEIPT / PROOF OF SERVICE #{i + 1}]
              </div>
            ))}
          </div>
          <Signature />
        </Page>
      )}
    </div>
  );
};
