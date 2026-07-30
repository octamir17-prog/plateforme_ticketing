import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  typeCompte: sessionStorage.getItem('typeCompte') || null,
  accessToken: sessionStorage.getItem('accessToken') || null,
  refreshToken: sessionStorage.getItem('refreshToken') || null,

  loginSuccess: (data) => {
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('typeCompte', data.typeCompte);
    sessionStorage.setItem('user', JSON.stringify(data.profil));

    set({
      user: data.profil,
      typeCompte: data.typeCompte,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('typeCompte');
    sessionStorage.removeItem('user');
    set({ user: null, typeCompte: null, accessToken: null, refreshToken: null });
  },
}));