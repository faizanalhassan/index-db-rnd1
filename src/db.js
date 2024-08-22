import {openDB} from 'idb';
export const TOTAL_DOCS = 20_000;
const dbPromise = openDB('my-database', 2, {
    upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            if (!db.objectStoreNames.contains('documents')) {
                db.createObjectStore('documents', {keyPath: 'id'});
            }
        }
        if (oldVersion < 2) {
            debugger;
            db.deleteObjectStore('documents');
            const store = db.createObjectStore('documents', {keyPath: 'id'});
            store.createIndex('scannables', 'scannables', {multiEntry: true});

        }

    },
});

export const addDocuments = async (documents) => {
    const db = await dbPromise;
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    documents.forEach((doc) => store.put(doc));
    await tx.done;
};


export const getAllDocuments = async () => {
    const db = await dbPromise;
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const allDocs = await store.getAll();
    await tx.done;
    return allDocs;
};


export const updateDocumentsWithScannables = async () => {
    const db = await dbPromise;
    const tx = db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    const allDocs = await store.getAll();
    const possibleValues = new Array(10).fill('prod').map((v, i) => `${v}-${i + 1}`);
    allDocs.forEach((doc) => {
        const scannables = [];
        const numberOfItems = Math.floor(Math.random() * possibleValues.length) + 1;
        while (scannables.length < numberOfItems) {
            const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            if (!scannables.includes(randomValue)) {
                scannables.push(randomValue);
            }
        }
        doc.scannables = scannables;
        store.put(doc);
    });
    await tx.done;
    console.log('All documents updated with scannables.');
}
export const clearAllDocuments = async () => {
  const db = await dbPromise;
  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  store.clear(); // Clear all documents
  await tx.done;
  console.log('All documents cleared.');
};

export const generateDocuments = () => {
  const documents = [];
  const possibleValues = ['prod1', 'prod2', 'prod3', 'prod4', 'prod5', 'prod6', 'prod7', 'prod8', 'prod9', 'prod10'];

  for (let i = 0; i < 20000; i++) {
    const doc = { id: i };
    for (let j = 0; j < 50; j++) {
      doc[`property${j + 1}`] = `Value ${j + 1}`;
    }

    // Generate a random array of scannables
    const scannables = [];
    const numberOfItems = Math.floor(Math.random() * 10) + 1;

    while (scannables.length < numberOfItems) {
      const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
      if (!scannables.includes(randomValue)) {
        scannables.push(randomValue);
      }
    }

    doc.scannables = scannables; // Add scannables to the document
    documents.push(doc);
  }

  return documents;
};
