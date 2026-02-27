/**
 * Données factices pour les pages démo du template (academy, ecommerce, invoice, etc.).
 * L'app est 100% frontend : les données réelles viennent de l'API Ngoni Admin (consommée côté client).
 * Ce module évite les erreurs de build sur les pages template qui ne sont pas encore branchées sur l'API.
 */

import { db as profileData } from '@/fake-db/pages/userProfile'

export const getEcommerceData = async () => ({ products: [], orders: [], customers: [] })

export const getAcademyData = async () => ({ courses: [], categories: [] })

export const getLogisticsData = async () => ({ vehicles: [], orders: [] })

export const getInvoiceData = async () => ({ invoices: [] })

export const getUserData = async () => ({ users: [] })

export const getPermissionsData = async () => ({ permissions: [] })

export const getProfileData = async () => profileData

export const getFaqData = async () => ({ faq: [] })

export const getPricingData = async () => ({ plans: [] })

export const getStatisticsData = async () => ({})
