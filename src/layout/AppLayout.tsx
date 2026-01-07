import { Box, styled, Typography } from '@mui/material'
import { NavLink, Outlet } from 'react-router'
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryHead from './components/LibraryHead';
import Library from './components/Library';
import Navbar from './components/Navbar';
import useGetCurrentUserPlaylists from '../hooks/useGetCurrentUserPlaylists';
import useGetCurrentUserProfile from '../hooks/useGetCurrentUserProfile';
import ErrorMessage from '../common/components/ErrorMessage';

const Layout = styled("div")({
  display: "flex",
  height: "100vh",
  padding: "8px",
  gap: "8px",
})

const Sidebar = styled("div")(({theme})=>({
  width: "320px !important",
  maxWidth: "320px !important",
  minWidth: "320px !important",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flexShrink: 0, 
  [theme.breakpoints.down("sm")]: {
    display: "none",
  }
}))

const ContentBox = styled(Box)(({theme})=>({
  borderRadius: "8px",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  width: "100%",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  overflow: "visible",
  position: "relative",
}))

const NavList = styled("ul")({
  listStyle: "none",
  padding: "11px",
  margin: 0,
  gap: "8px",
  display: "flex",
  flexDirection: "column",
})

const StyledNavLink = styled(NavLink)(({theme})=>({
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette.text.primary,
  },
  "&.active": {
    color: theme.palette.text.primary,
  },
}))

const AppLayout = () => {
  const { error: playlistsError } = useGetCurrentUserPlaylists({limit:10, offset:0})
  const { data: userProfile, error: userProfileError } = useGetCurrentUserProfile()
  
  const libraryError = userProfile ? (playlistsError || userProfileError) : null
  return (
    <Layout>
      <Sidebar>
        <ContentBox>
          <NavList>
            <StyledNavLink to='/'>
              <HomeIcon/>
              <Typography variant='h2' fontWeight={700}>Home</Typography> 
            </StyledNavLink>
            <StyledNavLink to='/search'>
              <SearchIcon/>
              <Typography variant='h2' fontWeight={700}>Search</Typography>
            </StyledNavLink>
          </NavList>
        </ContentBox>
        <ContentBox height="100%">
          <LibraryHead/>
          <Library/>
        </ContentBox> 
      </Sidebar>
      <ContentBox>
        <Navbar/>
        {libraryError ? (
          <ErrorMessage error={libraryError} userProfile={userProfile} />
        ) : (
          <Outlet/>
        )}
      </ContentBox>     
    </Layout>
  )
}

export default AppLayout