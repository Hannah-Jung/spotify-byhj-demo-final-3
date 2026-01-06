import { Box, Grid, Typography } from '@mui/material'
import useGetNewReleases from '../../../hooks/useGetNewReleases'
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import Card from '../../../common/components/Card';

const NewReleases = () => {
  const {data, error, isLoading} = useGetNewReleases();
  console.log("DATA:", data);
  if(isLoading){
    return <LoadingSpinner/>
  }
  if(error){
    return <ErrorMessage errorMessage={error.message}/>
  }
  return (
    <div>
      <Typography variant='h1' padding="8px">
        New Released Albums
      </Typography>
      {data && data.albums.items.length > 0 ? (
        <Box sx={{ 
          display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            maxWidth: '1400px',
            margin: '0 auto',
        }}>
          <Grid 
            container 
            spacing={2}
            columns={{ xs: 12, sm: 12, md: 12 }}
          >
            {data.albums.items.map((album) => (
              <Grid 
                size={{ 
                  xs: 6,
                  sm: 4,
                  md: 3,
                  lg: 2
                }} 
                key={album.id}
              >
                <Card 
                  image={album.images[0]?.url || ''} 
                  name={album.name} 
                  artistName={album.artists[0]?.name} 
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : <Typography variant='h2'>No Data</Typography>}
    </div>
  )
}

export default NewReleases