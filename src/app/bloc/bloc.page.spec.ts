import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlocPage } from './bloc.page';

describe('BlocPage', () => {
  let component: BlocPage;
  let fixture: ComponentFixture<BlocPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
