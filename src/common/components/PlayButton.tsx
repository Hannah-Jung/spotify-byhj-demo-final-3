import { PlayArrow } from '@mui/icons-material';
import { IconButton } from '@mui/material'
import type { IconButtonProps } from '@mui/material'
import styles from './Card.module.css'

interface PlayButtonProps extends IconButtonProps {}

const PlayButton: React.FC<PlayButtonProps> = (props) => {
  return (
    <IconButton
      className={styles.playButton}
      disableRipple
      {...props}
    >
      <PlayArrow sx={{ fontSize: 30 }} />
    </IconButton>
  );
};

export default PlayButton;