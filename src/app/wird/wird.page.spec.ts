import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WirdPage } from './wird.page';

describe('WirdPage', () => {
  let component: WirdPage;
  let fixture: ComponentFixture<WirdPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WirdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
