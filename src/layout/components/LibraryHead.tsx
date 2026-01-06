import { Box, Button, Typography, styled } from '@mui/material'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import AddIcon from '@mui/icons-material/Add'
import useCreatePlaylist from '../../hooks/useCreatePlaylist'
import useGetCurrentUserPlaylists from '../../hooks/useGetCurrentUserPlaylists'
import useGetCurrentUserProfile from '../../hooks/useGetCurrentUserProfile'
import { getSpotifyAuthUrl } from '../../utils/auth'

const Head = styled("div")({
  display: "flex",
  alignItems: "center",
  padding: "8px",
  justifyContent: "space-between",
})

const LibraryHead = () => {
  const {mutate: createPlaylist} = useCreatePlaylist()
  const {data: playlistsData} = useGetCurrentUserPlaylists({limit:10, offset:0})
  const {data: userProfile} = useGetCurrentUserProfile()
  const totalPlaylists = playlistsData?.pages[0]?.total || 0
  const handleCreatePlaylist = () => {
    if (userProfile){
      createPlaylist({name: `[${totalPlaylists + 1}] My Playlist`})
    }else {
      getSpotifyAuthUrl()
    }
  }
  return (
    <Head>
      <Box display={"flex"} alignItems={"center"}>
        <BookmarkIcon sx={{ marginRight: "20px"}}/>
        <Typography variant='h2' fontWeight={700}>
          Your Library{userProfile ? ` (${totalPlaylists})` : ''}
        </Typography>
      </Box>
      <Button onClick={handleCreatePlaylist}>
        <AddIcon/>
      </Button>
    </Head>
  )
}

export default LibraryHead