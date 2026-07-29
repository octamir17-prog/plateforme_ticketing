import api from './api';

export const authService = {
  login: async (username, motdepasse, typeCompte) => {
    const res = await api.post('/auth/login', { username, motdepasse, typeCompte });
    if (res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('typeCompte', res.data.typeCompte);
    }
    return res.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.clear();
      window.location.href = '/connexion-staff';
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  getActivationInfo: async (token) => {
    const res = await api.get(`/auth/activation/${token}`);
    return res.data;
  },

  activateAccount: async (token, username, motdepasse) => {
    const res = await api.post(`/auth/activation/${token}`, { username, motdepasse });
    return res.data;
  }
};

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },

  getEmplacements: async (role = '', codeStructure = '', statut = '') => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (codeStructure) params.append('codeStructure', codeStructure);
    if (statut) params.append('statut', statut);

    const res = await api.get(`/comptes/emplacements?${params.toString()}`);
    return res.data;
  },

  attribuerRole: async (agentMatricule, role, username) => {
    const res = await api.post('/comptes/attribuer', { agentMatricule, role, username });
    return res.data;
  },

  renvoyerLienActivation: async (role, username) => {
    const res = await api.post('/comptes/renvoyer-lien', { role, username });
    return res.data;
  },

  libererEmplacement: async (role, username) => {
    const res = await api.patch('/comptes/liberer', { role, username });
    return res.data;
  },

  importAgentsExcel: async (file) => {
    const formData = new FormData();
    formData.append('fichier', file);
    const res = await api.post('/agents/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export const responsableService = {
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/responsable');
    return res.data;
  },

  getTickets: async () => {
    const res = await api.get('/tickets');
    return res.data;
  },

  assignerTechnicien: async (affectationId, technicienId, priorite) => {
    const res = await api.patch(`/affectations/${affectationId}/assigner-technicien`, {
      technicienId,
      priorite
    });
    return res.data;
  },

  escaladerTicket: async (affectationId, codeStructureCible, raisonEscalade, commentaireEscalade) => {
    const res = await api.post(`/affectations/${affectationId}/escalader`, {
      codeStructureCible,
      raisonEscalade,
      commentaireEscalade
    });
    return res.data;
  },

  retournerTicket: async (affectationId, raisonRetour, commentaireRetour) => {
    const res = await api.post(`/affectations/${affectationId}/retourner`, {
      raisonRetour,
      commentaireRetour
    });
    return res.data;
  }
};

export const technicienService = {
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/technicien');
    return res.data;
  },

  demarrerTraitement: async (affectationId) => {
    const res = await api.post(`/affectations/${affectationId}/demarrer`);
    return res.data;
  },

  cloturerTicket: async (affectationId, commentaire) => {
    const res = await api.post(`/affectations/${affectationId}/cloturer`, { commentaire });
    return res.data;
  }
};

export const agentService = {
  creerTicket: async (titre, description, categorieId, file = null) => {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('categorieId', categorieId);
    if (file) {
      formData.append('pieceJointe', file);
    }
    const res = await api.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  relancerTicket: async (ticketId) => {
    const res = await api.post(`/tickets/${ticketId}/relancer`);
    return res.data;
  }
};