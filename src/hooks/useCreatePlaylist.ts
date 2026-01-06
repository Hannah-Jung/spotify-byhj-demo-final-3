import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPlaylist } from "../apis/playlistApi"
import useGetCurrentUserProfile from "./useGetCurrentUserProfile"
import type { CreatePlaylistRequest, Playlist, SimplifiedPlaylist, GetCurrentUserPlaylistResponse } from "../models/playlist"
import type { InfiniteData } from "@tanstack/react-query"

const useCreatePlaylist = () => { 
  const queryClient = useQueryClient()
  const {data:user} = useGetCurrentUserProfile()
  
  return useMutation({
    mutationFn:(params:CreatePlaylistRequest)=>{
      if(user){
        return createPlaylist(user.id, params)
      }
      return Promise.reject(new Error("User is not defined."))
    },
    onSuccess: (newPlaylist: Playlist) => { 
      queryClient.setQueriesData<InfiniteData<GetCurrentUserPlaylistResponse>>(
        { queryKey: ["current-user-playlists"] },
        (oldData) => {
          if (!oldData) return oldData

          const simplifiedPlaylist: SimplifiedPlaylist = {
            ...newPlaylist,
            tracks: { total: newPlaylist.tracks?.total || 0 },
          }

          const firstPage = oldData.pages[0]
          return {
            ...oldData,
            pages: [{
              ...firstPage,
              items: [simplifiedPlaylist, ...firstPage.items],
              total: (firstPage.total || 0) + 1,
            }, ...oldData.pages.slice(1)],
          }
        }
      )
   },
  })  
 }

export default useCreatePlaylist