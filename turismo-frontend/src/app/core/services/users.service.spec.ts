import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { environment } from '../../../environments/environments';
import { User } from '../models/user.model';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService]
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search users by query', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        phone: '123456789',
        roles: [
          { id: 1, name: 'admin', permissions: ['read', 'write'] }
        ]
      },
      {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        phone: '987654321',
        roles: [
          { id: 2, name: 'user', permissions: ['read'] }
        ]
      }
    ];

    service.searchUsers('alice').subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${API_URL}/users/search?q=alice`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockUsers });
  });

  it('should get users by role', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '555123456',
        roles: [
          { id: 1, name: 'admin', permissions: ['read', 'write'] }
        ]
      }
    ];

    service.getUsersByRole('admin').subscribe(users => {
      expect(users.length).toBe(1);
      // Aquí corregimos el error posible undefined con ?.
      expect(users[0].roles?.some(r => r.name === 'admin') ?? false).toBeTrue();
    });

    const req = httpMock.expectOne(`${API_URL}/users/role/admin`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockUsers });
  });
});