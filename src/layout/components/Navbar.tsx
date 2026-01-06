import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  styled,
  Tooltip,
} from "@mui/material";
import useGetCurrentUserProfile from "../../hooks/useGetCurrentUserProfile";
import LoginButton from "../../common/components/LoginButton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const ProfileContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "8px",
});

const ProfileMenu = styled(Menu)({
  "& .MuiPaper-root": {
    color: "white",
    minWidth: "160px",
  },
});

const ProfileMenuItem = styled(MenuItem)({
  "&:hover": {
    backgroundColor: "#444",
  },
});

const Navbar = () => {
  const {data:userProfile, isLoading} = useGetCurrentUserProfile()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const queryClient = useQueryClient();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("code_verifier");
  sessionStorage.clear();
  queryClient.removeQueries({ queryKey: ["current-user-profile"] });
  window.location.href = "/";
};
  return (
    <Box display='flex' justifyContent="flex-end" alignItems="center" height="64px">
      {isLoading || userProfile ? (
        <ProfileContainer>
          <Tooltip title={userProfile?.display_name || "User"} arrow>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                src={userProfile?.images[0]?.url || "/default-avatar.png"} 
                alt={userProfile?.display_name}
              />
            </IconButton>
          </Tooltip>
          <ProfileMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            keepMounted
          >
            <ProfileMenuItem onClick={logout}>Log out</ProfileMenuItem>
          </ProfileMenu>
        </ProfileContainer>
      ) : (
        <LoginButton />
        
      )}
    </Box>
  )}

export default Navbar