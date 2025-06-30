// slider-upload.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SliderUploadComponent, SliderImage } from './slider-upload.component';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('SliderUploadComponent', () => {
  let component: SliderUploadComponent;
  let fixture: ComponentFixture<SliderUploadComponent>;
  let fb: FormBuilder;
  let formArray: FormArray;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SliderUploadComponent],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    formArray = fb.array([]);

    fixture = TestBed.createComponent(SliderUploadComponent);
    component = fixture.componentInstance;
    component.slidersFormArray = formArray;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit populates existing sliders and emits change', fakeAsync(() => {
    const existing: SliderImage[] = [
      { id: 1, nombre: 'Img1', es_principal: true, orden: 1, url_completa: 'url1' }
    ];
    spyOn(component.changeSlidersEvent, 'emit');
    component.existingSliders = existing;
    fixture.detectChanges(); // triggers ngOnInit
    tick();

    expect(formArray.length).toBe(1);
    const group = formArray.at(0).value;
    expect(group.nombre).toBe('Img1');
    expect(component.getPreviewUrl(0)).toBe('url1');
    expect(component.changeSlidersEvent.emit).toHaveBeenCalledWith(existing);
  }));

  it('addSlider adds a new slider control and emits change', () => {
    spyOn(component.changeSlidersEvent, 'emit');
    fixture.detectChanges();
    component.addSlider();
    expect(formArray.length).toBe(1);
    expect(component.changeSlidersEvent.emit).toHaveBeenCalled();
  });

  it('removeSlider removes control, tracks deleted ids, and emits deletedSlidersEvent', () => {
    // Prepare formArray with one existing slider
    component.slidersFormArray = fb.array([fb.group({ id: [5], nombre: ['X'], es_principal: [true], orden: [1] })]);
    // Initialize internal stores to avoid undefined
    (component as any).filePreviewUrls = {};
    (component as any).fileStore = {};
    (component as any).fileErrors = {};
    spyOn(component.deletedSlidersEvent, 'emit');

    // Directly call remove without detectChanges to avoid ngOnInit resetting the array
    component.removeSlider(0);
    expect(component.deletedSlidersEvent.emit).toHaveBeenCalledWith([5]);
    expect(component.slidersFormArray.length).toBe(0);
  });

  it('onFileSelected rejects files larger than max size', () => {
    fixture.detectChanges();
    const file = new File([new ArrayBuffer(component['MAX_FILE_SIZE'] + 1)], 'big.png', { type: 'image/png' });
    const input = document.createElement('input');
    input.type = 'file';
    // simulate FileList
    Object.defineProperty(input, 'files', { value: [file] });
    component.slidersFormArray.push(fb.group({ id: [null], nombre: [''], es_principal: [true], orden: [1], titulo: [''], descripcion: [''] }));

    component.onFileSelected({ target: input } as any, 0);
    expect(component.fileErrors[0]).toContain('excede el tamaño máximo');
  });

  it('areAllSlidersValid returns false if errors or invalid controls', () => {
    // error case
    component.fileErrors = { 0: 'err' };
    expect(component.areAllSlidersValid()).toBeFalse();
    // invalid form
    component.fileErrors = {};
    component.slidersFormArray.push(fb.group({ id: [null], nombre: ['', Validators.required], es_principal: [true], orden: [1], titulo: [''], descripcion: [''] }));
    expect(component.areAllSlidersValid()).toBeFalse();
    // valid case
    const group = fb.group({ id: [null], nombre: ['Name', Validators.required], es_principal: [true], orden: [1], titulo: [''], descripcion: [''] });
    formArray.clear(); formArray.push(group);
    expect(component.areAllSlidersValid()).toBeTrue();
  });
});
