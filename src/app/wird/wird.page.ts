import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { SettingService } from 'src/app/services/setting.service';
import { Tasbih, Wird } from '../services/models/tasbih.model';
import { WirdService } from '../services/wird.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wird',
  templateUrl: './wird.page.html',
  styleUrls: ['./wird.page.scss'],
})
export class WirdPage implements OnInit {
  @ViewChild('audioPlayer', { static: false })
  audioPlayer!: ElementRef;
  id: number = 0;
  name: any;
  public segment: string = "arabic";
  audio: HTMLAudioElement | null = null;

  //count: number = 0;
  player = false
  haveAudio = false
  currentTasbih: any;
  wirds: any;
  currentPhrase = 'Alhamdulillah';
  activeTab = 'arabe';
  arabicText = 'الحمد لله';
  count = 0;
  total = 99;
  currentSet = 1;
  notification = 3;
  circumference = 2 * Math.PI * 48;
  strokeDashoffset: number = 0;
  languages: string = 'fr';  // Default language
  tasbih: Tasbih | undefined;
  allWirds: Wird[] = [];
  currentWirdIndex = 0;
  currentLanguage: string = 'en';
  language:any = '';
  tasbihId: number = 0;
  constructor(
    private route: ActivatedRoute,
    private wirdService: WirdService,
    private translate: TranslateService,
    private setting: SettingService, private toastController: ToastController,
    private router: Router, private alertController: AlertController) {
      this.translate.setDefaultLang('en');
      this.route.params.subscribe(async (params) => {
        this.loadSettings();
        this.id = params['id'];
        this.tasbihId = params['tasbihId'];
        console.log("🚀 ~ WirdPage ~ this.route.params.subscribe ~ this.tasbihId:", this.tasbihId)
        this.loardWird();
      });
     }

  ngOnInit() {
    this.setting.language.subscribe(lang => {
      this.currentLanguage = lang || 'en'; // Default to English
      this.translate.use(this.currentLanguage);
    });
    this.updateProgress();

  }
  async languageInput(event: any) {
    let value = event.target.value;
    await this.setting.updateSettings(value)
  }
  async loardWird(){
    try {
      this.allWirds = await this.wirdService.getwirds();
      console.log("🚀 ~ WirdPage ~ loardWird ~  1 ",  this.allWirds)
      console.log("🚀 ~ WirdPage ~ loardWird ~ this.tasbihId:", this.tasbihId)
      this.allWirds = this.allWirds.filter(wird => wird.tasbih_id == this.tasbihId);
      console.log("🚀 ~ WirdPage ~ loardWird ~  2",  this.allWirds)
      this.allWirds = this.allWirds.sort((a, b) => a.numOrder - b.numOrder);
      console.log("🚀 ~ WirdPage ~ loardWird ~ 3", this.allWirds)
      this.currentWirdIndex = this.allWirds.findIndex(
        (item: { id: number }) => item.id == this.id
      );
      this.wirds = this.allWirds[this.currentWirdIndex];
      this.name =  this.wirds.tasbih.arabic_name;
      if (this.wirds?.audio_url !== 'null') {
        this.haveAudio = true
      }
        console.log("🚀 ~ WirdPage ~ loardWird ~ this.haveAudio:", this.haveAudio)
      console.log("🚀 ~ WirdPage  ~ this.wirds:", this.wirds)
    } catch (error) {
      console.error("Erreur lors du chargement des données du wird :", error);
    }
  }
  async loadSettings() {
    this.setting.language.subscribe((language) => {
      console.log("🚀 ~ HomePage ~  ~ language:", language);
      this.languages = language || this.languages; // Use default if language is null
    });
  }
  async incrementCount() {
      if (this.count < this.wirds.total) {
        this.count++;
        this.updateProgress();
        this.updateCurrentSet();
        if (this.count === this.wirds.total) {
          this.currentWirdIndex =  (this.currentWirdIndex + 1) % this.allWirds.length;
          if(this.currentWirdIndex  < this.allWirds.length){
            console.log("🚀 ~ WirdPage ~ incrementCount ~ this.currentWirdIndex:", this.currentWirdIndex)
            console.log("🚀 ~ WirdPage ~ incrementCount ~ this.allWirds.length:", this.allWirds.length)
            this.wirds = this.allWirds[this.currentWirdIndex];
            this.count = 0;
            await this.presentToast(this.wirds.ar_name + ' terminé.');
            this.updateProgress();
            this.updateCurrentSet();
          } else{
            console.log("🚀 ~ WirdPage ~ incrementCount ~ this.allWirds.length:", this.allWirds.length)
            this.presentEndOptions();  // Nouvelle méthode pour afficher la carte de fin
          }
        }
      }

  }

  async presentEndOptions() {
    const alert = await this.alertController.create({
      header: 'Félicitations!',
      message: 'Vous avez terminé tous les wirds de ce tasbih.',
      buttons: [
        {
          text: 'Redémarrer',
          handler: () => {
            // Réinitialiser la liste des wirds
            this.currentWirdIndex = 0;
            this.wirds = this.allWirds[this.currentWirdIndex];
            this.count = 0;
            this.updateProgress();
            this.updateCurrentSet();
          },
        },
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
            // Naviguer vers la page précédente ou fermer la modal
            this.router.navigate(['tasbih/' + this.wirds?.tasbih_id]);
          },
        },
      ],
    });

    await alert.present();
  }

  updateProgress() {
    const progress = this.count / this.wirds?.total;
    this.strokeDashoffset = this.circumference - (progress * this.circumference);
  }


  updateCurrentSet() {
    this.currentSet = Math.floor(this.count / 33) + 1;
    if (this.currentSet > 3) this.currentSet = 3;
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    console.log("🚀 ~ TasbihPage ~ segmentChanged ~ this.segment:", this.segment)
  }

  increment(wird: number) {
    if (this.count < wird) {
      this.count++;
    }
  }

  async reset(){
    const alert = await this.alertController.create({
      header: 'Attention',
      message: 'Voulez-vous reprendre ce wird ? ',
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

// Méthode pour lire l'audio
playAudio(url: string | undefined) {
  // Arrêter l'audio en cours s'il y en a un
  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  // Créer un nouvel élément audio
  this.audio = new Audio(url);

  // Événements pour vérifier le statut de l'audio
  this.audio.oncanplay = () => {
    console.log('Audio prêt à jouer');
    this.player = true;
  };

  this.audio.onerror = (error) => {
    this.player = false;
    console.error('Erreur de lecture audio:', error);
    // Gérer les erreurs spécifiques, par exemple : URL incorrecte, fichier introuvable, etc.
  };

  // Jouer l'audio
  this.audio.play().catch((error) => {
    this.player = false;
    console.error('Erreur lors du démarrage de la lecture:', error);
    // Gérer les erreurs spécifiques, par exemple : autorisations de lecture, problème réseau, etc.
  });
}

// Méthode pour arrêter l'audio
stopAudio() {
  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
  this.player = false;
}

async presentToast(message: any) {
  const toast = await this.toastController.create({
    message: message,
    duration: 1500,
    position: 'middle',
    color: 'tertiary',
    translucent: true,
    mode: 'ios' as 'ios',
  });

  await toast.present();
}

  close() {
    this.router.navigate(['tasbih/' + this.wirds?.tasbih_id ]);
  }
}
