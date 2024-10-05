import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WirdPage } from './wird.page';

const routes: Routes = [
  {
    path: '',
    component: WirdPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WirdPageRoutingModule {}
