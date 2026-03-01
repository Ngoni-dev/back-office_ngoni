export interface PricingPlanType {
  popularPlan?: boolean
  imgSrc?: string
  imgHeight?: number
  imgWidth?: number
  title?: string
  subtitle?: string
  monthlyPrice?: number
  yearlyPlan?: {
    monthly: number
    annually: number
  }
  planBenefits?: string[]
  currentPlan?: boolean
}
