import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Tasbih } from './models/tasbih.model';
import { Observable } from 'rxjs';
import { OfflineService } from './offline.service';
import { WirdService } from './wird.service';
import { BlocService } from './bloc.service';

const TASBIH_DB = 'tasbih';
@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  private db: any;
  private _tasbihs : BehaviorSubject<any> = new BehaviorSubject([])
  private _localTasbihs : BehaviorSubject<any> = new BehaviorSubject([])

  constructor(private supabase: SupabaseService, private blocService: BlocService, private localDB: OfflineService, private wirdService : WirdService) {
    this.db = this.supabase.connect();
    this.syncTasbihs()
    this.handleChange()
   }

   async loadTasbihs() {
    const query = await this.db.from(TASBIH_DB).select('*, wirds(*), community(*)').eq('communityId', 3);
    console.log("🚀 ~ OnlineService ~ loadTasbihs ~ query:", query.data)
    this._tasbihs.next(query.data);
  }

  handleChange() {
    this.db
    .channel('tasbihs-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TASBIH_DB },
      (payload: any) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          const newTasbihs: Tasbih = payload.new;
          this._tasbihs.next([...this._tasbihs.value, newTasbihs]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedTasbihs: Tasbih = payload.new;
          const index = this._tasbihs.value.findIndex(
            (tasbih: { id: number | undefined }) =>
              tasbih.id === updatedTasbihs.id
          );
          if (index !== -1) {
            // Mettre à jour le Tasbihs dans le tableau
            const updatedTasbihss = [...this._tasbihs.value];
            updatedTasbihss[index] = updatedTasbihs;
            this._tasbihs.next(updatedTasbihs);
          }
        } else if (payload.eventType === 'DELETE') {
          const oldTasbihs: Tasbih = payload.old;
          const newValue = this._tasbihs.value.filter(
            (item: { id: any }) => oldTasbihs.id != item.id
          );
          this._tasbihs.next(newValue);
        }
        this.syncTasbihs()
      }
    )
    .subscribe();
  }

  async syncTasbihs(): Promise<void> {
    try {
      await this.loadTasbihs()
      const onlineTasbihs = this._tasbihs.value;
      console.log("🚀 ~ OnlineTasbihsService ~ syncTasbihs ~ onlineTasbihs:", onlineTasbihs)
      await this.localDB.cleanTasbihsDB();
      for (let index = 0; index < onlineTasbihs.length; index++) {
        const Tasbihs = onlineTasbihs[index];
        await this.localDB.storeTasbihsLocally([Tasbihs]);
      }
      this.loadLocalTasbihs();

    } catch (error) {
      console.error(
        'Erreur inattendue lors de la synchronisation des Tasbihs :',
        error
      );
    }
  }

  async loadLocalTasbihs() {
    const localPatients = await this.localDB.getTasbihsLocally();
    console.log("🚀 ~ TasbihsService ~ loadLocalTasbihs ~ localPatients:", localPatients)
    this._localTasbihs.next(localPatients)
  }
  get localTasbihs(): Observable<Tasbih[]>{
    return this._localTasbihs.asObservable();
  }

}
