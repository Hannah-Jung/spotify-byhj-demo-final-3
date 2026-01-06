import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addTracksToPlaylist, type AddTracksToPlaylistRequest } from "../apis/playlistApi"
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
    onSuccess: (_, variables) => {
      const { playlist_id, trackImage } = variables as ExtendedAddTracksToPlaylistRequest
      
      queryClient.invalidateQueries({ 
        queryKey: ['playlist-detail', playlist_id] 
      })
      
      queryClient.invalidateQueries({ 
        queryKey: ['playlist-items'] 
      })
      
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
                      total: (playlist.tracks?.total || 0) + variables.uris.length,
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
    },
  })
}

export default useAddTracksToPlaylist