import { MusicNoteOutlined, PlayArrow } from '@mui/icons-material';
import type { SimplifiedPlaylist } from '../../models/playlist';
import styles from './Playlist.module.css'
import { Tooltip } from '@mui/material';

interface PlaylistProps {
  playlists: SimplifiedPlaylist[]
  onPlaylistClick?: (playlist: SimplifiedPlaylist) => void
  selectedPlaylistId?: string | null
}

const Playlist = ({ playlists, onPlaylistClick, selectedPlaylistId }: PlaylistProps) => {
  return (
    <div className={styles.playlistGrid}>
      {playlists.map((playlist) => {
        const hasImage = playlist.images && playlist.images.length > 0;
        const isSelected = selectedPlaylistId === playlist.id;
        
        return (
          <div key={playlist.id} className={`${styles.playlistCard} ${isSelected ? styles.selected : ''}`} onClick={() => onPlaylistClick?.(playlist)}>
            <div className={styles.playlistImage}>
              {hasImage ? (
                <img 
                  src={playlist.images?.[0]?.url} 
                  alt={playlist.name}
                />
              ) : (
                <MusicNoteOutlined 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    color: '#1ed760' 
                  }} 
                />
              )}
              <PlayArrow className={styles.playlistPlayIcon} />
            </div>
            <div className={styles.playlistInfo}>
              <Tooltip 
                title={playlist.name}
                placement="bottom"
                arrow
                PopperProps={{
                  sx: {
                    '.MuiTooltip-tooltip': {
                      fontSize: '15px !important', 
                      padding: '15px 5px !important',
                      background: '#000'
                    }
                  }
                }}
              >
                <h3 data-full-title={playlist.name}>{playlist.name}</h3>
              </Tooltip>
              <p>{playlist.tracks?.total || 0} {playlist.tracks?.total === 1 ? 'song' : 'songs'}<b> · </b>{playlist.owner?.display_name || 'Unknown'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Playlist;