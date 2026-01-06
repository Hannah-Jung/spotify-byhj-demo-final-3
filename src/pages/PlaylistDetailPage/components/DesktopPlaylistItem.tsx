import { useEffect, useState } from 'react'
import type { PlaylistTrack } from '../../../models/playlist'
import { TableCell, TableRow, Box } from '@mui/material'
import type { Episode, Track } from '../../../models/track'
import styles from "../PlaylistDetailPage.module.css"

interface DesktopPlaylistItemProps {
  index: number,
  item: PlaylistTrack,
}

const DesktopPlaylistItem = ({ item, index }: DesktopPlaylistItemProps) => {
  const isEpisode = (track: Track | Episode): track is Episode => {
    return "description" in track;
  };

  const track = item.track;
  if (!track) {
    return (
      <TableRow>
        <TableCell>{index}</TableCell>
        <TableCell colSpan={5}>No track data</TableCell>
      </TableRow>
    );
  }

  const isEp = isEpisode(track);
  const trackName = track.name || 'Unknown';
  const artistNames = !isEp 
    ? track.artists?.map((a) => a.name).join(', ') || 'Unknown'
    : 'N/A';
  const albumName = isEp ? "N/A" : track.album?.name || 'Unknown';

  const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const addedDate = new Date(dateString);
  const diffMs = now.getTime() - addedDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)} days ago`;
  
  return addedDate.toLocaleDateString();
  };

  const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

  const [_refreshTime, setRefreshTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <TableRow hover sx={{'& > *': { borderBottom: 'none !important' }}}>
      <TableCell className={styles.colIndex} sx={{ width: 50, padding: '12px 16px' }}>
        {index}
      </TableCell>
      <TableCell className={styles.colTitleThumb} sx={{ width: 60 }}>
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    height: 64 
  }}>
    <img
      src={(track as Track).album?.images?.[2]?.url || '/placeholder.png'}
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
      
      <TableCell className={styles.colTitle} sx={{ width: 350, padding: '12px 16px' }}>
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
      
      <TableCell className={styles.colAlbum} sx={{ width: 250, padding: '12px 16px' }}>
        <span style={{ fontSize: '0.875rem' }}>
          {albumName}
        </span>
      </TableCell>
      
      <TableCell className={styles.colDate} sx={{ width: 150, padding: '12px 16px' }}>
        {item.added_at ? formatRelativeTime(item.added_at) : 'Unknown'}
      </TableCell>
      
      <TableCell className={styles.colDuration} sx={{ width: 80, padding: '12px 16px', textAlign: 'right' }}>
        {track.duration_ms ? formatDuration(track.duration_ms) : '0:00'}
      </TableCell>
    </TableRow>
  );
};

export default DesktopPlaylistItem;