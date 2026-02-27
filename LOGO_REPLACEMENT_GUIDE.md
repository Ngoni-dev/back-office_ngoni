# Branding Ngoni – Logo et favicon

Le projet utilise l’image **ngoni_logo.png** (Kora / Ngoni) pour le logo et le favicon.

## Emplacements actuels

| Usage        | Fichier                          | Description                          |
|-------------|-----------------------------------|--------------------------------------|
| Logo (UI)   | `public/images/ngoni_logo.png`    | Logo dans la barre latérale, header, login, footer |
| Favicon     | `src/app/icon.png`                | Icône de l’onglet du navigateur (générée par Next.js) |

Le composant `src/components/layout/shared/Logo.tsx` affiche l’image via `<img src="/images/ngoni_logo.png" />` et le texte du nom du template à côté.

## Remplacer le logo à l’avenir

1. **Logo principal**  
   Remplacer `public/images/ngoni_logo.png` par la nouvelle image (conserver le nom ou mettre à jour la référence dans `Logo.tsx`).

2. **Favicon**  
   Remplacer `src/app/icon.png` par la nouvelle image. Next.js l’utilise automatiquement comme favicon.

3. **Apple Touch Icon (optionnel)**  
   Remplacer `public/apple-icon.png` pour l’icône “Ajouter à l’écran d’accueil” sur iOS.

## Fichiers supprimés (plus utilisés)

- `src/@core/svg/NgoniLogo.tsx` – ancien composant SVG placeholder, remplacé par l’image PNG.
- `src/app/icon.tsx` – ancien favicon dynamique (lettre “N”), remplacé par `icon.png`.
