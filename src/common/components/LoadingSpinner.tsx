import './LoadingSpinner.css'; 

const LoadingSpinner = () => {
  return (
    <div className='spinner-wrapper'>
      <div className='spinner-circle'>
      <span className="loader"></span>
    </div>
    </div>
  )
}

export default LoadingSpinner