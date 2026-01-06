import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addTracksToPlaylist, getPlaylist, type AddTracksToPlaylistRequest } from "../apis/playlistApi"
import type { InfiniteData } from "@tanstack/react-query"
import type { GetCurrentUserPlaylistResponse } from "../models/playlist"
import type { Image } from "../models/commonType"

interface ExtendedAddTracksToPlaylistRequest extends AddTracksToPlaylistRequest {
  trackImage?: string
}

const useAddTracksToPlaylist = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: ExtendedAddTracksToPlaylistRequest) => {
      const { trackImage, ...apiParams } = params
      return addTracksToPlaylist(apiParams)
    },
    onSuccess: async (_, variables) => {
      const { playlist_id, trackImage } = variables as ExtendedAddTracksToPlaylistRequest
      
      const currentTotal = queryClient.getQueriesData<InfiniteData<GetCurrentUserPlaylistResponse>>(
        { queryKey: ["current-user-playlists"] }
      )?.[0]?.[1]?.pages?.flatMap(page => page.items)
        .find(p => p.id === playlist_id)?.tracks?.total || 0
      
      const newTotal = currentTotal + variables.uris.length
      
      const playlistTotalsKey = 'playlist_tracks_totals'
      const storedTotals = JSON.parse(localStorage.getItem(playlistTotalsKey) || '{}')
      storedTotals[playlist_id] = newTotal
      localStorage.setItem(playlistTotalsKey, JSON.stringify(storedTotals))
      
      queryClient.setQueriesData<InfiniteData<GetCurrentUserPlaylistResponse>>(
        { queryKey: ["current-user-playlists"] },
        (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((playlist) => {
                if (playlist.id === playlist_id) {
                  const shouldUpdateImage = (!playlist.images || playlist.images.length === 0) && trackImage
                  return {
                    ...playlist,
                    tracks: {
                      ...playlist.tracks,
                      total: newTotal,
                    },
                    images: shouldUpdateImage 
                      ? [{ url: trackImage, height: 640, width: 640 }] as Image[]
                      : playlist.images,
                  }
                }
                return playlist
              }),
            })),
          }
        }
      )

      queryClient.invalidateQueries({ 
        queryKey: ['playlist-detail', playlist_id] 
      })
      
      queryClient.invalidateQueries({ 
        queryKey: ['playlist-items'] 
      })

      try {
        const updatedPlaylist = await getPlaylist({ playlist_id })
        if (updatedPlaylist && updatedPlaylist.tracks?.total) {
          const actualTotal = updatedPlaylist.tracks.total
          const storedTotals = JSON.parse(localStorage.getItem(playlistTotalsKey) || '{}')
          storedTotals[playlist_id] = actualTotal
          localStorage.setItem(playlistTotalsKey, JSON.stringify(storedTotals))
          
          queryClient.setQueriesData<InfiniteData<GetCurrentUserPlaylistResponse>>(
            { queryKey: ["current-user-playlists"] },
            (oldData) => {
              if (!oldData) return oldData

              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  items: page.items.map((playlist) => {
                    if (playlist.id === playlist_id) {
                      const shouldUpdateImage = (!playlist.images || playlist.images.length === 0) && trackImage
                      return {
                        ...playlist,
                        tracks: {
                          ...playlist.tracks,
                          total: actualTotal,
                        },
                        images: shouldUpdateImage 
                          ? [{ url: trackImage, height: 640, width: 640 }] as Image[]
                          : playlist.images,
                      }
                    }
                    return playlist
                  }),
                })),
              }
            }
          )
        }
      } catch (error) {
        console.error('Failed to fetch updated playlist:', error)
      }
    },
  })
}

export default useAddTracksToPlaylist