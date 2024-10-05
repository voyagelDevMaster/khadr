import { Injectable } from '@angular/core';
import { Wird } from './models/tasbih.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SupabaseService } from './supabase.service';
import { Observable } from 'rxjs';

const WIRD_DB = 'wirds';
@Injectable({
  providedIn: 'root'
})
export class WirdService {
  private dbPromise: Promise<IDBDatabase>;
  private db: any;
  private _wirds : BehaviorSubject<any> = new BehaviorSubject([])
  constructor(private supabase: SupabaseService,) {
    this.dbPromise = this.initIndexedDB();
    this.db = this.supabase.connect();
    this.syncWirds();
    this.wirdChange()
  }
  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('wirdDB', 1);
      request.onerror = (event) => {
        console.error('IndexedDB Error:', event);
        reject(event);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore('wirds', { keyPath: 'id' });
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }

  async loadwirds() {
    const query = await this.db.from(WIRD_DB).select('*, tasbih(*)').eq('communityId', 3);
    console.log("🚀 ~ WirdService ~ loadwirds ~  const query:",  query.data)
    this._wirds.next(query.data);
  }

  get localWird(): Observable<Wird[]> {
    return this._wirds.asObservable();
 }
  cleanwirdsDB(){
    return this.dbPromise.then((db) => {
      const tx = db.transaction('wirds', 'readwrite');
      const store = tx.objectStore('wirds');
      store.clear();
    });
  }
  wirdChange() {
    this.db
    .channel('Wirds-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: WIRD_DB },
      (payload: any) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          const newWirds: Wird = payload.new;
          this._wirds.next([...this._wirds.value, newWirds]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedWirds: Wird = payload.new;
          const index = this._wirds.value.findIndex(
            (Wird: { id: number | undefined }) =>
              Wird.id === updatedWirds.id
          );
          if (index !== -1) {
            // Mettre à jour le Wirds dans le tableau
            const updatedWirds = [...this._wirds.value];
            updatedWirds[index] = updatedWirds;
            this._wirds.next(updatedWirds);
          }
        } else if (payload.eventType === 'DELETE') {
          const oldWirds: Wird = payload.old;
          const newValue = this._wirds.value.filter(
            (item: { id: any }) => oldWirds.id != item.id
          );
          this._wirds.next(newValue);
        }
        this.syncWirds()
      }
    )
    .subscribe();
  }

  async syncWirds(): Promise<void> {
    try {
      await this.loadwirds()
      const onlineWirds = this._wirds.value;
      console.log("🚀 ~ OnlineWirdsService ~ syncWirds ~ onlineWirds:", onlineWirds)
      await this.cleanwirdsDB();
      for (let index = 0; index < onlineWirds.length; index++) {
        const Wirds = onlineWirds[index];
        await this.storewirdsLocally([Wirds]);
      }
    } catch (error) {
      console.error(
        'Erreur inattendue lors de la synchronisation des Wirds :',
        error
      );
    }
  }
  storewirdsLocally(wirds: Wird[]): Promise<void> {
    return this.dbPromise.then((db) => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('wirds', 'readwrite');
        const store = tx.objectStore('wirds');
        Promise.all(
          wirds.map((wird) => {
            return new Promise((res, rej) => {
              const request = store.put(wird);
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
  getwirds(): Promise<Wird[]> {
    return this.dbPromise.then(db => {
      const tx = db.transaction('wirds', 'readonly');
      const store = tx.objectStore('wirds');
      return new Promise<Wird[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error('IndexedDB Error fetching wirds:', event);
          reject(event);
        };
      });
    });
  }
  async searchById(id: number): Promise<Wird | undefined> {
    console.log("🚀 ~ WirdService ~ searchById ~ id:", id)
    await this.syncWirds()
    return this.dbPromise.then(db => {
      const tx = db.transaction('wirds', 'readonly');
      const store = tx.objectStore('wirds');
      return new Promise<Wird | undefined>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`IndexedDB Error fetching wirds ${id}:`, event);
          reject(event);
        };
      });
    });
  }
  async searchByTasbihOrdered(tasbih_id: number): Promise<Wird[]> {
    await this.syncWirds(); // Synchronize before fetching data

    return this.dbPromise.then((db) => {
      const tx = db.transaction('wirds', 'readonly');
      const store = tx.objectStore('wirds');

      return new Promise<Wird[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const request = store.getAll();
          console.log("🚀 ~ WirdService ~ returnthis.dbPromise.then ~ request:", request)
          const wirds = request.result
          // Sort the wirds by numOrder
          const sortedWirds = wirds.sort((a, b) => a.numOrder - b.numOrder);
          resolve(sortedWirds);
        };
        request.onerror = (event) => {
          console.error('IndexedDB Error fetching wirds:', event);
          reject(event);
        };
      });
    });
  }

  async searchByWird(tasbih_id: number): Promise<Wird[]> {
    console.log("🚀 ~ WirdService ~ searchByWird ~ tasbih_id:", tasbih_id)
    const wird: Wird[] = await this.getwirds();
    return wird.filter(wird => wird.tasbih_id === tasbih_id);
  }
}
