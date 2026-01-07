import axios from "axios"
import type { User } from "../models/user"
import api from "../utils/api"

export const getCurrentUserProfile = async ():Promise<User> => { 
  try {
    const response = await api.get(`/me`)
    return response.data
  } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw error
      }
      throw new Error("Failed to fetch user profile")
    }
  }