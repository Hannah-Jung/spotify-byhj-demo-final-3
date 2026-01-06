import { useQuery } from "@tanstack/react-query"
import { getCategoryPlaylists } from "../apis/categoryApi"
import useClientCredentialToken from "./useClientCredentialToken"

const useGetCategoryPlaylists = (categoryId: string, categoryName: string, limit: number = 20) => {
  const clientCredentialToken = useClientCredentialToken()
  return useQuery({
    queryKey: ["categoryPlaylists", categoryId, categoryName, limit],
    queryFn: () => {
      if (!clientCredentialToken) throw new Error("No token available")
      return getCategoryPlaylists(clientCredentialToken, categoryId, categoryName, limit)
    },
    enabled: !!clientCredentialToken && !!categoryId && !!categoryName,
  })
}

export default useGetCategoryPlaylists