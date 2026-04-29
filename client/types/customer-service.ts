/** Spring Data Page 직렬화 형태 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface NoticeSummary {
  id: number;
  category: string | null;
  title: string;
  pinned: boolean;
  createdAt: string;
}

export interface NoticeDetail {
  id: number;
  category: string | null;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeSavePayload {
  category?: string | null;
  title: string;
  body: string;
  pinned: boolean;
}

export interface FaqItem {
  id: number;
  sortOrder: number;
  question: string;
  answer: string;
}

export interface FaqSavePayload {
  question: string;
  answer: string;
  sortOrder: number;
}

export type InquiryStatus = "OPEN" | "ANSWERED";

export interface InquiryMine {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface InquiryCreatePayload {
  title: string;
  content: string;
}

export interface InquiryAdminRow {
  id: number;
  writerEmail: string;
  title: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryAdminDetail extends InquiryAdminRow {
  writerName: string;
  content: string;
  answer: string | null;
  answeredAt: string | null;
}

export interface AdminMemberRow {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

export interface AdminMemberDetail {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
  createdAt: string;
}
