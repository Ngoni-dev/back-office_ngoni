'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

// Component Imports
import GiftProductForm from '@/components/gift/GiftProductForm'
import GiftProductList from '@/components/gift/GiftProductList'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'

// Hook Imports
import { useGift } from '@/hooks/useGift'

// Type Imports
import type { GiftProduct, GiftProductCreateRequest, GiftProductUpdateRequest } from '@/types/gift.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { toast } from 'react-toastify'

export default function GiftsPage() {
  const router = useRouter()
  const { lang } = useParams()
  const { createGiftProduct, updateGiftProduct, deleteGiftProduct, fetchGiftProducts } = useGift()

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<GiftProduct | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const handleCreate = () => {
    setSelectedProduct(undefined)
    setOpenDialog(true)
  }

  const handleEdit = (product: GiftProduct) => {
    setSelectedProduct(product)
    setOpenDialog(true)
  }

  const handleView = (product: GiftProduct) => {
    router.push(getLocalizedUrl(`/apps/ngoni/gifts/${product.id}`, lang as string))
  }

  const handleDelete = async (product: GiftProduct) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      return
    }

    try {
      await deleteGiftProduct(product.id)
      toast.success('Produit cadeau supprimé avec succès')
      await fetchGiftProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Erreur lors de la suppression du produit')
    }
  }

  const handleToggleActive = async (product: GiftProduct) => {
    // The toggle is handled in the GiftProductList component
    // This is just a callback for additional actions if needed
    console.log('Product status toggled:', product)
  }

  const handleSubmit = async (data: GiftProductCreateRequest | GiftProductUpdateRequest) => {
    setLoading(true)
    try {
      if (selectedProduct) {
        // Update existing product
        await updateGiftProduct(selectedProduct.id, data as GiftProductUpdateRequest)
        toast.success('Produit cadeau mis à jour avec succès')
      } else {
        // Create new product
        await createGiftProduct(data as GiftProductCreateRequest)
        toast.success('Produit cadeau créé avec succès')
      }
      setOpenDialog(false)
      await fetchGiftProducts()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Erreur lors de l\'enregistrement du produit')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setOpenDialog(false)
    setSelectedProduct(undefined)
  }

  return (
    <>
      <NgoniBreadcrumbs items={[{ label: 'Produits Cadeaux' }]} />
      
      <GiftProductList
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCancel}
        maxWidth='md'
        fullWidth
      >
        <DialogContent>
          <GiftProductForm
            product={selectedProduct}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
