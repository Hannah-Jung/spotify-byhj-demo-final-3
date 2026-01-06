import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { getCurrentUserProfile } from "../apis/userApi"
import type { User } from "../models/user"

const useGetCurrentUserProfile = ():UseQueryResult<User, Error> => { 
  const accessToken = localStorage.getItem("access_token")
  return useQuery({
    queryKey:['current-user-profile'],
    queryFn: getCurrentUserProfile,
    enabled: !!accessToken,
  })
 }

export default useGetCurrentUserProfile