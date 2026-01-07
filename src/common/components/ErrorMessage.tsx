import { Box, Typography, Alert } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import axios from 'axios'

interface ErrorMessageProps {
  error?: unknown
  errorMessage?: string
  userProfile?: unknown
  variant?: 'fullscreen' | 'inline'
}

const ErrorMessage = ({ error, errorMessage, userProfile: _userProfile, variant = 'fullscreen' }: ErrorMessageProps) => {
  let title = "Something went wrong"
  let message = "Please try again."
  
  if (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const hasResponse = !!error.response
      
      if (!hasResponse) {
        title = "Unable to connect"
        message = "Please check your internet connection."
      }
      else if (status === 404) {
        title = "Not found"
        message = "The requested resource was not found."
      }
      else if (status === 400) {
        title = "Invalid request"
        message = "The request is invalid. Please check the URL and try again."
      }
      else if (status === 401) {
        title = "Please log in again"
        message = "Login is required to continue."
      }
    }
    else if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        title = "Please log in again"
        message = "Login is required to continue."
      }
      else if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('fetch') && !errorMsg.includes('playlist')) {
        title = "Unable to connect"
        message = "Please check your internet connection."
      }
      else if (errorMsg.includes('400') || errorMsg.includes('bad request')) {
        title = "Invalid request"
        message = "The request is invalid. Please check the URL and try again."
      }
      else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        title = "Not found"
        message = "The requested resource was not found."
      }
      else if (errorMsg.includes('fetch') && errorMsg.includes('playlist')) {
        title = "Playlist not found"
        message = "The playlist you're looking for doesn't exist or has been removed."
      }
      else {
        title = "Something went wrong"
        message = "Please try again."
      }
    }
  }
  else if (errorMessage) {
    title = errorMessage
  }
  
  if (variant === 'fullscreen') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh"
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#1ed760', mb: 3 }} />
        <Typography variant="h4" mb={2}>{title}</Typography>
        <Typography mb={4}>{message}</Typography>
      </Box>
    )
  }
  
  return (
    <Alert severity='error'>{title}</Alert>
  )
}

export default ErrorMessage