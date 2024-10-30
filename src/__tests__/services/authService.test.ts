import axios from 'axios';
import { login, register, logout } from '../../services/authService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('login success', async () => {
    const mockResponse = { data: { token: 'fake-token', user: { id: '1', name: 'Test User' } } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await login('test@example.com', 'password123');

    expect(result).toEqual(mockResponse.data);
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  test('login failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(login('wrong@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('register success', async () => {
    const mockResponse = { data: { token: 'fake-token', user: { id: '2', name: 'New User' } } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await register('New User', 'new@example.com', 'password123');

    expect(result).toEqual(mockResponse.data);
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  test('register failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Email already exists'));

    await expect(register('Existing User', 'existing@example.com', 'password123')).rejects.toThrow('Email already exists');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('logout', () => {
    localStorage.setItem('token', 'fake-token');
    logout();
    expect(localStorage.getItem('token')).toBeNull();
  });
});