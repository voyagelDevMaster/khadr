import { Injectable } from '@angular/core';
import { Tasbih } from './models/tasbih.model';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private dbPromise: Promise<IDBDatabase>;
  constructor() {
    this.dbPromise = this.initIndexedDB();
  }
  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tasbihDB', 1);
      request.onerror = (event) => {
        console.error('IndexedDB Error:', event);
        reject(event);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore('tasbihs', { keyPath: 'id' });
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  cleanTasbihsDB(){
    return this.dbPromise.then((db) => {
      const tx = db.transaction('tasbihs', 'readwrite');
      const store = tx.objectStore('tasbihs');
      store.clear();
    });
  }

  storeTasbihsLocally(tasbihs: Tasbih[]): Promise<void> {
    return this.dbPromise.then((db) => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('tasbihs', 'readwrite');
        const store = tx.objectStore('tasbihs');
        Promise.all(
          tasbihs.map((tasbih) => {
            return new Promise((res, rej) => {
              const request = store.put(tasbih);
              request.onsuccess = res;
              request.onerror = rej;
            });
          })
        )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }
  getTasbihsLocally(): Promise<Tasbih[]> {
    return this.dbPromise.then(db => {
      const tx = db.transaction('tasbihs', 'readonly');
      const store = tx.objectStore('tasbihs');
      return new Promise<Tasbih[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error('IndexedDB Error fetching tasbihs:', event);
          reject(event);
        };
      });
    });
  }
  searchById(id: number): Promise<Tasbih | undefined> {
    return this.dbPromise.then(db => {
      const tx = db.transaction('tasbihs', 'readonly');
      const store = tx.objectStore('tasbihs');
      return new Promise<Tasbih | undefined>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`IndexedDB Error fetching tasbihs ${id}:`, event);
          reject(event);
        };
      });
    });
  }

  async searchByCommunity(communityId: number): Promise<Tasbih[]> {
    const tasbihs: Tasbih[] = await this.getTasbihsLocally();
    return tasbihs.filter(tasbih => tasbih.communityId === communityId);
  }
}
