import React from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
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
      collection: {
        name: '',
        uri: '',
        photos: [],
        aclList: []
      },
      errorMsg: ''
    };

    this.acm = new ApiConnectionManager();
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}`)
      .then(res => {
        this.setState({
          errorMsg: '',
          collection: res.response
        })
      })
      .catch(err => {
        if(!err.response)
          return;

        this.setState({errorMsg: err.response.error});
      });
  }

  getOwner = () => (this.state.collection.aclList.find(acl => acl.role==='ROLE_OWNER') || {username:''}).username;

  render = () => {
    // FIXME: negative EQ error handling
    if(this.state.errorMsg)
      return (
        <div>
          Received error from server: {this.state.errorMsg}.<br/>
        <Link to='/collections'>Return to collections</Link>
        </div>
      );

    const photosJsx = this.state.collection.photos.map(photo =>
      <div className='collection-photo-container' key={photo.uri}>
        <img src={`${env.serverUrl}/perma/${photo.uri}`} />
        <p>{photo.description}</p>
        <p>Uploaded on {photo.uploadDate}</p>
      </div>
    );

    const aclListJsx = (
      <ul>
        {
          this.state.collection.aclList.map(aclEntry =>
            <li key={aclEntry.username}>{aclEntry.username} ({aclEntry.role})</li>
          )
        }
      </ul>
    );

    return (
      <div className='Collection'>
        <h1>Collection {this.state.collection.name}</h1>
        <h2>By {this.getOwner()}</h2>
        <h2>ACL List:</h2>
        {aclListJsx}
        <Link to='/collections'>Return to list of collections.</Link>
        {photosJsx}
      </div>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);
