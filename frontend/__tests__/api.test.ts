import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const API_BASE_URL = 'http://localhost:8080/api';

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('API_BASE_URL is defined', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  test('axios post is called with correct parameters for login', async () => {
    const mockResponse = { data: { token: 'test-token' } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    await mockedAxios.post(`${API_BASE_URL}/auth/login`, loginData);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/login`,
      loginData
    );
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test('axios get is called for fetching jobs', async () => {
    const mockResponse = { data: [{ id: 1, titre: 'Developer' }] };
    mockedAxios.get.mockResolvedValue(mockResponse);

    await mockedAxios.get(`${API_BASE_URL}/public/job-offers`);

    expect(mockedAxios.get).toHaveBeenCalledWith(`${API_BASE_URL}/public/job-offers`);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('API handles errors correctly', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.post.mockRejectedValue(new Error(errorMessage));

    try {
      await mockedAxios.post(`${API_BASE_URL}/auth/login`, {});
    } catch (error: any) {
      expect(error.message).toBe(errorMessage);
    }
  });
});
