import LoadingSpinner from '../../common/components/LoadingSpinner'
import useGetCurrentUserPlaylists from '../../hooks/useGetCurrentUserPlaylists'
import EmptyPlaylist from './EmptyPlaylist'
import Playlist from './Playlist'
import styles from './Library.module.css'
import useGetCurrentUserProfile from '../../hooks/useGetCurrentUserProfile'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState, useRef } from 'react'
import type { SimplifiedPlaylist } from '../../models/playlist'
import { useNavigate, useLocation } from 'react-router'

const Library = () => {
  const { ref, inView } = useInView({rootMargin: '0px 0px 500px 0px', threshold: 0});
  const {data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage} = useGetCurrentUserPlaylists({limit:10, offset:0})
  const {data:user} = useGetCurrentUserProfile()
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const pathMatch = location.pathname.match(/^\/playlist\/([^/]+)$/);
    if (pathMatch && pathMatch[1]) {
      setSelectedPlaylistId(pathMatch[1]);
      hasScrolledRef.current = false; 
    } else {
      setSelectedPlaylistId(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (selectedPlaylistId && !isLoading && data && !hasScrolledRef.current) {
      const timer = setTimeout(() => {
        const playlistElement = document.querySelector(`[data-playlist-id="${selectedPlaylistId}"]`);
        if (playlistElement && libraryRef.current) {
          playlistElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          hasScrolledRef.current = true;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedPlaylistId, isLoading, data]);

  useEffect(() => {
    if (selectedPlaylistId && !isLoading && data) {
      const playlists = data?.pages.flatMap(page => page.items) || [];
      const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
      
      if (!selectedPlaylist && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [selectedPlaylistId, isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(()=> {
    if(inView && hasNextPage && !isFetchingNextPage){
      fetchNextPage()
    }
  },[inView, fetchNextPage, hasNextPage, isFetchingNextPage])
  
  if (!user) return <EmptyPlaylist/>
  if (isLoading) return <LoadingSpinner/>
  if (error) return <EmptyPlaylist/>
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
    <div className={styles.library} ref={libraryRef}>
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