import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { SettingService } from '../services/setting.service';
import { Share } from '@capacitor/share';
import { TranslateService } from '@ngx-translate/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  isInit: boolean = false;
  language:any = '';
  sanitizedUrl: SafeResourceUrl | undefined;
  currentLanguage: string = 'en';
  constructor(
    private storage: Storage,
    private sanitizer: DomSanitizer,
    private router: Router,
    private translate: TranslateService,
    private settingService: SettingService,) {
      this.storage.create();
      this.translate.setDefaultLang('en');
    }

  ngOnInit() {
    this.settingService.language.subscribe(lang => {
      this.currentLanguage = lang || 'en'; // Default to English
      this.translate.use(this.currentLanguage);
    });
    this.storage.get('settings').then((data) => {
      if(data === null) {
        this.isInit = false
      }else{
        this.language = data;
        this.isInit = true
      }
    })
    const url = 'https://tidjaniya.com/fr/les-merites-et-graces-de-la-tariqa-tidjaniya/';
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  async languageInput(event: any) {
    let value = event.target.value;
    await this.settingService.updateSettings(value)
  }
  close() {
    this.router.navigate(['home']);
  }
  async shareApp() {
    await Share.share({
      title: 'As-salāmu ʿalaykum',
      text: 'Salam, télécharge la meilleure appli musulmane GRATUITEMENT ici:',
      url: 'https://dashboard.ionicframework.com/preview/922e2a7a/ptwzykhmps',
      dialogTitle: 'Partager avec vos proches',
    });
  }
}
