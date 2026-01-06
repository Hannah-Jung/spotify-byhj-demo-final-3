import { InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, IconButton, Box } from '@mui/material'
import React, { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { SEARCH_TYPE } from '../../../models/search'
import useSearchItemsByKeyword from '../../../hooks/useSearchItemsByKeyword'
import SearchResultList from './SearchResultList'
import { useInView } from 'react-intersection-observer'
import LoadingSpinner from '../../../common/components/LoadingSpinner'
import styles from './EmptyPlaylistWithSearch.module.css'
import useAddTracksToPlaylist from '../../../hooks/useAddTracksToPlaylist'

interface EmptyPlaylistWithSearchProps {
  playlistId: string,
}

const EmptyPlaylistWithSearch = ({ playlistId }: EmptyPlaylistWithSearchProps) => {
  const [keyword, setKeyword] = useState<string>("")
  const [addingTrackUri, setAddingTrackUri] = useState<string | null>(null)
  const { ref, inView } = useInView()
  const { data, error, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useSearchItemsByKeyword({
    q: keyword, 
    type:[SEARCH_TYPE.Track],
  })
  const addTracksMutation = useAddTracksToPlaylist()
  
  const handleSearchKeyword = (event:React.ChangeEvent<HTMLInputElement>) => { 
    setKeyword(event.target.value)
  }

  const handleClearSearch = () => {
    setKeyword("")
  }

  const handleAddTrack = async (trackUri: string, trackImage?: string) => {
    setAddingTrackUri(trackUri)
    try {
      await addTracksMutation.mutateAsync({
        playlist_id: playlistId,
        uris: [trackUri],
        trackImage,
      })
    } catch (error) {
      console.error('Failed to add track:', error)
    } finally {
      setAddingTrackUri(null)
    }
  }

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const hasResults = data?.pages.some(page => page.tracks?.items && page.tracks.items.length > 0)
  const totalResults = data?.pages[0]?.tracks?.total || 0
  const hasSearched = keyword.trim().length > 0
  const showNoResults = hasSearched && !isLoading && totalResults === 0

  if (error && hasSearched) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">
          Failed to load search results.
        </Typography>
      </Box>
    )
  }

  return (
    <div className={styles.rootContainer}>
      <div className={hasResults ? styles.stickyContainer : styles.headerSection}>
        <div className={styles.headerSection}>
          <Typography variant='h1' className={styles.title}>
            {keyword && totalResults > 0 
              ? `There are ${totalResults} results of "${keyword}"`
              : "Let's find something for your playlist"
            }
          </Typography>
          <TextField 
            className={styles.searchInput}
            value={keyword} 
            onChange={handleSearchKeyword}
            placeholder="Search for songs or episodes"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '500px',
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: keyword && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      edge="end"
                      className={styles.clearButton}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {isLoading && hasSearched && (
            <Box className={styles.loadingSpinner}>
              <LoadingSpinner />
            </Box>
          )}
        </div>
        {hasResults && (
          <div className={styles.resultsTable}>
            <Table className={styles.resultsTable}>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.tableHeaderCell} sx={{ width: 60, padding: '12px 16px' }}></TableCell>
                  <TableCell className={styles.tableHeaderCell} sx={{ width: 350, textAlign: 'start', verticalAlign: 'middle', padding: '12px 16px' }}>Title</TableCell>
                  <TableCell className={styles.tableHeaderCell} sx={{ width: 250, textAlign: 'start', verticalAlign: 'middle', padding: '12px 16px' }}>Album</TableCell>
                  <TableCell className={`${styles.tableHeaderCell} ${styles.durationCell}`} sx={{ width: 80, textAlign: 'start', verticalAlign: 'middle', padding: '12px 16px' }}>
                    <AccessTimeIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                  </TableCell>
                  <TableCell className={`${styles.tableHeaderCell} ${styles.addCell}`} sx={{ width: 100, textAlign: 'center', verticalAlign: 'middle', padding: '12px 16px' }}>Add</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </div>
        )}
      </div>
      {showNoResults && (
        <Box className={styles.noResults}>
          <Typography variant='body1' className={styles.noResultsText}>
            No results for "{keyword}"
          </Typography>
        </Box>
      )}
      {hasResults && (
        <div className={styles.resultsContainer}>
          <Table className={styles.resultsTable}>
            <TableBody>
              {data?.pages.map((page, pageIndex) => {
                if (!page.tracks?.items) return null
                return (
                  <SearchResultList  
                    key={pageIndex} 
                    list={page.tracks.items} 
                    playlistId={playlistId}
                    onAddTrack={(trackUri, trackImage) => handleAddTrack(trackUri, trackImage)}
                    addingTrackUri={addingTrackUri}
                  />
                )
              })}
              <TableRow>
                <TableCell colSpan={5} ref={ref} className={styles.loadingCell}>
                  {isFetchingNextPage && <LoadingSpinner />}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default EmptyPlaylistWithSearch