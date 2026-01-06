import { Box, Grid, Typography } from '@mui/material'
import { useParams, useSearchParams } from 'react-router'
import useGetCategories from '../../hooks/useGetCategories'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import ErrorMessage from '../../common/components/ErrorMessage'
import Card from '../../common/components/Card'
import styles from './SearchWithKeywordPage.module.css'
import useGetCategoryPlaylists from '../../hooks/useGetCategoryPlaylists'

const SearchWithKeywordPage = () => {
  const { keyword } = useParams<{ keyword: string }>()
  const [searchParams] = useSearchParams()
  const decodedKeyword = keyword ? decodeURIComponent(keyword) : ''
  const categoryColor = searchParams.get('color') || '#8B5CF6'
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useGetCategories(50)
  const category = categoriesData?.categories.items.find(
    cat => cat.id === decodedKeyword || cat.name.toLowerCase() === decodedKeyword.toLowerCase()
  )
  
  const { data, isLoading: isLoadingPlaylists, error: playlistsError } = useGetCategoryPlaylists(
    category?.id || '', 
    category?.name || '',
    24
  )
  if (playlistsError) {
    console.error('Playlists error:', playlistsError)
  }

  if (isLoadingCategories) {
    return <LoadingSpinner />
  }

  if (categoriesError) {
    return <ErrorMessage errorMessage={categoriesError instanceof Error ? categoriesError.message : 'Failed to load categories'} />
  }

  if (!category) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h2">Category not found</Typography>
      </Box>
    )
  }

  if (isLoadingPlaylists) {
    return <LoadingSpinner />
  }

  if (playlistsError) {
    return <ErrorMessage errorMessage={playlistsError instanceof Error ? playlistsError.message : 'Failed to load playlists'} />
  }

  const playlists = data?.playlists.items || []
  const validPlaylists = playlists.filter((playlist): playlist is NonNullable<typeof playlist> => playlist !== null && playlist !== undefined)

  return (
    <div className={styles.rootContainer}>
      <div 
        className={styles.headerSection}
        style={{
          borderRadius: '8px 8px 0 0', background: `linear-gradient(to top, ${categoryColor} 0%, rgba(255, 255, 255, 1) 175%)`
        }}
      >
        <Typography variant='h1' className={styles.categoryTitle}>
          {category.name}
        </Typography>
      </div>

      <div className={styles.contentSection}>
        {validPlaylists.length > 0 ? (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}>
            <Grid 
              container 
              spacing={2}
              columns={{ xs: 12, sm: 12, md: 12 }}
            >
              {validPlaylists.map((playlist) => (
                <Grid 
                  size={{ 
                    xs: 6,
                    sm: 4,
                    md: 3,
                    lg: 2
                  }} 
                  key={playlist.id}
                >
                  <Card 
                    image={playlist.images?.[0]?.url || ''} 
                    name={playlist.name || 'Untitled Playlist'} 
                    artistName={playlist.owner?.display_name || 'Unknown'} 
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Typography variant='h2'>No playlists found</Typography>
        )}
      </div>
    </div>
  )
}

export default SearchWithKeywordPage