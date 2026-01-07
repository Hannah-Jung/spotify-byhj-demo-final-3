import { Typography } from '@mui/material'
import { MusicNoteOutlined } from '@mui/icons-material'
import styles from './Card.module.css'
import PlayButton from './PlayButton';

interface CardProps {
  name: string;
  image: string;
  artistName?: string;
  isArtist?: boolean;
}

const Card = ({image, name, artistName = 'Unknown Artist', isArtist = false}: CardProps) => {
  const hasImage = image && image.trim().length > 0;
  
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img src={image} alt={name} className={`${styles.cardImage} ${isArtist ? styles.artistImage : ''}`}/>
        ) : (
          <div className={`${styles.defaultImage} ${isArtist ? styles.artistImage : ''}`}>
            <MusicNoteOutlined sx={{ width: 48, height: 48, color: '#1ed760' }} />
          </div>
        )}
        <PlayButton />
      </div>

      <div className={styles.cardContent}>
        <Typography className={styles.cardTitle} variant="h6" paddingTop="12px">
          {name}
        </Typography>
        <Typography className={styles.cardArtist} variant="body2" color="text.secondary">
          {artistName}
        </Typography>
      </div>
    </div>
  )
}

export default Card