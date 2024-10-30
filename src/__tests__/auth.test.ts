import axios from 'axios';
import { login, register } from '../services/authService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authentication', () => {
  test('login with correct credentials', async () => {
    const mockResponse = { data: { token: 'fake-token', user: { id: '1', name: 'Test User' } } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await login('test@example.com', 'password123');
    expect(result).toEqual(mockResponse.data);
  });

  test('login with incorrect credentials', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'));

    await expect(login('wrong@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  test('register new user', async () => {
    const mockResponse = { data: { token: 'fake-token', user: { id: '2', name: 'New User' } } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await register('New User', 'new@example.com', 'password123');
    expect(result).toEqual(mockResponse.data);
  });

  // Add more tests for registration validation, error handling, etc.
});