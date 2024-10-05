import { Component, OnInit } from '@angular/core';
import { BlocService } from '../services/bloc.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, Observable } from 'rxjs';
import { Bloc } from '../services/models/bloc.model';

@Component({
  selector: 'app-bloc',
  templateUrl: './bloc.page.html',
  styleUrls: ['./bloc.page.scss'],
})
export class BlocPage implements OnInit {
  blocs = this.blocService.blocs;
  videos = this.blocService.Videoblocs;
  public segment: string = "article";


  constructor(private blocService: BlocService,
    private sanitizer: DomSanitizer,
    private router: Router) { }

  ngOnInit() {
    console.log("🚀 ~ BlocPage ~ ngOnInit ~ ngOnInit:")
    // Sanitize video URLs(: { url: string; })
  }

  close() {
    this.router.navigate(['home']);
  }
  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    console.log("🚀 ~ TasbihPage ~ segmentChanged ~ this.segment:", this.segment)
  }
}
