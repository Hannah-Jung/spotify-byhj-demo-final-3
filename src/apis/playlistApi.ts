import type { CreatePlaylistRequest, GetCurrentUserPlaylistRequest, GetCurrentUserPlaylistResponse, GetPlaylistItemsRequest, GetPlaylistItemsResponse, GetPlaylistRequest, Playlist } from "../models/playlist"
import api from "../utils/api"

export const getCurrentUserPlaylists = async({limit, offset}:GetCurrentUserPlaylistRequest):Promise<GetCurrentUserPlaylistResponse>=> {
  try {
    const response = await api.get(`/me/playlists`, {
      params: {limit, offset}
    })
    return response.data
  } catch (error) {
    throw new Error("Failed to fetch current user playlists")
  }
}

export const getPlaylist = async (params:GetPlaylistRequest): Promise<Playlist> => { 
  try {
    const response = await api.get(`/playlists/${params.playlist_id}`, {
        params,
      })
      return response.data
  } catch (error) {
    throw new Error("Failed to fetch playlist detail")
  }
} 

export const getPlaylistItems = async(params: GetPlaylistItemsRequest):Promise<GetPlaylistItemsResponse> => { 
  try {
    const response = await api.get(`/playlists/${params.playlist_id}/tracks`, {params})
    return response.data
  } catch (error) {
    throw new Error("Failed to fetch playlist items")
  }  
}

export const createPlaylist = async(user_id:string, params:CreatePlaylistRequest):Promise<Playlist> => { 
  try {
    const {name, playlistPublic, collaborative, description} = params
    const response = await api.post(`/users/${user_id}/playlists`, {name, public: playlistPublic, collaborative, description})
    return response.data
  } catch (error) {
    throw new Error("Failed to create playlist")
  }
 }
 
//added
export interface AddTracksToPlaylistRequest {
  playlist_id: string,
  uris: string[], 
  position?: number, 
}

export interface AddTracksToPlaylistResponse {
  snapshot_id: string,
}

export const addTracksToPlaylist = async(params: AddTracksToPlaylistRequest): Promise<AddTracksToPlaylistResponse> => {
  try {
    const { playlist_id, uris, position } = params
    const response = await api.post(`/playlists/${playlist_id}/tracks`, {
      uris,
      position
    })
    return response.data
  } catch (error) {
    throw new Error("Failed to add tracks to playlist")
  }
}