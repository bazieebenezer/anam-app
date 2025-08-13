import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulletinDetailsPage } from './bulletin-details.page';

describe('BulletinDetailsPage', () => {
  let component: BulletinDetailsPage;
  let fixture: ComponentFixture<BulletinDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BulletinDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
