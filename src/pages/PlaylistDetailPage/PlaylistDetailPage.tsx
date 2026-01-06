import { Navigate, useParams } from "react-router"
import useGetPlaylist from "../../hooks/useGetPlaylist"
import LoadingSpinner from "../../common/components/LoadingSpinner"
import ErrorMessage from "../../common/components/ErrorMessage"
import styles from "./PlaylistDetailPage.module.css"
import { MusicNoteOutlined } from "@mui/icons-material"
import useGetCurrentUserProfile from "../../hooks/useGetCurrentUserProfile"
import useGetPlaylistItems from "../../hooks/useGetPlaylistItems"
import { Avatar, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { useInView } from 'react-intersection-observer'
import DesktopPlaylistItem from "./components/DesktopPlaylistItem"
import { PAGE_LIMIT } from "../../configs/commonConfig"
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useEffect } from "react"
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmptyPlaylistWithSearch from "./components/EmptyPlaylistWithSearch"

const PlaylistDetailPage = () => {
  const {id} = useParams<{id:string}>()
  const { ref, inView } = useInView()
  if(id === undefined) return <Navigate to="/"/>
  const { data: userProfile } = useGetCurrentUserProfile()
  const {data:playlist, isLoading, error} = useGetPlaylist({playlist_id: id})

  const {data: playlistItems, isLoading: _isPlaylistItemsLoading, error: _playlistItemsLoading, hasNextPage, isFetchingNextPage, fetchNextPage} = useGetPlaylistItems({
    playlist_id: id, limit: PAGE_LIMIT})
  console.log("playlist items", playlistItems)

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <LoadingSpinner/>
if (error) {
  console.log("Full error:", error);
  if (
    error.message?.includes('401') || 
    error.message?.includes('Unauthorized') ||
    !userProfile
  ) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#1ed760', mb: 3 }} />
        <Typography variant="h4" mb={2}>Please log in again.</Typography>
        <Typography mb={4}>Login is required to view playlists.</Typography>
      </Box>
    );
  }
  return <ErrorMessage errorMessage={error.message} />;
}
  if (!playlist) return <div>Playlist not found</div> 

  const formatDuration = (totalMs: number): string => {
    const hours = Math.floor(totalMs / 1000 / 60 / 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const seconds = Math.floor((totalMs / 1000) % 60);
    
    if (hours > 0) {
      return `${hours} hour ${minutes} min ${seconds} sec`;
    }
    return `${minutes} min ${seconds} sec`;
  };

  const totalDuration = playlist?.tracks?.items
    ?.reduce((sum, item) => sum + (item.track.duration_ms || 0), 0) || 0;

  const hasImage = playlist.images && playlist.images.length > 0

return (
  <div className={styles.container}>
    <div className={styles.header}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img src={playlist.images?.[0]?.url} alt={playlist.name} />
        ) : (
          <div className={styles.defaultImage}>
            <MusicNoteOutlined sx={{ width: 64, height: 64, color: '#1ED760' }} />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.typeLabel}>PLAYLIST</p>
        <h1 className={styles.name}>{playlist.name}</h1>
        {playlist.description && <p className={styles.description}>{playlist.description}</p>}
        <div className={styles.owner}>
          {userProfile?.images?.length ? (
            <img className={styles.ownerImage} src={userProfile?.images[0].url} alt={userProfile.display_name || "User"} />
          ) : (
            <Avatar 
              src={userProfile?.images?.[0]?.url || undefined} 
              sx={{ 
                width: 24, 
                height: 24, 
                fontSize: 16,
              }}
            />
          )}
          <span className={styles.ownerText}>
            {userProfile?.display_name || "User"} {" • "}
            {playlist.tracks?.total || 0} {playlist.tracks?.total === 1 ? "song" : "songs"} {" • "}
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>
    </div>

    <div className={styles.tableWrapper}>
      <Table stickyHeader sx={{
        '&:last-child td': {
          borderBottom: 'none'
        },
        '& > *': { 
          borderBottom: 'none !important',
          paddingBottom: 0
        }
      }}>
        {playlist?.tracks?.total !== 0 && (
        <TableHead className={styles.tableHeader}>
          <TableRow>
            <TableCell className={styles.colIndex} sx={{ width: 50 }}>#</TableCell>
            <TableCell className={styles.colTitleThumb} sx={{ width: 60 }}></TableCell>
            <TableCell className={styles.colTitle} sx={{ width: 350 }}>Title</TableCell>
            <TableCell className={styles.colAlbum} sx={{ width: 250 }}>Album</TableCell>
            <TableCell className={styles.colDate} sx={{ width: 150 }}>Date added</TableCell>
            <TableCell className={styles.colDuration} sx={{ width: 80, textAlign: 'right' }}>
              <AccessTimeIcon sx={{ fontSize: 18, opacity: 0.7 }} />
            </TableCell>
          </TableRow>
        </TableHead>
      )}
        <TableBody>
          {playlist?.tracks?.total === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ 
                  height: '100%',
                  minHeight: 400,
                  position: 'relative',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                <EmptyPlaylistWithSearch playlistId={id}/>
              </TableCell>
            </TableRow>
          ) : (
            <>
              {playlistItems?.pages?.map((page, pageIndex) =>
                page.items.map((item, itemIndex) => (
                  <DesktopPlaylistItem
                    key={`${pageIndex}-${itemIndex}`}
                    index={pageIndex * PAGE_LIMIT + itemIndex + 1}
                    item={item}
                  />
                ))
              )}
              <TableRow>
                <TableCell colSpan={6} ref={ref} sx={{ height: 100 }}>
                  {isFetchingNextPage && <LoadingSpinner />}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
)

}

export default PlaylistDetailPage