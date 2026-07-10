export interface AideUser {
  id: string;
  email: string;
  phone?: string;
  status: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
  tokens?: number;
  role?: string;
}

export interface AideRegistrationChallenge {
  requires_verification: boolean;
  challenge_token: string;
  email_hint: string;
  expires_in: number;
}

export interface AideApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  versions?: ProjectVersion[];
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  pdf_url?: string;
  devices?: Record<string, unknown>[];
  graph?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  created_at: string;
}

export interface DeviceBrand {
  id: string;
  name: string;
}

export interface DeviceCategory {
  id: string;
  name: string;
}
