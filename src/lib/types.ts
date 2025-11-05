export type SportType = 'tackle' | 'flag';

export interface Team {
  id: string;
  name: string;
  sportType: SportType;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Field {
  id: string;
  name: string;
  siteId: string;
  sportType: SportType;
  capacity?: number;
}

export interface ScheduleEvent {
  id: string;
  fieldId: string;
  teamId: string;
  startTime: string;
  endTime: string;
  eventType: 'practice' | 'game' | 'tournament';
  opponent?: string;
  notes?: string;
}

export interface Request {
  id: string;
  type: 'facility' | 'equipment';
  teamId?: string;
  requestedBy: string;
  requestedDate: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  fieldId?: string;
  siteId?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'QMTadmin' | 'QMTmgmt';
  email?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: 'QMTadmin' | 'QMTmgmt' | null;
  username: string | null;
}
