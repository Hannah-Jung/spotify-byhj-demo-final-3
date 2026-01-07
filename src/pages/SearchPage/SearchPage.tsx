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
import type { Track } from '../../models/track'
import type { Artist } from '../../models/artist'
import type { SimplifiedAlbum } from '../../models/album'

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
    type: [SEARCH_TYPE.Track, SEARCH_TYPE.Album, SEARCH_TYPE.Artist, SEARCH_TYPE.Playlist, SEARCH_TYPE.Show, SEARCH_TYPE.Episode, SEARCH_TYPE.AudioBook],
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

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    const color = getRandomColor(categoryId)
    navigate(`/category/${encodeURIComponent(categoryName)}?color=${encodeURIComponent(color)}`)
  }

  const searchResults = searchData?.pages[0]
  const tracks = (searchResults?.tracks?.items || []).filter((track): track is NonNullable<typeof track> => track !== null && track !== undefined)
  const albums = (searchResults?.albums?.items || []).filter((album): album is NonNullable<typeof album> => album !== null && album !== undefined)
  const artists = (searchResults?.artists?.items || []).filter((artist): artist is NonNullable<typeof artist> => artist !== null && artist !== undefined)
  const playlists = (searchResults?.playlists?.items || []).filter((playlist): playlist is NonNullable<typeof playlist> => playlist !== null && playlist !== undefined)
  const shows = (searchResults?.shows?.items || []).filter((show): show is NonNullable<typeof show> => show !== null && show !== undefined)
  const episodes = (searchResults?.episodes?.items || []).filter((episode): episode is NonNullable<typeof episode> => episode !== null && episode !== undefined)
  const audiobooks = (searchResults?.audiobooks?.items || []).filter((audiobook): audiobook is NonNullable<typeof audiobook> => audiobook !== null && audiobook !== undefined)

  const topResult = tracks[0] || artists[0] || albums[0] || null
  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0 || playlists.length > 0 || shows.length > 0 || episodes.length > 0 || audiobooks.length > 0

  if (isLoadingCategories && !hasSearchKeyword) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <LoadingSpinner />
      </Box>
    )
  }

  if (categoriesError && !hasSearchKeyword) {
    return <ErrorMessage error={categoriesError} />
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
        searchError ? (
          <ErrorMessage error={searchError} />
        ) : (
          <div className={styles.categoriesSection}>
            {!clientCredentialToken ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <LoadingSpinner />
              </Box>
            ) : isLoadingSearch ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <LoadingSpinner />
              </Box>
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
                      <Typography variant="h2" className={styles.sectionTitle}>Top result</Typography>
                      <div
                        className={styles.topResultCard}
                        onMouseEnter={() => setHoveredTopResult(true)}
                        onMouseLeave={() => setHoveredTopResult(false)}
                      >
                        {'album' in topResult ? (
                          (() => {
                            const track = topResult as Track
                            return (
                              <>
                                <div className={`${styles.topResultImageContainer} ${styles.album}`}>
                                  <img
                                    src={track.album?.images?.[0]?.url || ''}
                                    alt={track.name || ''}
                                    className={styles.topResultImage}
                                  />
                                  <PlayButton 
                                    sx={{
                                      position: 'absolute !important',
                                      bottom: '2px !important',
                                      right: '7px !important',
                                      opacity: hoveredTopResult ? 1 : 0,
                                      transform: hoveredTopResult ? 'translateY(-5px)' : 'translateY(10px)',
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                      boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                      zIndex: 2,
                                    }}
                                  />
                                </div>
                                <Typography variant="h3" className={styles.topResultTitle}>
                                  {track.name}
                                </Typography>
                                <Typography variant="body2" className={styles.topResultSubtitle} sx={{ color: 'text.secondary' }}>
                                  Song • {track.artists?.map((a) => a.name).join(', ') || 'Unknown'}
                                </Typography>
                              </>
                            )
                          })()
                        ) : 'artists' in topResult && Array.isArray(topResult.artists) ? (
                          (() => {
                            const album = topResult as unknown as SimplifiedAlbum
                            return (
                              <>
                                <div className={`${styles.topResultImageContainer} ${styles.album}`}>
                                  <img
                                    src={album.images?.[0]?.url || ''}
                                    alt={album.name || ''}
                                    className={styles.topResultImage}
                                  />
                                  <PlayButton 
                                    sx={{
                                      position: 'absolute !important',
                                      bottom: '2px !important',
                                      right: '7px !important',
                                      opacity: hoveredTopResult ? 1 : 0,
                                      transform: hoveredTopResult ? 'translateY(-5px)' : 'translateY(10px)',
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                      boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                      zIndex: 2,
                                    }}
                                  />
                                </div>
                                <Typography variant="h3" className={styles.topResultTitle}>
                                  {album.name}
                                </Typography>
                                <Typography variant="body2" className={styles.topResultSubtitle} sx={{ color: 'text.secondary' }}>
                                  {album.artists?.map((a) => a.name).join(', ') || 'Unknown'}
                                </Typography>
                              </>
                            )
                          })()
                        ) : (
                          (() => {
                            const artist = topResult as unknown as Artist
                            return (
                              <>
                                <div className={styles.topResultImageContainer}>
                                  <img
                                    src={artist.images?.[0]?.url || ''}
                                    alt={artist.name || ''}
                                    className={`${styles.topResultImage} ${styles.artist}`}
                                  />
                                  <PlayButton 
                                    sx={{
                                      position: 'absolute !important',
                                      bottom: '2px !important',
                                      right: '7px !important',
                                      opacity: hoveredTopResult ? 1 : 0,
                                      transform: hoveredTopResult ? 'translateY(-5px)' : 'translateY(10px)',
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                      boxShadow: hoveredTopResult ? '0 4px 12px rgba(0, 0, 0, 0.7)' : 'none',
                                      zIndex: 2,
                                    }}
                                  />
                                </div>
                                <Typography variant="h3" className={styles.topResultTitle}>
                                  {artist.name}
                                </Typography>
                                <Typography variant="body2" className={styles.topResultSubtitle} sx={{ color: 'text.secondary' }}>
                                  Artist
                                </Typography>
                              </>
                            )
                          })()
                        )}
                      </div>
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 7.2 }}>
                  {tracks.length > 0 && (
                    <Box className={styles.trackListContainer}>
                    <Typography variant="h2" className={styles.sectionTitle}>Songs</Typography>
                    <Box sx={{ flex: 1 }}>
                      {tracks.slice(0, 4).map((track) => (
                        <Box
                          key={track.id}
                          className={styles.trackItem}
                          onMouseEnter={() => setHoveredTrackId(track.id || null)}
                          onMouseLeave={() => setHoveredTrackId(null)}
                        >
                          <Box className={styles.trackImageContainer}>
                            <img
                              src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || ''}
                              alt={track.name}
                              className={styles.trackImage}
                              style={{
                                opacity: hoveredTrackId === track.id ? 0.5 : 1,
                              }}
                            />
                            {hoveredTrackId === track.id && (
                              <>
                                <Box className={styles.trackOverlay} />
                                <Box className={styles.trackPlayButtonContainer}>
                                  <IconButton className={styles.trackPlayIconButton}>
                                    <PlayArrow sx={{ fontSize: 30 }} />
                                  </IconButton>
                                </Box>
                              </>
                            )}
                          </Box>
                          <Box className={styles.trackContent}>
                            <Typography variant="body1" className={styles.trackTitle}>
                              {track.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" className={styles.trackArtist} sx={{ color: 'text.secondary' }}>
                              {track.artists?.map(a => a.name).join(', ') || 'Unknown'}
                            </Typography>
                          </Box>
                          <Box className={styles.trackActions}>
                            {hoveredTrackId === track.id && (
                              <Tooltip title="Add to Liked Songs" placement="top" slotProps={{
                                tooltip: {
                                  sx: {
                                    fontSize: '14px',
                                  }
                                }
                              }}>
                                <IconButton className={styles.trackAddButton}>
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Typography variant="body2" className={styles.trackDuration} sx={{ color: 'text.secondary' }}>
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
                  <Typography variant="h2" className={styles.sectionTitle}>Artists</Typography>
                  <Grid container spacing={2}>
                    {artists.slice(0, 6).map((artist) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={artist.id}>
                        <ResultCard image={(artist as any).images?.[0]?.url || ''} name={artist.name || 'Unknown'} artistName="Artist" isArtist={true}/>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {albums.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" className={styles.sectionTitle}>Albums</Typography>
                  <Grid container spacing={2}>
                    {albums.slice(0, 6).map((album) => {
                      const releaseYear = album.release_date 
                        ? new Date(album.release_date).getFullYear() 
                        : null;
                      const artistNames = album.artists?.map(a => a.name).join(', ') || 'Unknown';
                      const displayText = releaseYear 
                        ? `${releaseYear} • ${artistNames}`
                        : artistNames;
                      
                      return (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={album.id}>
                          <ResultCard
                            image={album.images?.[0]?.url || ''}
                            name={album.name || 'Unknown'}
                            artistName={displayText}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
              {playlists.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" className={styles.sectionTitle}>Playlists</Typography>
                  <Grid container spacing={2}>
                    {playlists.slice(0, 6).map((playlist) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={playlist.id}>
                        <ResultCard
                          image={playlist.images?.[0]?.url || ''}
                          name={playlist.name || 'Unknown'}
                          artistName={playlist.owner?.display_name || 'Unknown'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {shows.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" className={styles.sectionTitle}>Podcasts</Typography>
                  <Grid container spacing={2}>
                    {shows.slice(0, 6).map((show) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={show.id}>
                        <ResultCard
                          image={(show.images as any)?.url || (Array.isArray(show.images) ? show.images?.[0]?.url : '') || ''}
                          name={show.name || 'Unknown'}
                          artistName={show.publisher || 'Unknown'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {episodes.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" className={styles.sectionTitle}>Episodes</Typography>
                  <Grid container spacing={2}>
                    {episodes.slice(0, 6).map((episode) => {
                      const episodeImages = Array.isArray(episode.images) ? episode.images : (episode.images ? [episode.images] : [])
                      const showName = 'show' in episode ? (episode as any).show?.name : 'Unknown'
                      return (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={episode.id}>
                          <ResultCard
                            image={episodeImages[0]?.url || ''}
                            name={episode.name || 'Unknown'}
                            artistName={showName || 'Unknown'}
                          />
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              )}

              {audiobooks.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h2" className={styles.sectionTitle}>Audiobooks</Typography>
                  <Grid container spacing={2}>
                    {audiobooks.slice(0, 6).map((audiobook) => (
                      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={audiobook.id}>
                        <ResultCard
                          image={audiobook.images?.[0]?.url || ''}
                          name={audiobook.name || 'Unknown'}
                          artistName={audiobook.author?.map((a: {name: string}) => a.name).join(', ') || audiobook.publisher || 'Unknown'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </div>
        )
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
                    onClick={() => handleCategoryClick(category.id, category.name)}
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