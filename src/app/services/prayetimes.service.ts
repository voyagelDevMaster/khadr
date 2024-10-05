import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrayetimesService {
  prayerTimes: any;

  constructor(private http: HttpClient) {}


  getPrayerTimes(): Observable<any> {
    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timingsByCity/${formattedDate}?city=Dakar&country=Senegal&method=3`;

    return this.http.get(url);
  }
}
