import ErrorMessage from '../../common/components/ErrorMessage'
import LoadingSpinner from '../../common/components/LoadingSpinner'
import useGetCurrentUserPlaylists from '../../hooks/useGetCurrentUserPlaylists'
import EmptyPlaylist from './EmptyPlaylist'
import Playlist from './Playlist'
import styles from './Library.module.css'
import useGetCurrentUserProfile from '../../hooks/useGetCurrentUserProfile'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import type { SimplifiedPlaylist } from '../../models/playlist'
import { useNavigate } from 'react-router'

const Library = () => {
  const { ref, inView } = useInView({rootMargin: '0px 0px 500px 0px', threshold: 0});
  const {data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetCurrentUserPlaylists({limit:10, offset:0})
  const {data:user} = useGetCurrentUserProfile()
  const navigate = useNavigate();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  useEffect(()=> {
    if(inView && hasNextPage && !isFetchingNextPage){
      fetchNextPage()
    }
  },[inView, fetchNextPage, hasNextPage, isFetchingNextPage])
  if (!user) return <EmptyPlaylist/>
  if (isLoading) return <LoadingSpinner/>
  if (error) return <ErrorMessage errorMessage={error.message}/>
  console.log("current user playlists: ", data)

  const playlists = data?.pages.flatMap(page => page.items) || []
  
  const handlePlaylistClick = (playlist: SimplifiedPlaylist) => {
    console.log('playlist clicked', playlist.id, playlist.name);
    if(playlist.id){
      setSelectedPlaylistId(playlist.id);
    }    
    navigate(`/playlist/${playlist.id}`);
  };
  return (
    <div className={styles.library}>
      {playlists.length === 0 ? (<EmptyPlaylist/>) : (
        <>
          <Playlist playlists={(playlists)} onPlaylistClick={handlePlaylistClick} selectedPlaylistId={selectedPlaylistId}/>
          
          <div ref={ref} style={{ minHeight: '1px' }}>{isFetchingNextPage && <LoadingSpinner/>}</div>      
        </>
      )}      
    </div>    
  )
}

export default Library