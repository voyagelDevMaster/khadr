import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private _settings: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private storage: Storage) {
    this.storage.create();
    this.loadSettings();  // Corrected typo from 'loardSettings' to 'loadSettings'
  }

  async loadSettings() {
    const data = await this.storage.get('settings');
    if (data === null) {
      this._settings.next(null);
    } else {
      console.log('Settings already exist');
      this._settings.next(data);
    }
  }

  get language(): Observable<any> {
    return this._settings.asObservable();
  }

  // Optionally add a method to update the settings in storage
  async updateSettings(newSettings: any) {
    await this.storage.set('settings', newSettings);
    this._settings.next(newSettings);
  }
}
