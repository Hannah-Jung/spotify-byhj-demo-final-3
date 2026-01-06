import { useInfiniteQuery } from "@tanstack/react-query"
import { searchItemsByKeyword } from "../apis/searchApi"
import type { SearchRequestParams } from "../models/search"
import useClientCredentialToken from "./useClientCredentialToken"

const useSearchItemsByKeyword = (params:SearchRequestParams) => { 
  const clientCredentialToken = useClientCredentialToken()
  return useInfiniteQuery({
    queryKey: ["search", params],
    enabled: !!params.q && params.q.trim().length > 0 && !!clientCredentialToken,
    queryFn: ({pageParam = 0}) => { 
      if(!clientCredentialToken) throw new Error("No token available")
      return searchItemsByKeyword(clientCredentialToken, {...params, offset: pageParam})
     },
     initialPageParam: 0,
     getNextPageParam:(lastPage) => { 
        const nextPageUrl = lastPage.tracks?.next || lastPage.artists?.next || lastPage.albums?.next || lastPage.playlists?.next || lastPage.shows?.next ||
        lastPage.episodes?.next || lastPage.audiobooks?.next

        if(nextPageUrl) {
          const nextOffset = new URL(nextPageUrl).searchParams.get("offset")
          return nextOffset ? parseInt(nextOffset) : undefined
        }
        return undefined
      }
  })
 }

export default useSearchItemsByKeyword