import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlocPageRoutingModule } from './bloc-routing.module';

import { BlocPage } from './bloc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlocPageRoutingModule
  ],
  declarations: [BlocPage]
})
export class BlocPageModule {}
