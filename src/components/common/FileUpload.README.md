# FileUpload Component

Un composant réutilisable pour l'upload de fichiers avec support du drag-and-drop, validation, et affichage de progression.

## Fonctionnalités

- ✅ Drag-and-drop de fichiers
- ✅ Validation du type de fichier
- ✅ Validation de la taille de fichier
- ✅ Affichage de la progression d'upload
- ✅ Messages d'erreur clairs
- ✅ Prévisualisation du fichier sélectionné
- ✅ Bouton de suppression du fichier
- ✅ Support des états disabled/uploading
- ✅ Utilise les composants Material-UI du template
- ✅ Intégration avec le hook useFileUpload

## Utilisation de base

```tsx
import FileUpload from '@/components/common/FileUpload'

function MyComponent() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <FileUpload
      onFileSelect={setFile}
      accept={{ 'audio/*': ['.mp3', '.wav'] }}
      maxSize={50 * 1024 * 1024} // 50MB
      label='Sélectionnez un fichier audio'
      helperText='Formats: MP3, WAV (max 50MB)'
      currentFile={file}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFileSelect` | `(file: File) => void` | **Required** | Callback appelé quand un fichier est sélectionné |
| `accept` | `Record<string, string[]>` | `undefined` | Types MIME acceptés (format react-dropzone) |
| `maxSize` | `number` | `50 * 1024 * 1024` | Taille maximale en bytes (défaut: 50MB) |
| `label` | `string` | `'Glissez-déposez...'` | Texte affiché dans la zone de drop |
| `helperText` | `string` | `undefined` | Texte d'aide affiché sous le label |
| `disabled` | `boolean` | `false` | Désactive le composant |
| `showProgress` | `boolean` | `false` | Affiche la barre de progression |
| `currentFile` | `File \| null` | `null` | Fichier actuellement sélectionné |

## Exemples

### Upload de fichier audio

```tsx
<FileUpload
  onFileSelect={setAudioFile}
  accept={{
    'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
  }}
  maxSize={50 * 1024 * 1024}
  label='Glissez-déposez un fichier audio ici'
  helperText='Formats acceptés: MP3, WAV, OGG, M4A (max 50MB)'
  showProgress={true}
  currentFile={audioFile}
/>
```

### Upload d'image

```tsx
<FileUpload
  onFileSelect={setImageFile}
  accept={{
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  }}
  maxSize={10 * 1024 * 1024}
  label='Glissez-déposez une image ici'
  helperText='Formats acceptés: JPG, PNG, GIF, WebP (max 10MB)'
  currentFile={imageFile}
/>
```

### Upload de vidéo/animation

```tsx
<FileUpload
  onFileSelect={setVideoFile}
  accept={{
    'video/*': ['.mp4', '.webm', '.mov'],
    'image/gif': ['.gif']
  }}
  maxSize={100 * 1024 * 1024}
  label='Glissez-déposez une animation ici'
  helperText='Formats acceptés: MP4, WebM, MOV, GIF (max 100MB)'
  showProgress={true}
  currentFile={videoFile}
/>
```

### Utilisation dans un formulaire

```tsx
function MusicForm() {
  const [formData, setFormData] = useState({
    title: '',
    audioFile: null as File | null,
    coverImage: null as File | null
  })

  const handleSubmit = async () => {
    const data = new FormData()
    data.append('title', formData.title)
    if (formData.audioFile) {
      data.append('audio', formData.audioFile)
    }
    if (formData.coverImage) {
      data.append('cover', formData.coverImage)
    }
    
    await musicService.create(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FileUpload
        onFileSelect={(file) => setFormData({ ...formData, audioFile: file })}
        accept={{ 'audio/*': ['.mp3', '.wav'] }}
        maxSize={50 * 1024 * 1024}
        label='Fichier audio *'
        showProgress={true}
        currentFile={formData.audioFile}
      />
      
      <FileUpload
        onFileSelect={(file) => setFormData({ ...formData, coverImage: file })}
        accept={{ 'image/*': ['.jpg', '.png'] }}
        maxSize={5 * 1024 * 1024}
        label='Image de couverture'
        currentFile={formData.coverImage}
      />
      
      <Button type='submit'>Créer</Button>
    </form>
  )
}
```

## Validation

Le composant valide automatiquement:
- Le type de fichier (basé sur le MIME type)
- La taille du fichier (en bytes)

Les erreurs de validation sont affichées sous la zone de drop avec une icône d'alerte.

## Intégration avec useFileUpload

Le composant utilise le hook `useFileUpload` pour gérer:
- La validation des fichiers
- L'état de progression
- L'état d'upload
- Les erreurs

## Styling

Le composant utilise les composants Material-UI du template:
- `Box` pour la structure
- `Typography` pour les textes
- `LinearProgress` pour la barre de progression
- `Button` pour le bouton de suppression
- `styled` pour le wrapper de dropzone

Les couleurs et styles s'adaptent automatiquement au thème Material-UI.

## Tests

Des tests unitaires sont disponibles dans `__tests__/FileUpload.test.tsx`:
- Rendu avec label par défaut
- Rendu avec label personnalisé
- Affichage du texte d'aide
- Affichage des informations du fichier sélectionné
- Validation de la taille de fichier
- Affichage de la barre de progression
- État disabled
- Bouton de suppression

## Requirements validés

Ce composant valide les requirements suivants:
- **12.4**: Validation du type et de la taille du fichier côté client
- **12.6**: Affichage d'une barre de progression pendant l'upload
- **12.7**: Affichage d'un message de succès après upload
- **12.8**: Affichage d'un message d'erreur explicite en cas d'échec
- **10.1**: Réutilisation des composants de cards du template
- **10.2**: Réutilisation des composants de forms du template
- **10.3**: Réutilisation des composants de buttons du template
