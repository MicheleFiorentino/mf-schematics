import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfsLibComponent } from './mfs-lib.component';

describe('MfsLibComponent', () => {
  let component: MfsLibComponent;
  let fixture: ComponentFixture<MfsLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfsLibComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
