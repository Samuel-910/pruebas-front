import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MispagosComponent } from './mispagos.component';

describe('MispagosComponent', () => {
  let component: MispagosComponent;
  let fixture: ComponentFixture<MispagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MispagosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MispagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
