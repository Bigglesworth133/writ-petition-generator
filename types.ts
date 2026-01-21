
export interface Petitioner {
  id: string;
  name: string;
  authRep?: string;
  addresses: string[];
  city: string;
  pin: string;
  state: string;
}

export interface Respondent {
  id: string;
  name: string;
  authRep?: string;
  addresses: string[];
  city: string;
  pin: string;
  state: string;
  email?: string;
}

export interface Advocate {
  id: string;
  name: string;
  enrolmentNumber: string;
  addresses: string[];
  phoneNumbers: string[];
  email: string;
}

export interface Annexure {
  id: string;
  title: string;
  contentText: string;
  files: string[];
  pageCount: string;
}

export interface Application {
  id: string;
  description: string;
  showethContent: string;
  prayerContent: string;
  useMainAffidavit: boolean;
  verificationDate: string;
}

export interface DateEntry {
  id: string;
  dates: string[];
  event: string;
}

export interface NoteEntry {
  id: string;
  text: string;
}

export interface Reply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Annotation {
  id: string;
  elementId: string; // To track which section/paragraph
  text: string;
  author: string;
  x: number;
  y: number;
  pageNum: number;
  isResolved?: boolean;
  replies?: Reply[];
}

export interface WritFormData {
  // Introduction
  highCourt: string;
  jurisdiction: string;
  petitionType: 'Civil' | 'Criminal';
  year: string;
  petitioners: Petitioner[];
  respondents: Respondent[];

  // Content Descriptions
  petitionDescription: string;
  annexures: Annexure[];
  applications: Application[];
  notes: NoteEntry[];
  letterOfAuthorityUpload: string | null;

  // Petition Through
  location: string;
  filingDate: string;
  advocates: Advocate[];
  addresses: string[];
  phoneNumbers: string[];
  userEmail: string;

  // Urgent Application
  urgentPinCode: string;
  urgentContent: string;

  // Certificate
  certificateContent: string;

  // Notice of Motion
  noticeAddressedTo: string;
  noticeDesignation: string;
  noticeOrg: string;
  noticeOffice: string;
  noticeLocation: string;
  noticeHearingDate: string;

  // Court Fee
  courtFeeUin: string;
  courtFeeAmount: string;
  courtFeeAttachment: string | null;

  // Synopsis
  synopsisDescription: string;
  preSynopsisContent: string;
  synopsisContent: string;

  // List of Dates
  dateList: DateEntry[];

  // Petition
  petitionDescriptionMain: string;
  petitionShoweth: string;
  petitionFacts: string;
  petitionGrounds: string;
  petitionPrayers: string;
  groundEnumerationType: 'Alpha' | 'Numeric';

  // Affidavit
  affidavitIdentity: 'Petitioner' | 'Authorized Representative';
  affidavitName: string;
  affidavitAge: string;
  affidavitAddress: string;
  affidavitLocation: string;
  verificationDate: string;

  // Proof of Service
  proofOfServiceUploads: string[];

  // Form Config
  includeListingProforma: boolean;
  includeCertificate: boolean;
}
