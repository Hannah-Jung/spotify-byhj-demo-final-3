import { Button, Card, styled, Typography } from '@mui/material'
import useGetCurrentUserProfile from '../../hooks/useGetCurrentUserProfile'
import { getSpotifyAuthUrl } from '../../utils/auth'

const EmptyPlaylistCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: "20px",
  borderRadius: "8px",
}))

const CreatePlaylistButton = styled(Button)({
  marginTop: "20px",
  fontWeight: "700",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
})

const EmptyPlaylist = () => {
  const { data: userProfile } = useGetCurrentUserProfile()
  const handleCreatePlaylist = () => {
    if (userProfile) {
      window.location.href = '/library'
    } else {
      getSpotifyAuthUrl()
  }
}
  return (
    <EmptyPlaylistCard>
      <Typography variant='h2' fontWeight={700} textAlign='center'>
        Create your first playlist
      </Typography>
      <Typography variant='body2' textAlign='center'>It's easy, we'll help you</Typography>
      <CreatePlaylistButton variant='contained' color="secondary" onClick={handleCreatePlaylist}>
        Create playlist
      </CreatePlaylistButton>
    </EmptyPlaylistCard>
  )
}

export default EmptyPlaylist