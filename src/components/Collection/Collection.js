import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { env } from "../../util/Environment";

class Collection extends React.Component {
  constructor(props) {
    super(props);

    // get params from uri
    const { username, collectionuri } = props.match.params;
    this.state = {
      username, collectionuri,
      photos: []
    };

    this.acm = new ApiConnectionManager();
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}`)
      .then(res => this.setState({...this.state, photos: res.response.photos}))
      .catch(err => console.error(err));
  }

  render() {
    const photosJsx = this.state.photos.map(photo =>
      <div className='collection-photo-container' key={photo.uri}>
        <img src={`${env.serverUrl}/perma/${photo.uri}`} />
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
