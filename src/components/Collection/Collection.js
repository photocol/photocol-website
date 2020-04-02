import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import CollectionManager from '../../util/CollectionManager';
import './Collection.css';

class Collection extends React.Component {
  constructor(props) {
    super(props);

    // get params from uri
    const { username, collectionuri } = props.match.params;
    this.state = {
      username, collectionuri,
      photos: []
    };
    
    this.collectionManager = new CollectionManager(username, collectionuri);
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.collectionManager.getCollectionPhotos()
      .then(res => this.setState({...this.state, photos: res.payload}))
      .catch(err => console.error(err));
  }

  render() {
    const photosJsx = this.state.photos.map(photo =>
      <div className='collection-photo-container' key={photo.uri}>
        <img src={`http://localhost:4567/image/${photo.uri}`} />
        <p>{photo.description}</p>
        <p>Uploaded on {photo.uploadDate}</p>
      </div>
    );
    return (
      <div className='Collection'>
        <h1>Collection {this.state.collectionuri}</h1>
        <h2>By {this.state.username}</h2>
        {photosJsx}
      </div>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);
