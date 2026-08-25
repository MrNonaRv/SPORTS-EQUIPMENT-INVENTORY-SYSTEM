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
  updateUserDetails: (userId: string, updates: Partial<User>) => Promise<void>;
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
  // Basketball Category Items
  { id: 'eq-1', name: 'Basketball (Official Size 7)', category: 'Basketball', total: 10, available: 7, borrowed: 2, inRepair: 1, damaged: 0, location: 'Storage Rack Segment A-1', lastChecked: 'Aug 24, 08:00' },
  { id: 'eq-bb-net', name: 'Basketball Heavy-Duty Net (Pair)', category: 'Basketball', total: 6, available: 5, borrowed: 1, inRepair: 0, damaged: 0, location: 'Storage Rack Segment A-1', lastChecked: 'Aug 24, 08:15' },
  { id: 'eq-bb-cones', name: 'Training Cones (Set of 6)', category: 'Basketball', total: 8, available: 6, borrowed: 2, inRepair: 0, damaged: 0, location: 'Shelf Tier 1', lastChecked: 'Aug 24, 08:30' },
  { id: 'eq-bb-whistle', name: 'Fox 40 Referee Whistle & Lanyard', category: 'Basketball', total: 12, available: 10, borrowed: 2, inRepair: 0, damaged: 0, location: 'Drawer Suite D-1', lastChecked: 'Aug 24, 08:45' },
  { id: 'eq-bb-jerseys', name: 'Practice Scrimmage Vests (Set of 5)', category: 'Basketball', total: 6, available: 4, borrowed: 2, inRepair: 0, damaged: 0, location: 'Locker Suite B', lastChecked: 'Aug 24, 09:00' },

  // Badminton Category Items
  { id: 'eq-4', name: 'Badminton Racket (Carbon Pro)', category: 'Badminton', total: 16, available: 11, borrowed: 4, inRepair: 1, damaged: 0, location: 'Wall Basket C', lastChecked: 'Aug 24, 08:00' },
  { id: 'eq-5', name: 'Shuttlecock Tube (12 pcs Nylon)', category: 'Badminton', total: 14, available: 10, borrowed: 0, inRepair: 0, damaged: 4, location: 'Shelf Tier 2', lastChecked: 'Aug 24, 08:15' },
  { id: 'eq-bad-net', name: 'Tournament Badminton Net', category: 'Badminton', total: 6, available: 4, borrowed: 2, inRepair: 0, damaged: 0, location: 'Wall Basket C', lastChecked: 'Aug 24, 08:30' },
  { id: 'eq-bad-grip', name: 'Badminton Replacement Grip (Pack of 3)', category: 'Badminton', total: 10, available: 8, borrowed: 2, inRepair: 0, damaged: 0, location: 'Drawer Suite D-2', lastChecked: 'Aug 24, 09:00' },

  // Volleyball Category Items
  { id: 'eq-2', name: 'Volleyball (Official Leather)', category: 'Volleyball', total: 8, available: 5, borrowed: 2, inRepair: 1, damaged: 0, location: 'Storage Rack Segment A-2', lastChecked: 'Aug 24, 06:45' },
  { id: 'eq-vb-net', name: 'Competition Volleyball Net', category: 'Volleyball', total: 5, available: 4, borrowed: 1, inRepair: 0, damaged: 0, location: 'Storage Rack Segment A-2', lastChecked: 'Aug 24, 07:00' },
  { id: 'eq-vb-kneepads', name: 'Sports Knee Pads (Pair)', category: 'Volleyball', total: 10, available: 7, borrowed: 3, inRepair: 0, damaged: 0, location: 'Shelf Tier 3', lastChecked: 'Aug 24, 07:15' },
  { id: 'eq-vb-pump', name: 'Ball Air Hand Pump & Pressure Gauge', category: 'Volleyball', total: 6, available: 5, borrowed: 1, inRepair: 0, damaged: 0, location: 'Drawer Suite D-1', lastChecked: 'Aug 24, 07:30' },

  // Football / Soccer Category Items
  { id: 'eq-3', name: 'Soccer / Football (Match Size 5)', category: 'Football', total: 8, available: 5, borrowed: 2, inRepair: 1, damaged: 0, location: 'Locker Suite B', lastChecked: 'Aug 24, 07:00' },
  { id: 'eq-soc-net', name: 'Soccer Goal Net (Pair)', category: 'Football', total: 4, available: 3, borrowed: 1, inRepair: 0, damaged: 0, location: 'Locker Suite B', lastChecked: 'Aug 24, 07:15' },
  { id: 'eq-soc-ladder', name: 'Speed & Agility Footwork Ladder', category: 'Football', total: 6, available: 5, borrowed: 1, inRepair: 0, damaged: 0, location: 'Shelf Tier 2', lastChecked: 'Aug 24, 07:30' },
  { id: 'eq-soc-shin', name: 'Protective Shin Guards (Pair)', category: 'Football', total: 10, available: 8, borrowed: 2, inRepair: 0, damaged: 0, location: 'Locker Suite B', lastChecked: 'Aug 24, 07:45' },

  // Table Tennis Category Items
  { id: 'eq-6', name: 'Table Tennis Paddle / Bat', category: 'Table Tennis', total: 12, available: 8, borrowed: 3, inRepair: 1, damaged: 0, location: 'Drawer Suite D-3', lastChecked: 'Aug 24, 08:30' },
  { id: 'eq-tt-balls', name: '3-Star Table Tennis Balls (Pack of 6)', category: 'Table Tennis', total: 15, available: 12, borrowed: 3, inRepair: 0, damaged: 0, location: 'Drawer Suite D-3', lastChecked: 'Aug 24, 08:45' },
  { id: 'eq-tt-net', name: 'Retractable Table Tennis Post & Net', category: 'Table Tennis', total: 6, available: 5, borrowed: 1, inRepair: 0, damaged: 0, location: 'Drawer Suite D-3', lastChecked: 'Aug 24, 09:00' },

  // Sepak Takraw Category Items
  { id: 'eq-st-ball', name: 'Sepak Takraw Synthetic Ball', category: 'Sepak Takraw', total: 8, available: 6, borrowed: 2, inRepair: 0, damaged: 0, location: 'Storage Rack Segment C', lastChecked: 'Aug 24, 08:00' },
  { id: 'eq-st-net', name: 'Sepak Takraw Regulation Net', category: 'Sepak Takraw', total: 4, available: 3, borrowed: 1, inRepair: 0, damaged: 0, location: 'Storage Rack Segment C', lastChecked: 'Aug 24, 08:15' },

  // Chess Category Items
  { id: 'eq-7', name: 'Tournament Chess Set & Roll-up Board', category: 'Chess', total: 10, available: 8, borrowed: 2, inRepair: 0, damaged: 0, location: 'Shelf Tier 1', lastChecked: 'Aug 24, 09:00' },
  { id: 'eq-chess-clock', name: 'Digital Chess Clock & Timer', category: 'Chess', total: 6, available: 5, borrowed: 1, inRepair: 0, damaged: 0, location: 'Shelf Tier 1', lastChecked: 'Aug 24, 09:15' },

  // Boxing & Combat Category Items
  { id: 'eq-8', name: 'Boxing Gloves (Pair - 12oz)', category: 'Boxing', total: 12, available: 5, borrowed: 6, inRepair: 1, damaged: 0, location: 'Locker Suite A', lastChecked: 'Aug 24, 09:15' },
  { id: 'eq-box-mitts', name: 'Curved Focus Punching Mitts (Pair)', category: 'Boxing', total: 6, available: 4, borrowed: 2, inRepair: 0, damaged: 0, location: 'Locker Suite A', lastChecked: 'Aug 24, 09:30' },
  { id: 'eq-box-rope', name: 'Weighted Speed Jump Rope', category: 'Boxing', total: 10, available: 8, borrowed: 2, inRepair: 0, damaged: 0, location: 'Shelf Tier 2', lastChecked: 'Aug 24, 09:45' },

  // --- NEWLY IMPORTED INVENTORY FROM DOCUMENT ---
  // Badminton
  { id: 'eq-doc-bad-1', name: 'Shuttlecock Feathers (RSL Silver, Tube)', category: 'Badminton', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-2', name: 'Plastic Shuttle (Yonex Mavis 10)', category: 'Badminton', total: 0, available: 0, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-3', name: 'Badminton Racket (28lbs max, 80g)', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-4', name: 'Badminton Over Grip', category: 'Badminton', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-5', name: 'Badminton Net', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Sepak Takraw
  { id: 'eq-doc-st-1', name: 'Takraw Ball (Men)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-2', name: 'Takraw Ball (Women)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-3', name: 'Takraw Net', category: 'Sepak Takraw', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Volleyball
  { id: 'eq-doc-vb-1', name: 'Volleyball Net', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-2', name: 'Volleyball', category: 'Volleyball', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-3', name: 'Kneepad & Elbow pad', category: 'Volleyball', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-4', name: 'Volleyball Posts', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-5', name: 'Volleyball Antennae', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Basketball
  { id: 'eq-doc-bb-1', name: 'Basketball', category: 'Basketball', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-2', name: 'Basketball Ring', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-3', name: 'Basketball Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-4', name: 'Basketball Ring Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-5', name: 'Basketball Fiberglass Board', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

  // Tournament Chess
  { id: 'eq-doc-ch-1', name: 'Chessboard', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-ch-2', name: 'Chess Mat', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },

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

        // Ensure newly expanded categorized equipment items are synced to Firestore
        const existingIds = new Set(loadedEquipment.map(e => e.id));
        const missingInitial = initialEquipment.filter(e => !existingIds.has(e.id));
        if (missingInitial.length > 0 && !seededEquipment) {
          seededEquipment = true;
          try {
            const batch = writeBatch(db);
            for (const eq of missingInitial) {
              batch.set(doc(db, 'equipment', eq.id), eq);
            }
            batch.commit().catch(e => console.warn('Non-blocking batch commit error:', e));
          } catch (err) {
            console.warn('Supplementing initial equipment warning:', err);
          }
        }

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
              const newAvail = targetEq.available + item.quantity;
              const newBorrowed = Math.max(0, targetEq.borrowed - item.quantity);
              setEquipment(prev => prev.map(e => e.id === targetEq.id ? { ...e, available: newAvail, borrowed: newBorrowed } : e));
              await updateDoc(doc(db, 'equipment', targetEq.id), {
                available: newAvail,
                borrowed: newBorrowed
              });
            }
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
      users, registerUser, updateUserStatus, updateUserDetails,
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
