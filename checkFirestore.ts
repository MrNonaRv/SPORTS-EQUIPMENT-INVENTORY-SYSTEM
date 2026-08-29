import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId) 
  : initializeFirestore(app, { experimentalForceLongPolling: true });

async function clear() {
  const reqSnapshot = await getDocs(collection(db, 'requests'));
  console.log(`Found ${reqSnapshot.size} requests.`);
  if (reqSnapshot.size > 0) {
    const batch = writeBatch(db);
    reqSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log("Deleted requests");
  }
}

clear().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(console.error);
