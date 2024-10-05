import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasbihPage } from './tasbih.page';

describe('TasbihPage', () => {
  let component: TasbihPage;
  let fixture: ComponentFixture<TasbihPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TasbihPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
