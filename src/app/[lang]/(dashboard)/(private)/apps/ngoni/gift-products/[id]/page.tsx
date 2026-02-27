// Component Imports
import GiftProductDetails from '@views/apps/ngoni/gift-products/GiftProductDetails'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Détails produit cadeau - Ngoni Admin',
  description: 'Voir et modifier les détails d\'un produit cadeau'
}

interface GiftProductDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function GiftProductDetailsPage({ params }: GiftProductDetailsPageProps) {
  const { id } = await params

  return <GiftProductDetails id={id} />
}
