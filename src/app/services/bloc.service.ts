import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { Bloc } from './models/bloc.model';

const BLOC_BD = 'bloc';
@Injectable({
  providedIn: 'root'
})
export class BlocService {
  private db: any;
  private _blocs : BehaviorSubject<any> = new BehaviorSubject([])
  private _videoBlocs : BehaviorSubject<any> = new BehaviorSubject([])
  private _about :  BehaviorSubject<any> = new BehaviorSubject([])

  constructor(private supabase: SupabaseService) {
    this.db = this.supabase.connect();
    this.loadBlocs();
    this.handleChange()
   }

   async loadBlocs() {
    const query = await this.db.from(BLOC_BD).select('*').eq('communityId', 3).eq('type', 'texte');
    const video = await this.db.from(BLOC_BD).select('*').eq('communityId', 3).eq('type', 'video');
    const about = await this.db.from('about').select('*')
    console.log("🚀 ~ BlocService ~ loadBlocs ~ query:", query.data)
    this._blocs.next(query.data);
    this._videoBlocs.next(video.data);
    this._about.next(about.data)
  }

  handleChange() {
    this.db
    .channel('Blocs-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: BLOC_BD },
      (payload: any) => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT') {
          const newBlocs: Bloc = payload.new;
          this._blocs.next([...this._blocs.value, newBlocs]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedBlocs: Bloc = payload.new;
          const index = this._blocs.value.findIndex(
            (Bloc: { id: number | undefined }) =>
              Bloc.id === updatedBlocs.id
          );
          if (index !== -1) {
            // Mettre à jour le Blocs dans le tableau
            const updatedBlocss = [...this._blocs.value];
            updatedBlocss[index] = updatedBlocs;
            this._blocs.next(updatedBlocs);
          }
        } else if (payload.eventType === 'DELETE') {
          const oldBlocs: Bloc = payload.old;
          const newValue = this._blocs.value.filter(
            (item: { id: any }) => oldBlocs.id != item.id
          );
          this._blocs.next(newValue);
        }
      }
    )
    .subscribe();
  }

  get Videoblocs(): Observable<Bloc[]>{
    return this._videoBlocs.asObservable();
  }
  get blocs(): Observable<Bloc[]>{
    return this._blocs.asObservable();
  }

  async about(){
    const about = await this.db.from('about').select('*')
    return about.data[0]
  }

}
