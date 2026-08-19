import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Equipment, BorrowRequest, RequestStatus } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  writeBatch,
  getDocs 
} from 'firebase/firestore';

interface AppContextType extends AppState {
  setView: (view: AppState['currentView']) => void;
  login: (user: User) => void;
  logout: () => void;
  registerUser: (user: User) => Promise<void>;
  updateUserStatus: (userId: string, status: User['status']) => Promise<void>;
  addEquipment: (equipment: Equipment) => Promise<void>;
  submitBorrowRequest: (request: BorrowRequest) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  isSyncing: boolean;
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
  const [currentView, setCurrentView] = useState<AppState['currentView']>(() => {
    const saved = localStorage.getItem('csu_current_view') as AppState['currentView'] | null;
    return saved || 'landing';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('csu_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [requests, setRequests] = useState<BorrowRequest[]>(initialRequests);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  const setView = (view: AppState['currentView']) => {
    setCurrentView(view);
    localStorage.setItem('csu_current_view', view);
  };

  // Real-time Cloud Synchronization with Firestore
  useEffect(() => {
    let seededUsers = false;
    let seededEquipment = false;
    let seededRequests = false;

    // 1. Listen to Users Collection
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersColRef, async (snapshot) => {
      if (snapshot.empty && !seededUsers) {
        seededUsers = true;
        try {
          const batch = writeBatch(db);
          for (const u of initialUsers) {
            batch.set(doc(db, 'users', u.id), u);
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial users:', err);
        }
      } else if (!snapshot.empty) {
        const loadedUsers: User[] = [];
        snapshot.forEach((d) => {
          loadedUsers.push(d.data() as User);
        });
        setUsers(loadedUsers);

        // Keep current logged in user profile updated if changed on another device
        if (currentUser) {
          const updatedProfile = loadedUsers.find(u => u.id === currentUser.id);
          if (updatedProfile) {
            setCurrentUser(updatedProfile);
            localStorage.setItem('csu_current_user', JSON.stringify(updatedProfile));
          }
        }
      }
      setIsSyncing(false);
    }, (err) => {
      console.warn('Users sync warning (using local state fallback):', err);
      setIsSyncing(false);
    });

    // 2. Listen to Equipment Collection
    const equipmentColRef = collection(db, 'equipment');
    const unsubEquipment = onSnapshot(equipmentColRef, async (snapshot) => {
      if (snapshot.empty && !seededEquipment) {
        seededEquipment = true;
        try {
          const batch = writeBatch(db);
          for (const eq of initialEquipment) {
            batch.set(doc(db, 'equipment', eq.id), eq);
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial equipment:', err);
        }
      } else if (!snapshot.empty) {
        const loadedEquipment: Equipment[] = [];
        snapshot.forEach((d) => {
          loadedEquipment.push(d.data() as Equipment);
        });
        setEquipment(loadedEquipment);
      }
    }, (err) => {
      console.warn('Equipment sync warning:', err);
    });

    // 3. Listen to Requests Collection
    const requestsColRef = collection(db, 'requests');
    const unsubRequests = onSnapshot(requestsColRef, async (snapshot) => {
      if (snapshot.empty && !seededRequests) {
        seededRequests = true;
        try {
          const batch = writeBatch(db);
          for (const r of initialRequests) {
            batch.set(doc(db, 'requests', r.id), r);
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding initial requests:', err);
        }
      } else if (!snapshot.empty) {
        const loadedRequests: BorrowRequest[] = [];
        snapshot.forEach((d) => {
          loadedRequests.push(d.data() as BorrowRequest);
        });
        // Sort newest first
        loadedRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setRequests(loadedRequests);
      }
    }, (err) => {
      console.warn('Requests sync warning:', err);
    });

    return () => {
      unsubUsers();
      unsubEquipment();
      unsubRequests();
    };
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('csu_current_user', JSON.stringify(user));
    const targetView = user.role === 'admin' ? 'admin_dashboard' : 'borrower_dashboard';
    setView(targetView);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('csu_current_user');
    setView('landing');
  };

  const registerUser = async (user: User) => {
    // Update local state immediately for fast feedback
    setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    
    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (err) {
      console.error('Failed to save user to Firestore:', err);
    }
  };

  const updateUserStatus = async (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    try {
      await updateDoc(doc(db, 'users', userId), { status });
    } catch (err) {
      console.error('Failed to update user status in Firestore:', err);
    }
  };

  const addEquipment = async (newEq: Equipment) => {
    const existing = equipment.find(
      e => e.name.toLowerCase() === newEq.name.toLowerCase() && e.category.toLowerCase() === newEq.category.toLowerCase()
    );

    if (existing) {
      const updatedTotal = existing.total + newEq.total;
      const updatedAvailable = existing.available + newEq.available;
      const updatedInRepair = existing.inRepair + newEq.inRepair;
      const updatedDamaged = existing.damaged + newEq.damaged;

      setEquipment(prev => prev.map(e => e.id === existing.id ? {
        ...e,
        total: updatedTotal,
        available: updatedAvailable,
        inRepair: updatedInRepair,
        damaged: updatedDamaged,
      } : e));

      try {
        await updateDoc(doc(db, 'equipment', existing.id), {
          total: updatedTotal,
          available: updatedAvailable,
          inRepair: updatedInRepair,
          damaged: updatedDamaged,
          lastChecked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        console.error('Failed to update equipment in Firestore:', err);
      }
    } else {
      setEquipment(prev => [...prev, newEq]);
      try {
        await setDoc(doc(db, 'equipment', newEq.id), newEq);
      } catch (err) {
        console.error('Failed to add equipment to Firestore:', err);
      }
    }
  };

  const submitBorrowRequest = async (request: BorrowRequest) => {
    setRequests(prev => [request, ...prev]);
    try {
      await setDoc(doc(db, 'requests', request.id), request);
    } catch (err) {
      console.error('Failed to submit borrow request to Firestore:', err);
    }
  };

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    const req = requests.find(r => r.id === requestId);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));

    try {
      await updateDoc(doc(db, 'requests', requestId), { status });

      if (req) {
        const targetEq = equipment.find(e => e.id === req.equipmentId);
        if (targetEq) {
          if (status === 'approved') {
            const newAvail = Math.max(0, targetEq.available - req.quantity);
            const newBorrowed = targetEq.borrowed + req.quantity;
            setEquipment(prev => prev.map(e => e.id === targetEq.id ? { ...e, available: newAvail, borrowed: newBorrowed } : e));
            await updateDoc(doc(db, 'equipment', targetEq.id), {
              available: newAvail,
              borrowed: newBorrowed
            });
          } else if (status === 'returned') {
            const newAvail = targetEq.available + req.quantity;
            const newBorrowed = Math.max(0, targetEq.borrowed - req.quantity);
            setEquipment(prev => prev.map(e => e.id === targetEq.id ? { ...e, available: newAvail, borrowed: newBorrowed } : e));
            await updateDoc(doc(db, 'equipment', targetEq.id), {
              available: newAvail,
              borrowed: newBorrowed
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to update request status in Firestore:', err);
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setView,
      currentUser, login, logout,
      users, registerUser, updateUserStatus,
      equipment, addEquipment,
      requests, submitBorrowRequest, updateRequestStatus,
      isSyncing
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
