import { Component } from '@angular/core';
import { OnlineService } from './services/online.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private sync: OnlineService) {}
}
