import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingService } from '../services/setting.service';
import { OfflineService } from '../services/offline.service';
import { Tasbih } from '../services/models/tasbih.model';
import { AlertController, IonicSlides } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tasbih',
  templateUrl: './tasbih.page.html',
  styleUrls: ['./tasbih.page.scss'],
})
export class TasbihPage implements OnInit {
  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef;
  id: any;
  name: any;
  wirds: any;
  languages: string = 'fr';  // Default language
  tasbih: Tasbih | undefined;
  isLoading: boolean = true; // State for loading spinner
  isEmpty: boolean = false;  // State to check if data is empty
  swiperModules = [IonicSlides];
  segment: string = "arabic";
  player = false;
  haveAudio = false;
  count = 0;
  circumference = 2 * Math.PI * 48;
  strokeDashoffset: number = 0;
  first_wird: any;
  currentLanguage: string = 'en';
  language:any = '';

  constructor(
    private route: ActivatedRoute,
    private tasbihService: OfflineService,
    private setting: SettingService,
    private alertController: AlertController,
    private translate: TranslateService,
    private router: Router
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.setting.language.subscribe(lang => {
      this.currentLanguage = lang || 'en'; // Default to English
      this.translate.use(this.currentLanguage);
    });
    this.loadTasbih();
    this.updateProgress();
  }
  async languageInput(event: any) {
    let value = event.target.value;
    await this.setting.updateSettings(value)
  }
  incrementCount() {
    if (this.count < this.wirds.total) {
      this.count++;
      this.updateProgress();
    } else {
      this.count = 0; // Reset count if it reaches the total
    }
  }

  updateProgress() {
    const progress = this.count / this.wirds?.total;
    this.strokeDashoffset = this.circumference - (progress * this.circumference);
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async reset() {
    const alert = await this.alertController.create({
      header: 'Attention',
      message: 'Voulez-vous reprendre ce wird ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
        },
        {
          text: 'Oui',
          role: 'confirm',
          handler: () => {
            this.count = 0;
          },
        },
      ],
    });

    await alert.present();
  }

  playAudio() {
    this.audioPlayer.nativeElement.play();
    this.player = true;
  }

  pauseAudio() {
    this.audioPlayer.nativeElement.pause();
    this.player = false;
  }

  async loadTasbih() {
    try {
      this.isLoading = true; // Start the spinner
      this.tasbih = await this.tasbihService.searchById(this.id);
      if (this.tasbih && this.tasbih.wirds && this.tasbih.wirds.length > 0) {
        // Sort wirds by .numOrder
        this.wirds = this.tasbih.wirds.sort((a, b) => a.numOrder - b.numOrder);
        this.name = this.tasbih.fr_name;
        this.isEmpty = false; // Data is not empty
        this.haveAudio = this.wirds.some((w: any) => w.audio_url);
        // Get the index of the first wird
      const firstWirdIndex = this.wirds.findIndex((w: any) => w === this.wirds[0]);
      this.first_wird = this.wirds[0]
      console.log('Index of the first wird:', this.first_wird.id);
      } else {
        this.isEmpty = true; // Data is empty
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      this.isEmpty = true; // Set to empty if there's an error
    } finally {
      this.isLoading = false; // Stop the spinner
    }
  }

  async loadSettings() {
    this.setting.language.subscribe((language) => {
      this.languages = language || this.languages; // Use default if language is null
    });
  }

  detail(id: string, wird: string) {
    this.router.navigate(['wird/' + id + '/' + wird]);
  }

  close() {
    this.router.navigate(['home']);
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
