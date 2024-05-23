import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsngrComponent } from './msngr.component';

describe('MsngrComponent', () => {
  let component: MsngrComponent;
  let fixture: ComponentFixture<MsngrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MsngrComponent]
    });
    fixture = TestBed.createComponent(MsngrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
