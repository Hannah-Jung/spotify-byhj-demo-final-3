import { Typography } from '@mui/material'
import styles from './Card.module.css'
import PlayButton from './PlayButton';

interface CardProps {
  name: string;
  image: string;
  artistName?: string;
}

const Card = ({image, name, artistName = 'Unknown Artist'}: CardProps) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={name} className={styles.cardImage}/>

        <PlayButton />

      <div className={styles.cardContent}>
        <Typography className={styles.cardTitle} variant="h6" paddingTop="12px">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {artistName}
        </Typography>
      </div>
    </div>
  )
}

export default Card