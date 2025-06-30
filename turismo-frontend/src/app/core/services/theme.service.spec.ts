// core/services/theme.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

// Mock del environment
const mockEnvironment = {
  defaultDarkMode: false
};

// Mock de window.matchMedia
const createMatchMediaMock = (matches: boolean = false) => {
  return jasmine.createSpy('matchMedia').and.returnValue({
    matches,
    media: '',
    onchange: null,
    addListener: jasmine.createSpy('addListener'),
    removeListener: jasmine.createSpy('removeListener'),
    addEventListener: jasmine.createSpy('addEventListener'),
    removeEventListener: jasmine.createSpy('removeEventListener'),
    dispatchEvent: jasmine.createSpy('dispatchEvent'),
  });
};

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: jasmine.Spy;
  let documentElementMock: {
    classList: {
      add: jasmine.Spy;
      remove: jasmine.Spy;
    };
  };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return localStorageMock[key] || null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    // Mock document.documentElement
    documentElementMock = {
      classList: {
        add: jasmine.createSpy('add'),
        remove: jasmine.createSpy('remove')
      }
    };
    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock,
      writable: true,
      configurable: true
    });

    // Mock console.log para evitar outputs en tests
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Initialization', () => {
    it('should be created', () => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      expect(service).toBeTruthy();
    });

    it('should initialize with saved localStorage value (true)', () => {
      localStorageMock['darkMode'] = 'true';
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      expect(service.isDarkMode()).toBe(true);
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should initialize with saved localStorage value (false)', () => {
      localStorageMock['darkMode'] = 'false';
      matchMediaMock = createMatchMediaMock(true); // system prefers dark but localStorage overrides
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      expect(service.isDarkMode()).toBe(false);
      expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should initialize with system preference when no localStorage value', () => {
      matchMediaMock = createMatchMediaMock(true);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      expect(service.isDarkMode()).toBe(true);
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should initialize with environment default when no localStorage and no system preference', () => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      expect(service.isDarkMode()).toBe(false); // matchMedia devuelve false, así que será false
    });

    it('should handle missing matchMedia gracefully', () => {
      (window as any).matchMedia = undefined;

      expect(() => {
        service = TestBed.inject(ThemeService);
      }).not.toThrow();
      
      expect(service.isDarkMode()).toBe(false); // should fallback to environment default
    });
  });

  describe('Dark Mode Observable', () => {
    beforeEach(() => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;
      service = TestBed.inject(ThemeService);
    });

    it('should emit current state through darkMode$ observable', (done) => {
      service.darkMode$.subscribe(isDarkMode => {
        expect(isDarkMode).toBe(false);
        done();
      });
    });

    it('should emit new state when dark mode changes', (done) => {
      let emissionCount = 0;
      const expectedValues = [false, true];

      service.darkMode$.subscribe(isDarkMode => {
        expect(isDarkMode).toBe(expectedValues[emissionCount]);
        emissionCount++;
        
        if (emissionCount === 2) {
          done();
        }
      });

      // Trigger change
      service.setDarkMode(true);
    });
  });

  describe('toggleDarkMode', () => {
    beforeEach(() => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;
      service = TestBed.inject(ThemeService);
    });

    it('should toggle from false to true', () => {
      expect(service.isDarkMode()).toBe(false);
      
      service.toggleDarkMode();
      
      expect(service.isDarkMode()).toBe(true);
      expect(localStorageMock['darkMode']).toBe('true');
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should toggle from true to false', () => {
      service.setDarkMode(true);
      expect(service.isDarkMode()).toBe(true);
      
      service.toggleDarkMode();
      
      expect(service.isDarkMode()).toBe(false);
      expect(localStorageMock['darkMode']).toBe('false');
      expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark');
    });
  });

  describe('setDarkMode', () => {
    beforeEach(() => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;
      service = TestBed.inject(ThemeService);
    });

    it('should set dark mode to true', () => {
      service.setDarkMode(true);
      
      expect(service.isDarkMode()).toBe(true);
      expect(localStorageMock['darkMode']).toBe('true');
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should set dark mode to false', () => {
      service.setDarkMode(false);
      
      expect(service.isDarkMode()).toBe(false);
      expect(localStorageMock['darkMode']).toBe('false');
      expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark');
    });
  });

  describe('initializeTheme', () => {
    beforeEach(() => {
      matchMediaMock = createMatchMediaMock(false);
      (window as any).matchMedia = matchMediaMock;
      service = TestBed.inject(ThemeService);
    });

    it('should apply current theme when initialized', () => {
      // Clear previous calls from constructor
      documentElementMock.classList.remove.calls.reset();
      (console.log as jasmine.Spy).calls.reset();
      
      service.initializeTheme();
      
      expect(console.log).toHaveBeenCalledWith('Initializing theme, dark mode:', false);
      expect(documentElementMock.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should apply dark theme when initialized with dark mode', () => {
      service.setDarkMode(true);
      documentElementMock.classList.add.calls.reset();
      (console.log as jasmine.Spy).calls.reset();
      
      service.initializeTheme();
      
      expect(console.log).toHaveBeenCalledWith('Initializing theme, dark mode:', true);
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });
  });

  describe('System preference changes', () => {
    it('should listen to system preference changes when no localStorage value exists', () => {
      const mockMatchMediaResult = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener')
      };
      matchMediaMock = jasmine.createSpy('matchMedia').and.returnValue(mockMatchMediaResult);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockMatchMediaResult.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('should update theme when system preference changes and no localStorage value', () => {
      let changeHandler: (e: { matches: boolean }) => void;
      const mockMatchMediaResult = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event: string, handler: any) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        })
      };
      
      matchMediaMock = jasmine.createSpy('matchMedia').and.returnValue(mockMatchMediaResult);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      
      // Simulate system preference change to dark
      changeHandler!({ matches: true });
      
      expect(service.isDarkMode()).toBe(true);
      expect(documentElementMock.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should not update theme when system preference changes but localStorage value exists', () => {
      localStorageMock['darkMode'] = 'false';
      
      let changeHandler: (e: { matches: boolean }) => void;
      const mockMatchMediaResult = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event: string, handler: any) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        })
      };
      
      matchMediaMock = jasmine.createSpy('matchMedia').and.returnValue(mockMatchMediaResult);
      (window as any).matchMedia = matchMediaMock;

      service = TestBed.inject(ThemeService);
      expect(service.isDarkMode()).toBe(false);
      
      // Simulate system preference change to dark
      changeHandler!({ matches: true });
      
      // Should remain false because localStorage value takes precedence
      expect(service.isDarkMode()).toBe(false);
    });
  });
});