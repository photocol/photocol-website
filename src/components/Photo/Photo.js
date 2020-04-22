import React from 'react';
import PropTypes from 'prop-types';
import './Photo.css';
import { withRouter } from 'react-router-dom';
//import CollectionManager from "../../util/CollectionManager";

const Photo = () => (
    <div className="Photo">
      Photo Component
    </div>
);

/*
class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const { photouri } = props.match.params;
    this.state = {
      photouri,
    };
  }

  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
  }

  render() {
    const photosJsx = this.state.photos.map(photo =>
      <div className='collection-photo-container' key={photo.uri}>
        <img src={`http://localhost:4567/photo/${photo.uri}`} />
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
 */

Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
