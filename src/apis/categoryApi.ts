import axios from "axios"
import { SPOTIFY_BASE_URL } from "../configs/commonConfig"
import type { GetCategoriesResponse } from "../models/category"
import type { ApiResponse } from "../models/apiResponse"
import type { SimplifiedPlaylist } from "../models/playlist"

export const getCategories = async (clientCredentialToken: string, limit: number = 50): Promise<GetCategoriesResponse> => {
  try {
    const response = await axios.get(`${SPOTIFY_BASE_URL}/browse/categories`, {
      params: {
        limit,
      },
      headers: {
        Authorization: `Bearer ${clientCredentialToken}`,
        "Content-Type": "application/json",
      }
    })
    return response.data
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
          throw error
        }
        throw new Error("Failed to fetch categories")
      }
    }

export const getCategoryPlaylists = async (
  clientCredentialToken: string, 
  categoryId: string,
  categoryName: string,
  limit: number = 20
): Promise<{ playlists: ApiResponse<SimplifiedPlaylist> }> => {
  try {
    try {
      const response = await axios.get(`${SPOTIFY_BASE_URL}/browse/categories/${categoryId}/playlists`, {
        params: {
          limit,
        },
        headers: {
          Authorization: `Bearer ${clientCredentialToken}`,
          "Content-Type": "application/json",
        }
      })
      return response.data
    } catch (categoryError: any) {
      if (categoryError.response?.status === 404) {
        console.log(`Category playlists endpoint not available, using search API for: ${categoryName}`)
        const searchResponse = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
          params: {
            q: `genre:"${categoryName}"`,
            type: 'playlist',
            limit,
          },
          headers: {
            Authorization: `Bearer ${clientCredentialToken}`,
            "Content-Type": "application/json",
          }
        })
        return {
          playlists: searchResponse.data.playlists || { items: [], total: 0, limit: 0, offset: 0 }
        }
      }
      throw categoryError
    }
  } catch (error: any) {
    console.error('Error fetching category playlists:', error)
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch category playlists'
      throw new Error(errorMessage)
    }
    throw new Error("Failed to fetch category playlists")
  }
}