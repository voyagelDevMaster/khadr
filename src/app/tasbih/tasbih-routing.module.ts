import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TasbihPage } from './tasbih.page';

const routes: Routes = [
  {
    path: '',
    component: TasbihPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasbihPageRoutingModule {}
