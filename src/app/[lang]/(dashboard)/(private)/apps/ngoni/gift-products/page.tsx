// Component Imports
import GiftProductList from '@views/apps/ngoni/gift-products/GiftProductList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produits Cadeaux - Ngoni Admin',
  description: 'Gérer les produits cadeaux Ngoni'
}

export default function GiftProductsPage() {
  return <GiftProductList />
}
