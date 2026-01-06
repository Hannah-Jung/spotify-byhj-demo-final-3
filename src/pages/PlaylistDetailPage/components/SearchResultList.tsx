import type { Track } from '../../../models/track'
import { Box, Button, TableCell, TableRow, CircularProgress } from '@mui/material'

interface SearchResultListProps {
  list: Track[],
  playlistId: string,
  onAddTrack: (trackUri: string, trackImage?: string) => void,
  addingTrackUri: string | null,
}

const SearchResultList = ({list, playlistId:_playlistId, onAddTrack, addingTrackUri}: SearchResultListProps) => {
    const formatDuration = (ms: number | undefined): string => {
    if (!ms) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleAddClick = (track: Track) => {
    if (track.uri && !addingTrackUri) { 
      const trackImage = track.album?.images?.[0]?.url || track.album?.images?.[2]?.url
      onAddTrack(track.uri, trackImage)
    }
  }

  return (
    <>
      {list.map((track, index) => {
        const trackName = track.name || 'Unknown'
        const artistNames = track.artists?.map((a) => a.name).join(', ') || 'Unknown'
        const albumName = track.album?.name || 'Unknown'
        const albumImage = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url
        const isAdding = addingTrackUri === track.uri 

        return (
          <TableRow 
            key={track.id || index} 
            hover 
            sx={{
              '& > *': { borderBottom: 'none !important' },
              '& td': { padding: '12px 16px !important' },
              margin: 0,
              padding: 0,
              marginBottom: 0,
              paddingBottom: 0
            }}
          >
            <TableCell sx={{ width: 60, padding: '12px 16px !important' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                width: '100%',
                height: 40 
              }}>
                <img
                  src={albumImage || '/placeholder.png'}
                  alt={albumName}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </TableCell>
            
            <TableCell sx={{ width: 350, textAlign: 'start', verticalAlign: 'middle', padding: '12px 16px !important' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500, fontSize: '1rem' }}>
                  {trackName}
                </span>
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.5 
                }}>
                  {artistNames}
                </span>
              </Box>
            </TableCell>
            
            <TableCell sx={{ width: 250, textAlign: 'start', verticalAlign: 'middle', padding: '12px 16px !important' }}>
              <span style={{ fontSize: '0.875rem' }}>
                {albumName}
              </span>
            </TableCell>
            
            <TableCell sx={{ width: 80, textAlign: 'left', padding: '12px 16px !important' }}>
              {track.duration_ms ? formatDuration(track.duration_ms) : '0:00'}
            </TableCell>
            
            <TableCell sx={{ width: 100, textAlign: 'center', padding: '12px 16px !important' }}>
              <Button
                onClick={() => handleAddClick(track)}
                disabled={isAdding || !!addingTrackUri}
                sx={{
                  minWidth: 'auto',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'none',
                  borderRadius: '30px',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 215, 96, 0.1)',
                    color: 'primary.main',
                  },
                  '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isAdding ? (
                  <CircularProgress 
                    size={14} 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                    }} 
                  />
                ) : (
                  'ADD'
                )}
              </Button>
            </TableCell>
          </TableRow>
        )
      })}
    </>
  )
}

export default SearchResultList