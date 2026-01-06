import { useMutation, useQueryClient } from "@tanstack/react-query"
import { exchangeToken } from "../apis/authApi"
import type { ExchangeTokenResponse } from "../models/auth";

const useExchangeToken =() => { 
  const queryClient = useQueryClient()
  return useMutation<ExchangeTokenResponse, Error, {code:string, codeVerifier:string}>({
      mutationFn:({code, codeVerifier})=>exchangeToken(code, codeVerifier),
      onSuccess:(data)=>{
        localStorage.setItem('access_token', data.access_token);
        queryClient.invalidateQueries({
          queryKey: ["current-user-profile"]
        })
      }
    })
 }

 export default useExchangeToken