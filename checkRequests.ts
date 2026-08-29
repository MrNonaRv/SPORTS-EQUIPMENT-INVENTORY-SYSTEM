import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

async function check() {
  const reqSnapshot = await getDocs(collection(db, 'requests'));
  console.log(`Found ${reqSnapshot.size} requests.`);
  
  if (reqSnapshot.size > 0) {
    const batch = writeBatch(db);
    reqSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log("Deleted the remaining requests.");
  }
}

check().then(() => {
  console.log('Done');
  process.exit(0);
}).catch(console.error);
