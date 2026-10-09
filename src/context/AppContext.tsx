import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Equipment, BorrowRequest, RequestStatus, ArrivalRecord } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  writeBatch,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

interface AppContextType extends AppState {
  arrivalRecords: ArrivalRecord[];
  setView: (view: AppState['currentView']) => void;
  login: (user: User) => void;
  logout: () => void;
  registerUser: (user: User) => Promise<void>;
  updateUserStatus: (userId: string, status: User['status']) => Promise<void>;
  updateUserDetails: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearAllUsers: () => Promise<void>;
  addEquipment: (equipment: Equipment) => Promise<void>;
  deleteEquipment: (equipmentId: string) => Promise<void>;
  submitBorrowRequest: (request: BorrowRequest) => Promise<void>;
  updateRequestStatus: (requestId: string, status: RequestStatus, returnCondition?: 'Good' | 'Damaged') => Promise<void>;
  deleteRequest: (requestId: string) => Promise<void>;
  clearAllRequests: () => Promise<void>;
  clearActiveBorrowers: () => Promise<void>;
  addArrivalRecord: (record: ArrivalRecord) => Promise<void>;
  deleteArrivalRecord: (recordId: string) => Promise<void>;
  clearArrivalRecords: () => Promise<void>;
  clearData: () => Promise<boolean>;
  isSyncing: boolean;
}

const initialUsers: User[] = [
  { id: 'admin', name: 'Dr. Janice D. Ballera', role: 'admin', status: 'approved', password: 'admin' }
];

const initialEquipment: Equipment[] = [
  // Badminton
  { id: 'eq-doc-bad-1', name: 'Shuttlecock Feathers (RSL Silver, Tube)', category: 'Badminton', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Gymnasium Storage Rm A', lastChecked: 'Aug 24', description: 'Shape: Conical with rounded cork base. Color: White feathers, tan cork.' },
  { id: 'eq-doc-bad-2', name: 'Plastic Shuttle (Yonex Mavis 10)', category: 'Badminton', total: 0, available: 0, borrowed: 0, inRepair: 0, damaged: 0, location: 'Gymnasium Storage Rm A', lastChecked: 'Aug 24', description: 'Shape: Conical. Color: Neon Yellow. Material: Nylon plastic skirt.' },
  { id: 'eq-doc-bad-3', name: 'Badminton Racket (28lbs max, 80g)', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Gymnasium Storage Rm A', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-4', name: 'Badminton Over Grip', category: 'Badminton', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Gymnasium Storage Rm A', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-5', name: 'Badminton Net', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Indoor Court Locker', lastChecked: 'Aug 24' },

  // Sepak Takraw
  { id: 'eq-doc-st-1', name: 'Takraw Ball (Men)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Outdoor Court Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-2', name: 'Takraw Ball (Women)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Outdoor Court Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-3', name: 'Takraw Net', category: 'Sepak Takraw', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Outdoor Court Storage', lastChecked: 'Aug 24' },

  // Volleyball
  { id: 'eq-doc-vb-1', name: 'Volleyball Net', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-2', name: 'Volleyball', category: 'Volleyball', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-3', name: 'Kneepad & Elbow pad', category: 'Volleyball', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-4', name: 'Volleyball Posts', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-5', name: 'Volleyball Antennae', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Basketball
  { id: 'eq-doc-bb-1', name: 'Basketball', category: 'Basketball', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Main Sports Storage - Shelf 3', lastChecked: 'Aug 24', description: 'Shape: Spherical. Color: Orange with black ribs. Standard Size 7.' },
  { id: 'eq-doc-bb-2', name: 'Basketball Ring', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Main Sports Storage - Heavy Eq', lastChecked: 'Aug 24', description: 'Shape: Circular hoop. Color: Orange. Material: Heavy-duty steel.' },
  { id: 'eq-doc-bb-3', name: 'Basketball Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Main Sports Storage - Shelf 3', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-4', name: 'Basketball Ring Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Main Sports Storage - Shelf 3', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-5', name: 'Basketball Fiberglass Board', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Main Sports Storage - Heavy Eq', lastChecked: 'Aug 24' },

  // Tournament Chess
  { id: 'eq-doc-ch-1', name: 'Chessboard', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Student Lounge Cabinet', lastChecked: 'Aug 24' },
  { id: 'eq-doc-ch-2', name: 'Chess Mat', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Student Lounge Cabinet', lastChecked: 'Aug 24' },

  // Taekwondo
  { id: 'eq-doc-tk-1', name: 'Rubber Matting', category: 'Taekwondo', total: 20, available: 20, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-2', name: 'Head Gear', category: 'Taekwondo', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-3', name: 'Body Armor', category: 'Taekwondo', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-4', name: 'Arm Guard', category: 'Taekwondo', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-5', name: 'Leg Guard', category: 'Taekwondo', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-6', name: 'Gloves', category: 'Taekwondo', total: 8, available: 8, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-7', name: 'Foot Gloves', category: 'Taekwondo', total: 8, available: 8, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-8', name: 'Groin Guards (Men)', category: 'Taekwondo', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-9', name: 'Groin Guards (Women)', category: 'Taekwondo', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-10', name: 'Kicking Pad', category: 'Taekwondo', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tk-11', name: 'Powder Kick Bag', category: 'Taekwondo', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Table Tennis
  { id: 'eq-doc-tt-1', name: 'Pingpong Table', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-2', name: 'Table Tennis Racket', category: 'Table Tennis', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-3', name: 'Table Tennis Net Pole Set', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-4', name: 'Table Tennis Balls (Box)', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Office supplies
  { id: 'eq-doc-off-1', name: 'Masking Tape', category: 'Office Supplies', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-2', name: 'Bond Paper (Ream)', category: 'Office Supplies', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-3', name: 'Stapler', category: 'Office Supplies', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-4', name: 'Stapler Wire (Box)', category: 'Office Supplies', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Athletics
  { id: 'eq-doc-ath-1', name: 'Spike Shoes (Pairs)', category: 'Athletics', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Arnis
  { id: 'eq-doc-arn-1', name: 'Head Gear', category: 'Arnis', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-arn-2', name: 'Body Gear', category: 'Arnis', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-arn-3', name: 'Arnis Stick', category: 'Arnis', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' }
];

const initialRequests: BorrowRequest[] = [];

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
  const [arrivalRecords, setArrivalRecords] = useState<ArrivalRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  const setView = (view: AppState['currentView']) => {
    setCurrentView(view);
    localStorage.setItem('csu_current_view', view);
  };

  // Real-time Cloud Synchronization with Firestore
  useEffect(() => {
    let seededUsers = localStorage.getItem('csu_seeded_users') === 'true';
    let seededRequests = localStorage.getItem('csu_seeded_requests') === 'true';

    // 1. Listen to Users Collection
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersColRef, async (snapshot) => {
      if (snapshot.empty && !seededUsers) {
        seededUsers = true;
        localStorage.setItem('csu_seeded_users', 'true');
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
      if (!snapshot.empty) {
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
        localStorage.setItem('csu_seeded_requests', 'true');
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
      } else {
        setRequests([]);
      }
    }, (err) => {
      console.warn('Requests sync warning:', err);
    });

    // 4. Listen to Arrivals Collection
    const arrivalsColRef = collection(db, 'arrivals');
    const unsubArrivals = onSnapshot(arrivalsColRef, (snapshot) => {
      const loadedArrivals: ArrivalRecord[] = [];
      snapshot.forEach((d) => {
        loadedArrivals.push(d.data() as ArrivalRecord);
      });
      loadedArrivals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setArrivalRecords(loadedArrivals);
    }, (err) => {
      console.warn('Arrivals sync warning:', err);
    });

    return () => {
      unsubUsers();
      unsubEquipment();
      unsubRequests();
      unsubArrivals();
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

  const updateUserDetails = async (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('csu_current_user', JSON.stringify(updatedUser));
    }
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      console.error('Failed to update user details in Firestore:', err);
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

  const deleteEquipment = async (equipmentId: string) => {
    setEquipment(prev => prev.filter(e => e.id !== equipmentId));
    try {
      await deleteDoc(doc(db, 'equipment', equipmentId));
    } catch (err) {
      console.error('Failed to delete equipment from Firestore:', err);
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

  const updateRequestStatus = async (requestId: string, status: RequestStatus, returnCondition?: 'Good' | 'Damaged') => {
    const req = requests.find(r => r.id === requestId);
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, ...(returnCondition && { returnCondition }) } : r));

    try {
      const updateData: any = { status };
      if (returnCondition) updateData.returnCondition = returnCondition;
      await updateDoc(doc(db, 'requests', requestId), updateData);

      if (req) {
        const items = req.items && req.items.length > 0 
          ? req.items 
          : [{ equipmentId: req.equipmentId || '', quantity: req.quantity || 0 }];
          
        for (const item of items) {
          const targetEq = equipment.find(e => e.id === item.equipmentId);
          if (targetEq) {
            if (status === 'approved') {
              const newAvail = Math.max(0, targetEq.available - item.quantity);
              const newBorrowed = targetEq.borrowed + item.quantity;
              setEquipment(prev => prev.map(e => e.id === targetEq.id ? { ...e, available: newAvail, borrowed: newBorrowed } : e));
              await updateDoc(doc(db, 'equipment', targetEq.id), {
                available: newAvail,
                borrowed: newBorrowed
              });
            } else if (status === 'returned') {
              const isDamaged = req.returnCondition === 'Damaged';
              const newAvail = isDamaged ? targetEq.available : targetEq.available + item.quantity;
              const newDamaged = isDamaged ? targetEq.damaged + item.quantity : targetEq.damaged;
              const newBorrowed = Math.max(0, targetEq.borrowed - item.quantity);
              setEquipment(prev => prev.map(e => e.id === targetEq.id ? { ...e, available: newAvail, borrowed: newBorrowed, damaged: newDamaged } : e));
              await updateDoc(doc(db, 'equipment', targetEq.id), {
                available: newAvail,
                borrowed: newBorrowed,
                damaged: newDamaged
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to update request status in Firestore:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === 'admin') return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.error('Failed to delete user from Firestore:', err);
    }
  };

  const clearAllUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      userSnapshot.forEach((d) => {
        if (d.id !== 'admin') {
          batch.delete(d.ref);
        }
      });
      await batch.commit();
      setUsers(initialUsers.filter(u => u.id === 'admin'));
    } catch (err) {
      console.error('Failed to clear users from Firestore:', err);
    }
  };

  const deleteRequest = async (requestId: string) => {
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq && (targetReq.status === 'approved' || targetReq.status === 'overdue' || targetReq.status === 'return_pending')) {
      const items = targetReq.items && targetReq.items.length > 0 
        ? targetReq.items 
        : [{ equipmentId: targetReq.equipmentId || '', quantity: targetReq.quantity || 0 }];
      for (const item of items) {
        const eq = equipment.find(e => e.id === item.equipmentId);
        if (eq) {
          const newBorrowed = Math.max(0, eq.borrowed - item.quantity);
          const newAvail = Math.min(eq.total - (eq.inRepair || 0) - (eq.damaged || 0), eq.available + item.quantity);
          setEquipment(prev => prev.map(e => e.id === eq.id ? { ...e, borrowed: newBorrowed, available: newAvail } : e));
          try {
            await updateDoc(doc(db, 'equipment', eq.id), {
              borrowed: newBorrowed,
              available: newAvail
            });
          } catch (err) {
            console.error('Failed to restore equipment on request deletion:', err);
          }
        }
      }
    }
    setRequests(prev => prev.filter(r => r.id !== requestId));
    try {
      await deleteDoc(doc(db, 'requests', requestId));
    } catch (err) {
      console.error('Failed to delete request from Firestore:', err);
    }
  };

  const clearAllRequests = async () => {
    try {
      const reqSnapshot = await getDocs(collection(db, 'requests'));
      const batch = writeBatch(db);
      reqSnapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      setRequests([]);

      // Reset equipment borrowed counts
      const eqSnapshot = await getDocs(collection(db, 'equipment'));
      const eqBatch = writeBatch(db);
      eqSnapshot.forEach((d) => {
        const eqData = d.data() as Equipment;
        const available = eqData.total - (eqData.inRepair || 0) - (eqData.damaged || 0);
        eqBatch.update(d.ref, { borrowed: 0, available: Math.max(0, available) });
      });
      await eqBatch.commit();

      setEquipment(prev => prev.map(eq => ({
        ...eq,
        borrowed: 0,
        available: Math.max(0, eq.total - (eq.inRepair || 0) - (eq.damaged || 0))
      })));
    } catch (err) {
      console.error('Failed to clear all requests from Firestore:', err);
    }
  };

  const clearActiveBorrowers = async () => {
    try {
      const activeReqs = requests.filter(r => r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending');
      const batch = writeBatch(db);
      activeReqs.forEach(r => batch.delete(doc(db, 'requests', r.id)));
      await batch.commit();
      setRequests(prev => prev.filter(r => !(r.status === 'approved' || r.status === 'overdue' || r.status === 'return_pending')));

      // Reset equipment borrowed counts
      const eqSnapshot = await getDocs(collection(db, 'equipment'));
      const eqBatch = writeBatch(db);
      eqSnapshot.forEach((d) => {
        const eqData = d.data() as Equipment;
        const available = eqData.total - (eqData.inRepair || 0) - (eqData.damaged || 0);
        eqBatch.update(d.ref, { borrowed: 0, available: Math.max(0, available) });
      });
      await eqBatch.commit();

      setEquipment(prev => prev.map(eq => ({
        ...eq,
        borrowed: 0,
        available: Math.max(0, eq.total - (eq.inRepair || 0) - (eq.damaged || 0))
      })));
    } catch (err) {
      console.error('Failed to clear active borrowers from Firestore:', err);
    }
  };

  const addArrivalRecord = async (record: ArrivalRecord) => {
    setArrivalRecords(prev => [record, ...prev]);
    try {
      await setDoc(doc(db, 'arrivals', record.id), record);
    } catch (err) {
      console.error('Failed to save arrival record to Firestore:', err);
    }
  };

  const deleteArrivalRecord = async (recordId: string) => {
    setArrivalRecords(prev => prev.filter(a => a.id !== recordId));
    try {
      await deleteDoc(doc(db, 'arrivals', recordId));
    } catch (err) {
      console.error('Failed to delete arrival record from Firestore:', err);
    }
  };

  const clearArrivalRecords = async () => {
    try {
      const arrivalSnapshot = await getDocs(collection(db, 'arrivals'));
      const batch = writeBatch(db);
      arrivalSnapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      setArrivalRecords([]);
    } catch (err) {
      console.error('Failed to clear arrival records from Firestore:', err);
    }
  };

  const clearData = async () => {
    try {
      console.log('Clearing all records...');
      // 1. Clear Requests & Active Borrowers
      const reqSnapshot = await getDocs(collection(db, 'requests'));
      const reqBatch = writeBatch(db);
      reqSnapshot.forEach((d) => reqBatch.delete(d.ref));
      await reqBatch.commit();
      setRequests([]);

      // 2. Clear Users (except admin)
      const userSnapshot = await getDocs(collection(db, 'users'));
      const userBatch = writeBatch(db);
      userSnapshot.forEach((d) => {
        if (d.id !== 'admin') {
          userBatch.delete(d.ref);
        }
      });
      await userBatch.commit();
      setUsers(initialUsers.filter(u => u.id === 'admin'));

      // 3. Reset Equipment borrowed counts
      const eqSnapshot = await getDocs(collection(db, 'equipment'));
      const eqBatch = writeBatch(db);
      eqSnapshot.forEach((d) => {
        const eqData = d.data() as Equipment;
        const available = eqData.total - (eqData.inRepair || 0) - (eqData.damaged || 0);
        eqBatch.update(d.ref, { borrowed: 0, available: Math.max(0, available) });
      });
      await eqBatch.commit();
      
      setEquipment(prev => prev.map(eq => ({
        ...eq,
        borrowed: 0,
        available: Math.max(0, eq.total - (eq.inRepair || 0) - (eq.damaged || 0))
      })));

      // 4. Clear Arrivals Records
      const arrSnapshot = await getDocs(collection(db, 'arrivals'));
      const arrBatch = writeBatch(db);
      arrSnapshot.forEach((d) => arrBatch.delete(d.ref));
      await arrBatch.commit();
      setArrivalRecords([]);

      localStorage.removeItem('csu_seeded_users');
      localStorage.removeItem('csu_seeded_requests');
      return true;
    } catch (err) {
      console.error('Failed to clear data:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setView,
      currentUser, login, logout,
      users, registerUser, updateUserStatus, updateUserDetails, deleteUser, clearAllUsers,
      equipment, addEquipment, deleteEquipment,
      requests, submitBorrowRequest, updateRequestStatus, deleteRequest, clearAllRequests, clearActiveBorrowers,
      arrivalRecords, addArrivalRecord, deleteArrivalRecord, clearArrivalRecords,
      clearData,
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
