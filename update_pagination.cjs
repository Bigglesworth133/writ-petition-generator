const fs = require('fs');
let content = fs.readFileSync('components/DocumentPreview.tsx', 'utf8');

// 1. Add hook imports
content = content.replace(
    "import React, { useMemo } from 'react';",
    "import React, { useMemo, useState, useLayoutEffect } from 'react';"
);

// 2. Add State and Effect at top of component
const stateAndEffect = "  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});\n\n  useLayoutEffect(() => {\n    const previewContainer = document.getElementById('document-preview');\n    if (!previewContainer) return;\n\n    const a4Px = 297 * 3.779527559; \n    const newCounts = {};\n    const pages = previewContainer.querySelectorAll('[data-section-id]');\n    \n    pages.forEach(page => {\n      const id = page.getAttribute('data-section-id');\n      if (id) {\n        const height = page.getBoundingClientRect().height;\n        const count = Math.max(1, Math.ceil((height - 10) / a4Px));\n        newCounts[id] = count;\n      }\n    });\n\n    let changed = false;\n    for (const key in newCounts) {\n      if (newCounts[key] !== pageCounts[key]) {\n        changed = true; break;\n      }\n    }\n    if (Object.keys(newCounts).length !== Object.keys(pageCounts).length) changed = true;\n\n    if (changed) {\n      setPageCounts(newCounts);\n    }\n  }, [data, reviewMode]);\n";

content = content.replace(
    "const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {",
    stateAndEffect + "\n  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNum: number) => {"
);

// 3. Update Page Component Props
content = content.replace(
    "const Page = ({ children, className = \"\", pageNum, actualPageNum, key, noPadding = false }: { children: React.ReactNode, className?: string, pageNum?: number | string, actualPageNum: number, key?: React.Key, noPadding?: boolean }) => (",
    "const Page = ({ children, className = \"\", pageNum, actualPageNum, key, noPadding = false, sectionId }: { children: React.ReactNode, className?: string, pageNum?: number | string, actualPageNum: number, key?: React.Key, noPadding?: boolean, sectionId?: string }) => ("
);

content = content.replace(
    "<div\n      onClick={(e) => handlePageClick(e, actualPageNum)}\n      key={key}",
    "<div\n      onClick={(e) => handlePageClick(e, actualPageNum)}\n      key={key}\n      data-section-id={sectionId}"
);

// 4. Modify indexItems Logic
let startIndex = content.indexOf("// Auto-indexing logic with dynamic page length estimation");
let endIndex = content.indexOf("  const getGroundsAlpha = (index: number) => {");

if (startIndex > -1 && endIndex > -1) {
    const newIndexLogic = "// Auto-indexing logic using DOM calculated page counts\n  const indexItems = useMemo(() => {\n    let p = 1; \n    const items: { title: React.ReactNode; p: string | number; id: string }[] = [];\n\n    const baseWritTitle = 'WRIT PETITION UNDER ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA';\n    const fullWritTitle = data.writTitleExtension\n      ? baseWritTitle + ' ' + data.writTitleExtension.toUpperCase()\n      : baseWritTitle;\n\n    const pushItem = (title: React.ReactNode, id: string, defaultFallback: number = 1) => {\n      const count = pageCounts[id] || defaultFallback;\n      const endPage = p + count - 1;\n      const pageStr = count > 1 ? p + '-' + endPage : p.toString();\n      items.push({ title, p: pageStr, id });\n      p += count;\n    };\n\n    if (data.includeListingProforma) {\n      items.push({ title: 'Listing Proforma', p: 'A-1', id: 'listing' });\n    }\n\n    pushItem('Urgent Application', 'urgent');\n    if (data.includeCertificate) pushItem('Certificate', 'certificate');\n    pushItem('Notice of Motion', 'notice');\n    \n    if (!data.courtFeeOption || data.courtFeeOption === 'And' || data.courtFeeOption === 'Or (Table Only)') {\n        pushItem('Court Fees', 'court_fees');\n    }\n    if (data.courtFeeAttachment && ['And', 'Or (Attachment Only)', ''].includes(data.courtFeeOption || '')) {\n       const attachmentPages = data.courtFeeAttachment.toLowerCase().endsWith('.pdf') || data.courtFeeAttachment.startsWith('data:application/pdf') \n         ? parseInt(data.courtFeeAttachmentPages || '1', 10) \n         : 1;\n       pushItem('Court Fees (Attachment)', 'court_fees_attach', attachmentPages);\n    }\n\n    pushItem('Memo of Parties', 'memo');\n    pushItem('Synopsis and List of Dates', 'synopsis', 2);\n    pushItem(fullWritTitle, 'petition', 4);\n    pushItem('Affidavit', 'affidavit');\n\n    data.annexures.forEach((ann, idx) => {\n      const pageCount = parseInt(ann.pageCount || '1', 10);\n      pushItem(<><span className=\"font-bold uppercase\">{getAnnexureTitle(idx)}</span><br />A True copy of {ann.title}</>, 'annexure-' + idx, pageCount);\n    });\n\n    data.applications.forEach((app, idx) => {\n      pushItem('Misc. Appl.: ' + app.description, 'app-' + idx, 2);\n    });\n\n    if (data.letterOfAuthorityUpload) {\n      const loaPages = data.letterOfAuthorityUpload.toLowerCase().endsWith('.pdf') || data.letterOfAuthorityUpload.startsWith('data:application/pdf')\n        ? parseInt(data.letterOfAuthorityUploadPages || '1', 10)\n        : 1;\n      pushItem('Letter of Authority', 'loa', loaPages);\n    }\n    pushItem('Vakalatnama', 'vakalatnama');\n    if (data.proofOfServiceUploads.length > 0) {\n      let posPages = 0;\n      data.proofOfServiceUploads.forEach((upload, idx) => {\n        const pagesStr = data.proofOfServicePages?.[idx] || '1';\n        posPages += parseInt(pagesStr, 10);\n      });\n      // Fallback if the calculation yields 0\n      posPages = posPages || 1;\n      pushItem('Proof of Service', 'pos', posPages);\n    }\n\n    return items;\n  }, [data, pageCounts]);\n\n";
    content = content.substring(0, startIndex) + newIndexLogic + content.substring(endIndex);
}

// 5. Replace state running vars at render time
let pStart = content.indexOf("  let p = 0;\n  let ap = 0;");
let pEnd = content.indexOf("  return (\n    <div className=\"flex flex-col items-center gap-12 pb-20\" id=\"document-preview\">");
if (pStart > -1 && pEnd > -1) {
    content = content.substring(0, pStart) + "  let currentP = 1;\n  let ap = 0;\n\n  const getPageNumStr = (id: string, forcedCount?: number) => {\n     const count = forcedCount !== undefined ? forcedCount : (pageCounts[id] || 1);\n     const startP = currentP;\n     currentP += count;\n     return startP;\n  };\n\n" + content.substring(pEnd);
}

// 6. Fix individual sections mapping using strictly specific replacements
const replaceTag = (searchStr, replaceStr) => {
    content = content.split(searchStr).join(replaceStr);
};

// Listing Proforma
replaceTag('<Page pageNum="A-1" actualPageNum={++ap}>', '<Page sectionId="listing" pageNum="A-1" actualPageNum={++ap}>');
replaceTag('<Page pageNum="" actualPageNum={++ap}>', '<Page sectionId="index_page" pageNum="" actualPageNum={++ap}>');

// Court fees conditions
replaceTag(
    '<Page pageNum={++p} actualPageNum={++ap} noPadding={true}>\n              <div className="absolute top-[1.5in] w-full text-center font-bold uppercase underline z-10">Court Fees</div>\n              <div className="w-full h-full flex items-center justify-center">\n                <img src={data.courtFeeAttachment}',
    '<Page sectionId="court_fees_attach" pageNum={getPageNumStr("court_fees_attach", 1)} actualPageNum={++ap} noPadding={true}>\n              <div className="absolute top-[1.5in] w-full text-center font-bold uppercase underline z-10">Court Fees</div>\n              <div className="w-full h-full flex items-center justify-center">\n                <img src={data.courtFeeAttachment}'
);
replaceTag('<Page key={`court-fee-pdf-${idx}`} pageNum={++p} actualPageNum={++ap} noPadding={true}>', '<Page key={`court-fee-pdf-${idx}`} sectionId="court_fees_attach" pageNum={getPageNumStr("court_fees_attach", 1)} actualPageNum={++ap} noPadding={true}>');

// Annexures
replaceTag('<Page key={`annexure-${idx}-${pageIdx}`} pageNum={++p}', '<Page key={`annexure-${idx}-${pageIdx}`} sectionId={`annexure-${idx}`} pageNum={getPageNumStr(`annexure-${idx}`, 1)}');
replaceTag('<Page key={`annexure-${idx}`} pageNum={++p}', '<Page key={`annexure-${idx}`} sectionId={`annexure-${idx}`} pageNum={getPageNumStr(`annexure-${idx}`, 1)}');
replaceTag('<Page key={`app-${idx}`} pageNum={++p}', '<Page key={`app-${idx}`} sectionId={`app-${idx}`} pageNum={getPageNumStr(`app-${idx}`, 1)}');
replaceTag('<Page key={`app-aff-${idx}`} pageNum={++p}', '<Page key={`app-aff-${idx}`} sectionId={`app-${idx}-aff`} pageNum={getPageNumStr(`app-${idx}-aff`, 1)}');

const order = [
    "urgent",
    "certificate",
    "notice",
    "court_fees",
    "court_fees",
    "memo",
    "affidavit",
    "loa",
    "vakalatnama"
];

let currentIndex = 0;
while (true) {
    let tagIndex = content.indexOf("<Page pageNum={++p} actualPageNum={++ap}>");
    if (tagIndex === -1) break;
    if (currentIndex >= order.length) break;

    let repId = order[currentIndex];
    let newTag = `<Page sectionId="${repId}" pageNum={getPageNumStr("${repId}")} actualPageNum={++ap}>`;
    content = content.substring(0, tagIndex) + newTag + content.substring(tagIndex + 41);
    currentIndex++;
}

// Petition and Synopsis
content = content.replace(/<Page pageNum=\{renderPagination\(synopsisPages\)\} actualPageNum=\{\+\+ap\}>/g, '<Page sectionId="synopsis" pageNum={getPageNumStr("synopsis")} actualPageNum={++ap}>');
content = content.replace(/<Page pageNum=\{renderPagination\(petitionPages\)\} actualPageNum=\{\+\+ap\}>/g, '<Page sectionId="petition" pageNum={getPageNumStr("petition")} actualPageNum={++ap}>');

// Proof of service uses key 
replaceTag("<Page key={`pos-${idx}`} pageNum={++p} actualPageNum={++ap}>", "<Page key={`pos-${idx}`} sectionId=\"pos\" pageNum={getPageNumStr('pos', 1)} actualPageNum={++ap}>");

fs.writeFileSync('components/DocumentPreview.tsx', content);
console.log('Update Complete!');
