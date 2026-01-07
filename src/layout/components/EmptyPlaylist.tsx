import { Button, Card, styled, Tooltip, Typography } from '@mui/material'
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

const createButton = (
    <CreatePlaylistButton variant='contained' color="secondary" onClick={handleCreatePlaylist}>
      Create playlist
    </CreatePlaylistButton>
  )

  return (
    <EmptyPlaylistCard>
      <Typography variant='h2' fontWeight={700} textAlign='start' mb='8px'>
        Create your first playlist
      </Typography>
      <Typography variant='body2' textAlign='start'>It's easy, we'll help you</Typography>
      {userProfile ? (
        createButton
      ) : (
        <Tooltip title="Please log in to create playlists" placement="top">
          {createButton}
        </Tooltip>
      )}
    </EmptyPlaylistCard>
  )
}

export default EmptyPlaylist