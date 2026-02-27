// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { ChildrenType } from '@core/types'

const NgoniLayout = ({ children }: ChildrenType) => {
  return (
    <Grid container spacing={6} sx={{ width: '100%', maxWidth: '100%' }}>
      <Grid item xs={12} sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>{children}</Grid>
    </Grid>
  )
}

export default NgoniLayout
