import { InputAdornment, TextField, Typography, IconButton, Box, Grid, Card, CardContent, Tooltip } from '@mui/material'
import React, { useMemo, useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useNavigate, useParams } from 'react-router'
import useGetCategories from '../../hooks/useGetCategories'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import ErrorMessage from '../../common/components/ErrorMessage'
import styles from './SearchPage.module.css'
import useSearchItemsByKeyword from '../../hooks/useSearchItemsByKeyword'
import { SEARCH_TYPE } from '../../models/search'
import ResultCard from '../../common/components/Card'
import PlayButton from '../../common/components/PlayButton'
import useClientCredentialToken from '../../hooks/useClientCredentialToken'
import { PlayArrow } from '@mui/icons-material'

const SearchPage = () => {
  const { keyword: urlKeyword } = useParams<{ keyword?: string }>()
  const [keyword, setKeyword] = useState<string>(urlKeyword ? decodeURIComponent(urlKeyword) : "")
  const [isListHovered, setIsListHovered] = useState<boolean>(false)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null)
  const [hoveredTopResult, setHoveredTopResult] = useState<boolean>(false)
  const navigate = useNavigate()
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useGetCategories(50)
  const clientCredentialToken = useClientCredentialToken()

  useEffect(() => {
    if (urlKeyword) {
      setKeyword(decodeURIComponent(urlKeyword))
    } else {
      setKeyword("")
    }
  }, [urlKeyword])

  const hasSearchKeyword = keyword.trim().length > 0

  const { data: searchData, isLoading: isLoadingSearch, error: searchError } = useSearchItemsByKeyword({
    q: keyword.trim(),
    type: [SEARCH_TYPE.Track, SEARCH_TYPE.Album, SEARCH_TYPE.Artist],
    limit: 20,
  })

  const colorSeed = useMemo(() => Math.random().toString(), [])

  const formatDuration = (ms: number | undefined): string => {
    if (!ms) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSearchKeyword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = event.target.value
    setKeyword(event.target.value)
    if (newKeyword.trim()) {
      const newUrl = `/search/${encodeURIComponent(newKeyword.trim())}`
      window.history.replaceState({}, '', newUrl)
    } else {
      window.history.replaceState({}, '', '/search')
    }
  }

  const handleClearSearch = () => {
    setKeyword("")
    navigate('/search')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleListMouseEnter = () => setIsListHovered(true)
  const handleListMouseLeave = () => {
    setIsListHovered(false)
    setHoveredCardId(null)
  }
  const handleCardMouseEnter = (categoryId: string) => setHoveredCardId(categoryId)

  const getRandomColor = (categoryId: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80', '#138D75',
      '#EC7063', '#5DADE2', '#58D68D', '#F39C12', '#AF7AC5',
      '#E74C3C', '#3498DB', '#1ABC9C', '#F1C40F', '#9B59B6',
      '#E67E22', '#16A085', '#D35400', '#C0392B', '#8E44AD',
      '#27AE60', '#2980B9', '#D68910', '#7D3C98', 
    ]
    let hash = 0
    const seed = categoryId + colorSeed
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const handleCategoryClick = (categoryId: string) => {
    const color = getRandomColor(categoryId)
    navigate(`/category/${encodeURIComponent(categoryId)}?color=${encodeURIComponent(color)}`)
  }

  const searchResults = searchData?.pages[0]
  const tracks = (searchResults?.tracks?.items || []).filter((track): track is NonNullable<typeof track> => track !== null && track !== undefined)
  const albums = (searchResults?.albums?.items || []).filter((album): album is NonNullable<typeof album> => album !== null && album !== undefined)
  const artists = (searchResults?.artists?.items || []).filter((artist): artist is NonNullable<typeof artist> => artist !== null && artist !== undefined)
  
  const topResult = artists[0] || albums[0] || tracks[0] || null
  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0

  if (isLoadingCategories && !hasSearchKeyword) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <LoadingSpinner />
      </Box>
    )
  }

  if (categoriesError && !hasSearchKeyword) {
    return <ErrorMessage errorMessage={categoriesError.message} />
  }

  const categories = categoriesData?.categories.items || []

  return (
    <div className={styles.rootContainer}>
      <div className={styles.headerSection}>
        <Typography variant='h1' className={styles.title}>Search</Typography>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            className={styles.searchInput}
            value={keyword}
            onChange={handleSearchKeyword}
            placeholder="What do you want to play?"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: keyword && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end" className={styles.clearButton}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </form>
      </div>

      {hasSearchKeyword ? (
        <div className={styles.categoriesSection}>
          {!clientCredentialToken ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <LoadingSpinner />
            </Box>
          ) : isLoadingSearch ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <LoadingSpinner />
            </Box>
          ) : searchError ? (
            <ErrorMessage errorMessage={searchError instanceof Error ? searchError.message : 'Failed to load search results'} />
          ) : !hasResults ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h2">No results found</Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  {topResult && (
                    <Box>
                      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '25px' }}>Top result</Typography>
                      <div
                        className={styles.topResultCard}
                        onMouseEnter={() => setHoveredTopResult(true)}
                        onMouseLeave={() => setHoveredTopResult(false)}
                        style={{
                          backgroundColor: '#121212',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          position: 'relative',
                          height: '288px',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {topResult.type === 'artist' ? (
                          <>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '200px',
                                aspectRatio: '1',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                marginBottom: '8px',
                                position: 'relative',
                                flexShrink: 0,
                                alignSelf: 'center',
                              }}
                            >
                              <img
                                src={(topResult as any).images?.[0]?.url || ''}
                                alt={topResult.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <PlayButton 
                                sx={{
                                  position: 'absolute',
                                  bottom: '16px',
                                  right: '6px !important',
                                  opacity: hoveredTopResult ? 1 : 0,
                                  transform: hoveredTopResult ? 'translateY(80px)' : 'translateY(50px)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                }}
                              />
                            </div>
                            <Typography variant="h3" sx={{ fontWeight: 700, marginBottom: '5px', fontSize: '1.5rem', flexShrink: 0, textAlign: 'center' }}>
                              {topResult.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0, textAlign: 'center' }}>
                              Artist
                            </Typography>
                          </>
                        ) : topResult.type === 'track' ? (
                          <>
                            <div 
                              style={{ 
                                position: 'relative', 
                                marginBottom: '16px', 
                                flexShrink: 0, 
                                width: '100%', 
                                maxWidth: '200px', 
                                aspectRatio: '1', 
                                alignSelf: 'center' 
                              }}
                            >
                              <img
                                src={(topResult as any).album?.images?.[0]?.url || ''}
                                alt={topResult.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                }}
                              />
                              <PlayButton sx={{
                                  position: 'absolute',
                                  bottom: '16px',
                                  right: '8px',
                                  opacity: hoveredTopResult ? 1 : 0,
                                  transform: hoveredTopResult ? 'translateY(-5px)' : 'translateY(10px)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                }} />
                            </div>
                            <Typography variant="h3" sx={{ fontWeight: 700, marginBottom: '5px', fontSize: '1.5rem', flexShrink: 0, textAlign: 'center' }}>
                              {topResult.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0, textAlign: 'center' }}>
                              Song • {(topResult as any).artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <div 
                              style={{ 
                                position: 'relative', 
                                marginBottom: '16px', 
                                flexShrink: 0, 
                                width: '100%', 
                                maxWidth: '200px', 
                                aspectRatio: '1', 
                                alignSelf: 'center' 
                              }}
                            >
                              <img
                                src={(topResult as any).images?.[0]?.url || ''}
                                alt={topResult.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                }}
                              />
                              <PlayButton sx={{
                                  position: 'absolute',
                                  bottom: '16px',
                                  right: '8px',
                                  opacity: hoveredTopResult ? 1 : 0,
                                  transform: hoveredTopResult ? 'translateY(-5px)' : 'translateY(10px)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                }} />
                            </div>
                            <Typography variant="h3" sx={{ fontWeight: 700, marginBottom: '5px', fontSize: '1.5rem', flexShrink: 0, textAlign: 'center' }}>
                              {topResult.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0, textAlign: 'center' }}>
                              {(topResult as any).artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
                            </Typography>
                          </>
                        )}
                      </div>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 7.2 }}>
                  {tracks.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '25px' }}>Songs</Typography>
                      <Box sx={{ flex: 1 }}>
                        {tracks.slice(0, 4).map((track) => (
                          <Box
                            key={track.id}
                            onMouseEnter={() => setHoveredTrackId(track.id || null)}
                            onMouseLeave={() => setHoveredTrackId(null)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              padding: '8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            <Box 
                              sx={{ 
                                position: 'relative', 
                                width: '56px', 
                                height: '56px', 
                                flexShrink: 0,
                                overflow: 'hidden',
                                borderRadius: '4px',
                              }}
                            >
                              <img
                                src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || ''}
                                alt={track.name}
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  transition: 'opacity 0.2s ease',
                                  opacity: hoveredTrackId === track.id ? 0.5 : 1,
                                }}
                              />
                              {hoveredTrackId === track.id && (
                                <>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                      zIndex: 1,
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      zIndex: 2,
                                    }}
                                  >
                                    <IconButton
                                      sx={{
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        padding: '4px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                      }}
                                    >
                                      <PlayArrow sx={{ fontSize: 30 }} />
                                    </IconButton>
                                  </Box>
                                </>
                              )}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {track.name || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {track.artists?.map(a => a.name).join(', ') || 'Unknown'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {hoveredTrackId === track.id && (
                                <Tooltip title="Add to Liked Songs" placement="top" slotProps={{
                                  tooltip: {
                                    sx: {
                                      fontSize: '14px',
                                    }
                                  }
                                }}>
                                <IconButton
                                  sx={{
                                    color: 'white',
                                    padding: '4px',
                                  }}
                                >
                                  <AddCircleOutlineIcon />
                                </IconButton>
                                </Tooltip>
                              )}
                              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '40px', textAlign: 'right' }}>
                                {formatDuration(track.duration_ms)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {artists.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, fontSize: '25px' }}>Artists</Typography>
                  <Grid container spacing={2}>
                    {artists.slice(0, 6).map((artist) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={artist.id}>
                        <ResultCard image={(artist as any).images?.[0]?.url || ''} name={artist.name || 'Unknown'} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {albums.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 , fontSize: '25px'}}>Albums</Typography>
                  <Grid container spacing={2}>
                    {albums.slice(0, 6).map((album) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={album.id}>
                        <ResultCard
                          image={album.images?.[0]?.url || ''}
                          name={album.name || 'Unknown'}
                          artistName={album.artists?.map(a => a.name).join(', ') || 'Unknown'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </div>
      ) : (
        <div className={styles.categoriesSection}>
          <Typography variant='h2' className={styles.categoriesTitle}>Browse all</Typography>
          <Grid 
            container 
            spacing={2} 
            className={styles.categoriesGrid}
            onMouseEnter={handleListMouseEnter}
            onMouseLeave={handleListMouseLeave}
          >
            {categories.map((category) => {
              const isHovered = hoveredCardId === category.id
              const shouldDim = isListHovered && !isHovered
              const categoryIcon = category.icons?.[0]?.url
              
              return (
                <Grid size={{xs:12, sm:6, md:4, lg:3}} key={category.id}>
                  <Card
                    className={styles.categoryCard}
                    sx={{
                      backgroundColor: getRandomColor(category.id),
                      cursor: 'pointer',
                      transition: 'filter 0.3s ease, transform 0.2s ease',
                      filter: shouldDim ? 'brightness(0.5)' : 'brightness(1)',
                    }}
                    onClick={() => handleCategoryClick(category.id)}
                    onMouseEnter={() => handleCardMouseEnter(category.id)}
                  >
                    <CardContent className={styles.categoryCardContent}>
                      <Typography variant='h3' className={styles.categoryName}>
                        {category.name}
                      </Typography>
                      {categoryIcon && (
                        <img 
                          src={categoryIcon} 
                          alt={category.name}
                          className={styles.categoryImage}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </div>
      )}
    </div>
  )
}

export default SearchPage