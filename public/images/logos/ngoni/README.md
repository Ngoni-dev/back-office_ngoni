# Logos Ngoni

Ce dossier est destiné à contenir les logos Ngoni pour le back-office.

## 📁 Fichiers Attendus

Placez les fichiers suivants dans ce dossier:

- `ngoni-logo.svg` - Logo principal (format vectoriel)
- `ngoni-logo.png` - Logo principal (format raster, haute résolution)
- `ngoni-logo-white.svg` - Logo pour fond sombre (si différent)
- `ngoni-icon.png` - Icône carrée (512x512 ou plus)

## 🔗 Utilisation

Une fois les fichiers placés ici, vous pouvez les référencer dans le code:

```tsx
// Dans un composant React
<img src="/images/logos/ngoni/ngoni-logo.svg" alt="Ngoni" />

// Ou importer directement
import ngoniLogo from '@/public/images/logos/ngoni/ngoni-logo.svg'
```

## 📋 Checklist

- [ ] Logo principal SVG ajouté
- [ ] Logo principal PNG ajouté (backup)
- [ ] Icône carrée ajoutée
- [ ] Logo mis à jour dans `src/@core/svg/NgoniLogo.tsx`
- [ ] Favicon mis à jour dans `public/favicon.ico`
- [ ] Apple Touch Icon mis à jour dans `public/apple-icon.png`

## 📖 Guide Complet

Consultez le fichier `LOGO_REPLACEMENT_GUIDE.md` à la racine du projet pour des instructions détaillées.
