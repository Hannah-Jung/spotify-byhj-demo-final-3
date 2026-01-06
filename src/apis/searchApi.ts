import axios from "axios"
import { SPOTIFY_BASE_URL } from "../configs/commonConfig"
import type { SearchRequestParams, SearchResponse } from "../models/search"

export const searchItemsByKeyword = async(token:string, params:SearchRequestParams):Promise<SearchResponse> => { 
  try {
    const searchParams = new URLSearchParams()
    searchParams.append("q",params.q)
    searchParams.append("type", params.type.join(","))
    if(params.market) searchParams.append("market", params.market)
    if(params.limit) searchParams.append("limit", params.limit.toString())
    if(params.offset) searchParams.append("offset", params.offset.toString())
    if(params.include_external) searchParams.append("include_external", params.include_external)  
    const response = await axios.get(`${SPOTIFY_BASE_URL}/search?${searchParams.toString()}`,{
      headers:{
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    return response.data
  } catch (error) {
      throw new Error("Failed to search by keyword")
  }
 }