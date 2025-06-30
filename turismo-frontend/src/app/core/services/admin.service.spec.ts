import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService, DashboardSummary, Permission, PaginatedResponse } from './admin.service';
import { environment } from '../../../environments/environments';
import { Role, User } from '../models/user.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users with query params', () => {
    const mockResponse: { success: boolean; data: PaginatedResponse<User> } = {
      success: true,
      data: {
        current_page: 1,
        data: [],
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: 10,
        prev_page_url: null,
        to: 1,
        total: 1
      }
    };

    service.getUsers().subscribe(res => {
      expect(res).toEqual(mockResponse.data);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users?page=1&per_page=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch single user by ID', () => {
    const userId = 1;
    const mockUser = { success: true, data: { id: userId, name: 'User' } };

    service.getUser(userId).subscribe(res => {
      expect(res).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user', () => {
    const formData = new FormData();
    const mockResponse = { success: true, message: 'Created', data: {} as User };

    service.createUser(formData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update a user', () => {
    const formData = new FormData();
    const userId = 1;
    const mockResponse = { success: true, message: 'Updated', data: {} as User };

    service.updateUser(userId, formData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1?_method=PUT`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a user', () => {
    const userId = 1;

    service.deleteUser(userId).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(true);
  });

  it('should fetch roles', () => {
    const mockRoles = { success: true, data: [{ id: 1, name: 'Admin' }] as Role[] };

    service.getRoles().subscribe(res => {
      expect(res).toEqual(mockRoles.data);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/roles`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRoles);
  });

  it('should fetch dashboard summary', () => {
    const mockSummary = { success: true, data: { total_users: 1, active_users: 1, inactive_users: 0, users_by_role: [], total_roles: 1, total_permissions: 1, recent_users: [] } as DashboardSummary };

    service.getDashboardSummary().subscribe(res => {
      expect(res).toEqual(mockSummary.data);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });
});
