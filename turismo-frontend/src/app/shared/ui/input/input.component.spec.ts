import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
  let fixture: ComponentFixture<InputComponent>;
  let component: InputComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, InputComponent]  // standalone
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label when provided', () => {
    component.label = 'My Label';
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toBe(' My Label ');
  });

  it('should set placeholder and type', () => {
    component.placeholder = 'Enter text';
    component.type = 'email';
    fixture.detectChanges();
    expect(inputEl.placeholder).toBe('Enter text');
    expect(inputEl.type).toBe('email');
  });

  it('should display hint when no error', () => {
    component.hint = 'Helpful hint';
    fixture.detectChanges();
    const p = fixture.debugElement.query(By.css('p.text-gray-500'));
    expect(p.nativeElement.textContent).toBe('Helpful hint');
  });

  it('should display error message and apply error classes', () => {
    component.error = 'Error occurred';
    fixture.detectChanges();
    const p = fixture.debugElement.query(By.css('p.text-red-500'));
    expect(p.nativeElement.textContent).toBe('Error occurred');
    expect(inputEl.classList).toContain('border-red-500');
  });

  it('should implement ControlValueAccessor: writeValue()', () => {
    component.writeValue('abc');
    fixture.detectChanges();
    expect(inputEl.value).toBe('abc');
  });

  it('should call registered onChange when user types', () => {
    let value = '';
  component.registerOnChange((v: string) => (value = v));
    fixture.detectChanges();

    inputEl.value = 'hello';
    inputEl.dispatchEvent(new Event('input'));
    expect(value).toBe('hello');
  });

  it('should call registered onTouched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    fixture.detectChanges();

    inputEl.dispatchEvent(new Event('blur'));
    expect(touched).toBeTrue();
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    expect(inputEl.disabled).toBeTrue();
    component.setDisabledState(false);
    fixture.detectChanges();
    expect(inputEl.disabled).toBeFalse();
  });
});
