import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  typeCompte: localStorage.getItem('typeCompte') || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,

  loginSuccess: (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('typeCompte', data.typeCompte);
    localStorage.setItem('user', JSON.stringify(data.profil));

    set({
      user: data.profil,
      typeCompte: data.typeCompte,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('typeCompte');
    localStorage.removeItem('user');
    set({ user: null, typeCompte: null, accessToken: null, refreshToken: null });
  },
}));