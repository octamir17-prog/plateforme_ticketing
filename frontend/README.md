# Ticketing Interventions — Frontend

## Connexion au backend réel

Crée un fichier `.env` à la racine avec l'URL de l'API de ton binôme :

```
VITE_API_URL=http://localhost:3000/api
```

(remplace le port/URL par celui de son backend)

## Démarrage

```bash
npm install
npm run dev
```

App disponible sur `http://localhost:5173`

## Rôles gérés

- **AGENT** : crée des tickets, consulte "Mes tickets", ferme un ticket résolu, ajoute un commentaire de validation
- **TECHNICIEN** : consulte ses interventions, Accepter → Démarrer → Mettre en attente/Reprendre → Clôturer, demande de réaffectation
- **RESPONSABLE** : voit les tickets non affectés, affecte/réaffecte à un technicien, fixe la priorité, gère les demandes de réaffectation
- **ADMIN** : gère les utilisateurs (créer, désactiver, réactiver, réinitialiser mot de passe), consulte le journal d'activité

## Structure

```
src/
  constants/roles.js     → rôles, statuts, priorités (contrat API)
  components/             → composants réutilisables (Modal, TicketCard, formulaires...)
  pages/                  → une page par route
  services/api.js         → TOUS les appels réseau, organisés par ressource du contrat
  hooks/useAuthStore.js   → état global utilisateur connecté
```

## Ce qui reste à faire / à vérifier avec le backend

1. Vérifier le format exact de réponse de chaque endpoint (les noms de champs doivent correspondre)
2. Gestion de la déconnexion sur expiration du token (actuellement redirige sur 401 uniquement)
3. Ajouter la pagination si le backend retourne des listes paginées
4. Ajouter les pages Services/Catégories (admin) si besoin de les gérer depuis l'UI
5. Export PDF/Excel côté Responsable (endpoints prêts dans `api.js`, pas encore de bouton dans l'UI)
