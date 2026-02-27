'use client'

/**
 * FileUpload Component Usage Examples
 * 
 * This file demonstrates how to use the FileUpload component in different scenarios.
 */

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import FileUpload from './FileUpload'

// Example 1: Basic Audio File Upload
export const AudioFileUploadExample = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null)

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Upload Audio File
        </Typography>
        <FileUpload
          onFileSelect={setAudioFile}
          accept={{
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
          }}
          maxSize={50 * 1024 * 1024} // 50MB
          label='Glissez-déposez un fichier audio ici ou cliquez pour sélectionner'
          helperText='Formats acceptés: MP3, WAV, OGG, M4A (max 50MB)'
          currentFile={audioFile}
        />
      </CardContent>
    </Card>
  )
}

// Example 2: Image File Upload with Progress
export const ImageFileUploadExample = () => {
  const [imageFile, setImageFile] = useState<File | null>(null)

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Upload Image File
        </Typography>
        <FileUpload
          onFileSelect={setImageFile}
          accept={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
          }}
          maxSize={10 * 1024 * 1024} // 10MB
          label='Glissez-déposez une image ici ou cliquez pour sélectionner'
          helperText='Formats acceptés: JPG, PNG, GIF, WebP (max 10MB)'
          showProgress={true}
          currentFile={imageFile}
        />
      </CardContent>
    </Card>
  )
}

// Example 3: Video/Animation File Upload
export const VideoFileUploadExample = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null)

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Upload Animation File
        </Typography>
        <FileUpload
          onFileSelect={setVideoFile}
          accept={{
            'video/*': ['.mp4', '.webm', '.mov'],
            'image/gif': ['.gif']
          }}
          maxSize={100 * 1024 * 1024} // 100MB
          label='Glissez-déposez une animation ici ou cliquez pour sélectionner'
          helperText='Formats acceptés: MP4, WebM, MOV, GIF (max 100MB)'
          showProgress={true}
          currentFile={videoFile}
        />
      </CardContent>
    </Card>
  )
}

// Example 4: Disabled Upload
export const DisabledUploadExample = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Disabled Upload
        </Typography>
        <FileUpload
          onFileSelect={() => {}}
          disabled={true}
          label='Upload désactivé'
          helperText='Cette fonctionnalité est temporairement désactivée'
        />
      </CardContent>
    </Card>
  )
}

// Example 5: Complete Form with File Upload
export const CompleteFormExample = () => {
  const [formData, setFormData] = useState({
    title: '',
    audioFile: null as File | null,
    coverImage: null as File | null
  })

  const handleSubmit = async () => {
    if (!formData.audioFile) {
      alert('Veuillez sélectionner un fichier audio')
      return
    }

    // Create FormData for API submission
    const data = new FormData()
    data.append('title', formData.title)
    data.append('audio', formData.audioFile)
    if (formData.coverImage) {
      data.append('cover', formData.coverImage)
    }

    // Submit to API
    console.log('Submitting form data:', formData)
    // await musicService.create(data)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Create Music Form
        </Typography>
        <Box display='flex' flexDirection='column' gap={3}>
          <FileUpload
            onFileSelect={(file) => setFormData({ ...formData, audioFile: file })}
            accept={{
              'audio/*': ['.mp3', '.wav', '.ogg']
            }}
            maxSize={50 * 1024 * 1024}
            label='Fichier audio *'
            helperText='Formats: MP3, WAV, OGG (max 50MB)'
            showProgress={true}
            currentFile={formData.audioFile}
          />

          <FileUpload
            onFileSelect={(file) => setFormData({ ...formData, coverImage: file })}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png']
            }}
            maxSize={5 * 1024 * 1024}
            label='Image de couverture (optionnel)'
            helperText='Formats: JPG, PNG (max 5MB)'
            currentFile={formData.coverImage}
          />
        </Box>
      </CardContent>
    </Card>
  )
}
