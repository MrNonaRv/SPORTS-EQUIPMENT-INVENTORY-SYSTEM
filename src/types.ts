export type Role = 'admin' | 'student' | 'faculty';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string; // ID Number
  name: string;
  role: Role;
  department?: string;
  contact?: string;
  status: UserStatus;
  password?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  total: number;
  available: number;
  borrowed: number;
  inRepair: number;
  damaged: number;
  location?: string;
  lastChecked?: string;
}

export type RequestStatus = 'pending' | 'approved' | 'declined' | 'returned' | 'return_pending' | 'overdue';

export interface BorrowRequestItem {
  equipmentId: string;
  quantity: number;
}

export interface BorrowRequest {
  id: string;
  userId: string;
  // Legacy support
  equipmentId?: string;
  quantity?: number;
  // New array format
  items?: BorrowRequestItem[];
  purpose: string;
  pickupDate: string;
  returnDate: string;
  status: RequestStatus;
  requestDate: string;
}

export interface AppState {
  users: User[];
  equipment: Equipment[];
  requests: BorrowRequest[];
  currentUser: User | null;
  currentView: 'landing' | 'login_admin' | 'login_borrower' | 'signup' | 'public_dashboard' | 'borrower_dashboard' | 'admin_dashboard';
}
