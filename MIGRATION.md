# Migration: Back-Office Ngoni - API Integration

## Objectif

Transformer le back-office_ngoni d'une application Next.js fullstack en frontend pur consommant l'API Laravel **ngoni_admin_api_dev**.

## Modifications réalisées

### 1. Template de référence
- Copie créée: `template-back-office_ngoni` (à la racine www/)

### 2. Nettoyage backend
- Suppression: `src/prisma/`, `src/app/api/`, `src/libs/auth.ts`
- Dépendances retirées: @auth/prisma-adapter, @prisma/client, next-auth, prisma
- Ajouté: axios

### 3. Configuration
- `.env`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- `next.config.ts`: images remotePatterns pour S3
- `package.json`: postinstall simplifié (plus de prisma generate)

### 4. Infrastructure API
- `src/utils/auth.utils.ts`: getAuthToken, setAuthToken, clearAuthToken (localStorage)
- `src/services/api/client.ts`: ApiClient axios
- `src/services/api/interceptors.ts`: token auto, refresh 401, gestion erreurs
- `src/types/api.types.ts`: LoginRequest, LoginResponse, AdminProfile, etc.

### 5. Module Authentification
- `src/services/auth.service.ts`: login, logout, refreshToken, getProfile
- `src/redux-store/slices/authSlice.ts`: user, token, isAuthenticated
- `src/hooks/useAuth.ts`: login, logout, refreshProfile
- `src/contexts/AuthProvider.tsx`: restauration session au démarrage
- `src/views/Login.tsx`: utilise useAuth au lieu de signIn
- `src/components/Providers.tsx`: AuthProvider au lieu de NextAuthProvider
- `src/hocs/AuthGuard.tsx`, `GuestOnlyRoute.tsx`: client components, Redux auth
- `src/components/layout/shared/UserDropdown.tsx`: useAuth au lieu de useSession

### 6. Endpoints API utilisés

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| /admin/auth/login | POST | Connexion |
| /admin/auth/logout | POST | Déconnexion |
| /admin/auth/refresh | POST | Rafraîchir token |
| /admin/auth/profile | GET | Profil admin |
| /admin/musics | GET/POST | CRUD musiques |
| /admin/artists | GET/POST | CRUD artistes |
| /admin/genres | GET/POST | CRUD genres |
| /admin/licenses | GET/POST | CRUD licences |
| /admin/gift-products | GET/POST | CRUD produits cadeaux |

## Prochaines étapes

- Implémenter les modules: Music, Artist, Genre, License, Gift Products
- Créer les pages et composants UI pour chaque module
- Mettre à jour la navigation avec les liens Ngoni
