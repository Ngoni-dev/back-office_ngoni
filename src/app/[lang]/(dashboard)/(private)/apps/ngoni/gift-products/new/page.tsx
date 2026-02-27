// Component Imports
import GiftProductForm from '@views/apps/ngoni/gift-products/GiftProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nouveau produit cadeau - Ngoni Admin',
  description: 'Ajouter un nouveau produit cadeau'
}

export default function NewGiftProductPage() {
  return <GiftProductForm />
}
