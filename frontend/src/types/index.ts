// Core application types

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  educational?: EducationalContent;
  educational_resources?: EducationalResources;
  educational_summary?: EducationalSummary;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  cbd_mg?: number;
  thc_mg?: number;
  cbg_mg?: number;
  cbn_mg?: number;
  cbc_mg?: number;
  thca_percentage?: number;
  price: number;
  effects: string[];
  terpenes?: Record<string, number>;
  lab_tested: boolean;
  lab_report_url?: string;
  match_score?: number;
  product_type: string;
  strain_type?: string;
  in_stock: boolean;
}

export interface EducationalContent {
  title: string;
  content: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  key_points: string[];
  faqs: Array<{ q: string; a: string }>;
  related_topics: string[];
}

export interface ResearchPaper {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  abstract: string;
  study_type: string;
  credibility_score: number;
  source: string;
  url?: string;
}

export interface EducationalResources {
  research_studies?: {
    papers: ResearchPaper[];
    summary: Record<string, any>;
    quality_analysis: Record<string, any>;
    total_found: number;
  };
  dosage_guidelines?: {
    guidelines: Record<string, any>;
    recommendation: string;
    evidence_base: string[];
    safety_considerations: string[];
  };
  safety_information?: {
    interactions: Record<string, any>;
    general_warnings: string[];
    recommendation: string;
  };
  legal_status?: {
    federal_status: Record<string, any>;
    state_status: Record<string, any>;
    compliance_notes: string[];
  };
  mechanism_of_action?: {
    compound: string;
    condition: string;
    explanation: string;
    pathway: string;
  };
  source_credibility?: {
    total_papers: number;
    average_credibility: number;
    high_credibility_count: number;
    source_distribution: Record<string, number>;
    credibility_level: string;
  };
}

export interface EducationalSummary {
  query: string;
  compounds_researched: string[];
  evidence_strength: 'limited' | 'moderate' | 'strong';
  key_findings: string[];
  research_gaps: string[];
  confidence_level: 'low' | 'moderate' | 'high';
}

export interface ChatRequest {
  text: string;
  session_id?: string;
  privacy_level?: number;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  products: Product[];
  suggestions: string[];
  educational_content?: EducationalContent;
  educational_resources?: EducationalResources;
  educational_summary?: EducationalSummary;
}

export interface ProductFilter {
  cannabinoid?: string;
  effect?: string;
  product_type?: string;
  max_price?: number;
  min_cbd?: number;
  max_thc?: number;
}

export interface SearchRequest {
  query: string;
  filters?: ProductFilter;
  limit?: number;
  session_id?: string;
}

export interface ConversationState {
  sessionId: string | null;
  messages: Message[];
  products: Product[];
  isLoading: boolean;
  privacyLevel: number;
}

export interface UserPreferences {
  preferred_cannabinoids: string[];
  avoided_ingredients: string[];
  preferred_effects: string[];
  dosage_preferences: Record<string, any>;
  privacy_settings: {
    share_data: boolean;
    analytics: boolean;
  };
}

// UI Component Props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event_type: string;
  session_id?: string;
  properties: Record<string, any>;
  page_url?: string;
  referrer?: string;
}

// Privacy levels
export enum PrivacyLevel {
  ANONYMOUS = 1,
  SESSION = 2,
  LOCAL = 3,
  ACCOUNT = 4
}

export const PrivacyLevelNames = {
  [PrivacyLevel.ANONYMOUS]: 'Anonymous Browsing',
  [PrivacyLevel.SESSION]: 'Session Memory',
  [PrivacyLevel.LOCAL]: 'Local Storage',
  [PrivacyLevel.ACCOUNT]: 'Account Sync'
} as const;