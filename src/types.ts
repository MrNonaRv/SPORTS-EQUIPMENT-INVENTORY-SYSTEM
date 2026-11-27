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
  equipmentCode?: string; // Primary Equipment ID / Code (e.g. EQ-0001, BB-001, ARN-003)
  equipmentCodes?: string[]; // Individual unit Equipment IDs / Codes assigned to units
  name: string;
  description?: string;
  category: string;
  total: number;
  available: number;
  borrowed: number;
  inRepair: number;
  damaged: number;
  location?: string;
  lastChecked?: string;
}

export type EquipmentConditionAction =
  | 'mark_damaged'
  | 'mark_repair'
  | 'move_damaged_to_repair'
  | 'restore_from_repair'
  | 'restore_from_damaged';

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
  returnCondition?: 'Good' | 'Damaged';
}

export interface ArrivalRecord {
  id: string;
  equipmentCode?: string;
  equipmentCodes?: string[];
  arrivalType?: 'new' | 'restock';
  equipmentName: string;
  category: string;
  quantity: number;
  condition: string;
  supplier?: string;
  location: string;
  description?: string;
  notes?: string;
  date: string;
  receivedBy?: string;
}

export interface AppState {
  users: User[];
  equipment: Equipment[];
  requests: BorrowRequest[];
  arrivalRecords?: ArrivalRecord[];
  currentUser: User | null;
  currentView: 'landing' | 'login_admin' | 'login_borrower' | 'signup' | 'public_dashboard' | 'borrower_dashboard' | 'admin_dashboard';
  theme: 'dark' | 'light';
}
