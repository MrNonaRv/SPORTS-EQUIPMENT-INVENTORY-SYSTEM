import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

async function checkDb() {
  const querySnapshot = await getDocs(collection(db, 'equipment'));
  let totalUnits = 0;
  for (const document of querySnapshot.docs) {
    const data = document.data();
    console.log(`${document.id} - ${data.name} - ${data.total}`);
    totalUnits += data.total;
  }
  console.log(`\nTotal items: ${querySnapshot.size}, Total Units: ${totalUnits}`);
  process.exit(0);
}

checkDb();
