'use client';

const DB_NAME = 'GTC_OfflineDB';
const DB_VERSION = 1;
const QUIZZES_STORE_NAME = 'quizzes';

interface IDBRequestPromise<T> extends IDBRequest<T> {
  then<U>(onSuccess: (value: T) => U, onReject?: (reason: any) => any): Promise<U>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUIZZES_STORE_NAME)) {
        db.createObjectStore(QUIZZES_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveQuizLocally(quiz: any): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(QUIZZES_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(QUIZZES_STORE_NAME);
    store.put(quiz);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du quiz localement:', error);
  }
}

export async function getQuizLocally(quizId: string): Promise<any | undefined> {
  try {
    const db = await openDB();
    const transaction = db.transaction(QUIZZES_STORE_NAME, 'readonly');
    const store = transaction.objectStore(QUIZZES_STORE_NAME);
    const request = store.get(quizId);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Erreur lors du chargement du quiz local:', error);
    return undefined;
  }
}


export async function getAllLocalQuizzes(): Promise<any[]> {
    try {
        const db = await openDB();
        const transaction = db.transaction(QUIZZES_STORE_NAME, 'readonly');
        const store = transaction.objectStore(QUIZZES_STORE_NAME);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                console.error("Erreur lors de la récupération des quiz locaux:", request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error("Impossible d'ouvrir la base de données locale:", error);
        return [];
    }
}
