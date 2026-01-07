import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from "@tanstack/react-query"
import { getCurrentUserPlaylists } from "../apis/playlistApi"
import type { GetCurrentUserPlaylistRequest, GetCurrentUserPlaylistResponse } from "../models/playlist"

const useGetCurrentUserPlaylists = ({limit, offset}:GetCurrentUserPlaylistRequest):UseInfiniteQueryResult<InfiniteData<GetCurrentUserPlaylistResponse, Error>, Error> => { 
  const accessToken = localStorage.getItem("access_token")
  return useInfiniteQuery({
    queryKey: ["current-user-playlists", {offset, limit}], 
    refetchOnMount: true,
    refetchOnReconnect: false, 
    refetchOnWindowFocus: false,
    structuralSharing: false,
    enabled: !!accessToken,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getCurrentUserPlaylists({limit, offset:pageParam})
      
      const playlistTotalsKey = 'playlist_tracks_totals'
      const storedTotals = JSON.parse(localStorage.getItem(playlistTotalsKey) || '{}')
      
      if (Object.keys(storedTotals).length > 0) {
        response.items = response.items.map(playlist => {
          if (playlist.id && storedTotals[playlist.id] !== undefined) {
            return {
              ...playlist,
              tracks: {
                ...playlist.tracks,
                total: storedTotals[playlist.id],
              }
            }
          }
          return playlist
        })
      }
      
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage)=>{
      if(lastPage.next){
        const url = new URL(lastPage.next)
        const nextOffset = url.searchParams.get("offset")
        return nextOffset ? parseInt(nextOffset):undefined
      }
      return undefined
    }
  })
 }

export default useGetCurrentUserPlaylists