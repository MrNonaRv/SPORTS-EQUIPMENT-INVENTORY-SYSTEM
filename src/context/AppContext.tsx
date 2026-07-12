import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, User, Equipment, BorrowRequest, RequestStatus } from '../types';

interface AppContextType extends AppState {
  setView: (view: AppState['currentView']) => void;
  login: (user: User) => void;
  logout: () => void;
  registerUser: (user: User) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  addEquipment: (equipment: Equipment) => void;
  submitBorrowRequest: (request: BorrowRequest) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
}

const initialUsers: User[] = [
  { id: 'admin', name: 'Maria Santos', role: 'admin', status: 'approved', password: 'admin' },
  { id: '2024-00123', name: 'Juan Dela Cruz', role: 'student', department: 'BS Information Technology', contact: '0911223344', status: 'approved' },
  { id: 'FAC-00234', name: 'Prof. Lim', role: 'faculty', department: 'Education', status: 'approved' },
  { id: '2024-00612', name: 'Carlos Mendoza', role: 'student', department: 'BS Info Tech', contact: '09223344556', status: 'pending' },
  { id: '2024-00791', name: 'Liza Tan', role: 'faculty', department: 'BSED Education', contact: '09456789123', status: 'pending' },
  { id: '2024-00111', name: 'Rodel Santos', role: 'student', department: 'BSBA Criminology', contact: '09176543210', status: 'approved' },
  { id: '2023-00941', name: 'James Alarcon', role: 'student', department: 'BS Business Admin', contact: '09776655443', status: 'rejected' },
];

const initialEquipment: Equipment[] = [
  { id: 'eq-1', name: 'Basketball', category: 'Basketball', total: 8, available: 5, borrowed: 2, inRepair: 1, damaged: 0, location: 'Storage Rack Segment A-1', lastChecked: 'Jun 2, 07:30' },
  { id: 'eq-2', name: 'Volleyball', category: 'Volleyball', total: 6, available: 3, borrowed: 2, inRepair: 1, damaged: 0, location: 'Storage Rack Segment A-2', lastChecked: 'Jun 2, 06:45' },
  { id: 'eq-3', name: 'Soccer Ball', category: 'Football', total: 6, available: 4, borrowed: 1, inRepair: 1, damaged: 0, location: 'Locker Suite B', lastChecked: 'Jun 2, 07:00' },
  { id: 'eq-4', name: 'Badminton Racket', category: 'Badminton', total: 12, available: 8, borrowed: 3, inRepair: 1, damaged: 0, location: 'Wall Basket C', lastChecked: 'Jun 2, 08:00' },
  { id: 'eq-5', name: 'Shuttlecock (box)', category: 'Badminton', total: 10, available: 6, borrowed: 0, inRepair: 0, damaged: 4, location: 'Shelf Tier 2', lastChecked: 'Jun 2, 08:15' },
  { id: 'eq-6', name: 'Table Tennis Bat', category: 'Table Tennis', total: 8, available: 5, borrowed: 2, inRepair: 1, damaged: 0, location: 'Drawer Suite D-3', lastChecked: 'Jun 2, 08:30' },
  { id: 'eq-7', name: 'Chess Set', category: 'Chess', total: 10, available: 8, borrowed: 2, inRepair: 0, damaged: 0, location: 'Shelf Tier 1', lastChecked: 'Jun 2, 09:00' },
  { id: 'eq-8', name: 'Boxing Gloves (pair)', category: 'Boxing', total: 12, available: 2, borrowed: 10, inRepair: 0, damaged: 0, location: 'Locker Suite A', lastChecked: 'Jun 2, 09:15' },
];

const initialRequests: BorrowRequest[] = [
  { id: 'req-1', userId: 'FAC-00234', equipmentId: 'eq-4', quantity: 2, purpose: 'PE Class', pickupDate: '2026-06-01T08:00', returnDate: '2026-06-01T10:00', status: 'overdue', requestDate: '2026-05-30T10:00' },
  { id: 'req-2', userId: '2024-00111', equipmentId: 'eq-7', quantity: 1, purpose: 'Class Activity', pickupDate: '2026-06-02T13:00', returnDate: '2026-06-02T17:00', status: 'approved', requestDate: '2026-06-01T09:00' },
  { id: 'req-3', userId: '2024-00123', equipmentId: 'eq-1', quantity: 1, purpose: 'Class', pickupDate: '2026-06-03T10:13', returnDate: '2026-06-03T13:12', status: 'pending', requestDate: '2026-06-03T10:12' },
  { id: 'req-4', userId: 'FAC-00234', equipmentId: 'eq-2', quantity: 1, purpose: 'P.E. Dept', pickupDate: '2026-06-03T09:00', returnDate: '2026-06-03T11:00', status: 'pending', requestDate: '2026-06-03T08:00' },
  { id: 'req-5', userId: '2024-00123', equipmentId: 'eq-1', quantity: 1, purpose: 'Class', pickupDate: '2026-06-03T11:27', returnDate: '2026-06-05T11:24', status: 'return_pending', requestDate: '2026-06-03T11:24' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<AppState['currentView']>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [requests, setRequests] = useState<BorrowRequest[]>(initialRequests);

  const login = (user: User) => {
    setCurrentUser(user);
    setView(user.role === 'admin' ? 'admin_dashboard' : 'borrower_dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  const registerUser = (user: User) => {
    setUsers([...users, user]);
    setView('landing');
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
  };

  const addEquipment = (newEq: Equipment) => {
    const existingIndex = equipment.findIndex(e => e.name.toLowerCase() === newEq.name.toLowerCase() && e.category === newEq.category);
    if (existingIndex >= 0) {
      const updatedEq = [...equipment];
      updatedEq[existingIndex] = {
        ...updatedEq[existingIndex],
        total: updatedEq[existingIndex].total + newEq.total,
        available: updatedEq[existingIndex].available + newEq.available,
      };
      setEquipment(updatedEq);
    } else {
      setEquipment([...equipment, newEq]);
    }
  };

  const submitBorrowRequest = (request: BorrowRequest) => {
    setRequests([request, ...requests]);
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
    
    // Auto update equipment counts based on request status changes
    const req = requests.find(r => r.id === requestId);
    if (req) {
      if (status === 'approved') {
        setEquipment(equipment.map(e => 
          e.id === req.equipmentId 
            ? { ...e, available: e.available - req.quantity, borrowed: e.borrowed + req.quantity } 
            : e
        ));
      } else if (status === 'returned') {
        setEquipment(equipment.map(e => 
          e.id === req.equipmentId 
            ? { ...e, available: e.available + req.quantity, borrowed: e.borrowed - req.quantity } 
            : e
        ));
      }
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setView,
      currentUser, login, logout,
      users, registerUser, updateUserStatus,
      equipment, addEquipment,
      requests, submitBorrowRequest, updateRequestStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
