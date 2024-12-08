import api from './api';

export const authService = {
  login: (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  register: (username: string, email: string, password: string) => 
    api.post('/auth/register', { username, email, password }),

  verifyToken: () => 
    api.get('/auth/verify'),
}; 