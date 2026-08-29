import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

const initialEquipment = [
  { id: 'eq-doc-bad-1', name: 'Shuttlecock Feathers (RSL Silver, Tube)', category: 'Badminton', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-2', name: 'Plastic Shuttle (Yonex Mavis 10)', category: 'Badminton', total: 0, available: 0, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-3', name: 'Badminton Racket (28lbs max, 80g)', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-4', name: 'Badminton Over Grip', category: 'Badminton', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bad-5', name: 'Badminton Net', category: 'Badminton', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-1', name: 'Takraw Ball (Men)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-2', name: 'Takraw Ball (Women)', category: 'Sepak Takraw', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-st-3', name: 'Takraw Net', category: 'Sepak Takraw', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-1', name: 'Volleyball Net', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-2', name: 'Volleyball', category: 'Volleyball', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-3', name: 'Kneepad & Elbow pad', category: 'Volleyball', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-4', name: 'Volleyball Posts', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-vb-5', name: 'Volleyball Antennae', category: 'Volleyball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-1', name: 'Basketball', category: 'Basketball', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-2', name: 'Basketball Ring', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-3', name: 'Basketball Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-4', name: 'Basketball Ring Net', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-bb-5', name: 'Basketball Fiberglass Board', category: 'Basketball', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-ch-1', name: 'Chessboard', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-ch-2', name: 'Chess Mat', category: 'Chess', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
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
  { id: 'eq-doc-tt-1', name: 'Pingpong Table', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-2', name: 'Table Tennis Racket', category: 'Table Tennis', total: 4, available: 4, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-3', name: 'Table Tennis Net Pole Set', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-tt-4', name: 'Table Tennis Balls (Box)', category: 'Table Tennis', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-1', name: 'Masking Tape', category: 'Office Supplies', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-2', name: 'Bond Paper (Ream)', category: 'Office Supplies', total: 3, available: 3, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-3', name: 'Stapler', category: 'Office Supplies', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-off-4', name: 'Stapler Wire (Box)', category: 'Office Supplies', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-ath-1', name: 'Spike Shoes (Pairs)', category: 'Athletics', total: 2, available: 2, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-arn-1', name: 'Head Gear', category: 'Arnis', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-arn-2', name: 'Body Gear', category: 'Arnis', total: 1, available: 1, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' },
  { id: 'eq-doc-arn-3', name: 'Arnis Stick', category: 'Arnis', total: 5, available: 5, borrowed: 0, inRepair: 0, damaged: 0, location: 'Storage', lastChecked: 'Aug 24' }
];

async function restore() {
  const batch = writeBatch(db);
  for (const eq of initialEquipment) {
    batch.set(doc(db, 'equipment', eq.id), eq);
  }
  await batch.commit();
  console.log('Restored equipment');
}

restore().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(console.error);
