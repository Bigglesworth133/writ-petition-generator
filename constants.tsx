
import React from 'react';

export const FIXED_TEMPLATE_TEXT = {
  PETITION_HEADING: "WRIT PETITION UNDER ARTICLE 226 & 227 OF THE CONSTITUTION OF INDIA",
  SHOWETH: "MOST RESPECTFULLY SHOWETH:",
  PRAYER_HEADING: "PRAYER",
  VERIFICATION: "VERIFICATION",
  AFFIDAVIT: "AFFIDAVIT",
};

export const FORMATTING = {
  FONT: "'Times New Roman', Times, serif",
  SIZE: "14pt",
  LINE_HEIGHT: "1.5",
  MARGINS: {
    LEFT: "40mm",
    RIGHT: "40mm",
    TOP: "20mm",
    BOTTOM: "20mm",
  }
};

export const getAnnexureTitle = (index: number) => `ANNEXURE P-${index + 1}`;

export const getGroundLabel = (index: number) => {
  let label = "";
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
};
