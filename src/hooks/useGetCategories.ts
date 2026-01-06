import { useQuery } from "@tanstack/react-query"
import { getCategories } from "../apis/categoryApi"
import useClientCredentialToken from "./useClientCredentialToken"

const useGetCategories = (limit: number = 50) => {
  const clientCredentialToken = useClientCredentialToken()
  return useQuery({
    queryKey: ["categories", limit],
    queryFn: () => {
      if (!clientCredentialToken) throw new Error("No token available")
      return getCategories(clientCredentialToken, limit)
    },
    enabled: !!clientCredentialToken,
  })
}

export default useGetCategories