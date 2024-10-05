import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlocPage } from './bloc.page';

const routes: Routes = [
  {
    path: '',
    component: BlocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlocPageRoutingModule {}
