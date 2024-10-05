import { Component, OnInit } from '@angular/core';
import { PrayetimesService } from '../services/prayetimes.service';
import { Router } from '@angular/router';
import { SettingService } from '../services/setting.service';
import { OnlineService } from '../services/online.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  prayerTimes: any;
  gregorianDate: string = '';
  hijriDate: any;
  location: any;
  method: string = '';
  languages: string = 'fr';  // Default language
  tasbihs = this.tasbihService.localTasbihs;
  sanitizedUrl: SafeResourceUrl | undefined;
  currentLanguage: string = 'en';
  constructor(
    private praytime: PrayetimesService,
    private tasbihService: OnlineService,
    private setting: SettingService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {this.translate.setDefaultLang('en');}

  ngOnInit() {
    this.setting.language.subscribe(lang => {
      this.currentLanguage = lang || 'en'; // Default to English
      this.translate.use(this.currentLanguage);
    });


    this.loadSettings();

    this.loadPrayerTimes();
    const url = 'https://tidjaniya.com/fr/les-merites-et-graces-de-la-tariqa-tidjaniya/';
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  async loadSettings() {
    this.setting.language.subscribe((language) => {
      console.log("🚀 ~ HomePage ~  ~ language:", language);
      this.languages = language || this.languages; // Use default if language is null
    });
  }

  bloc() {
    this.router.navigate(['bloc']);
  }

  loadPrayerTimes() {
    this.praytime.getPrayerTimes().subscribe((data: any) => {
      this.location = data.data.meta?.timezone;
      this.method = data.data.meta.method.name;
      this.prayerTimes = data.data.timings;
      this.gregorianDate = data.data.date.gregorian.date;
      this.hijriDate = data.data.date.hijri;
      console.log("🚀 ~ HomePage ~ loadPrayerTimes ~ data:", data);
    });
  }


  openSetting() {
    this.router.navigate(['/setting']);
  }
}
