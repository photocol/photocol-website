
import React from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { env } from "../../util/Environment";
import UserSearch from "../UserSearch/UserSearch";
import Photos from "../Photos/Photos";

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
      lastLoadedCollection: {}, // for use when updating component
      errorMsg: '',
      uploadPressed: true
    };

    this.acm = new ApiConnectionManager();
    this.userSearchRef = React.createRef();
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.getCollection();
  }

  getCollection = () => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}`)
      .then(res => {
        this.setState({
          errorMsg: '',
          collection: res.response,
          lastLoadedCollection: JSON.parse(JSON.stringify(res.response))  // simple clone for checking against later
        });
      })
      .catch(err => {
        if(!err.response)
          return;
        this.setState({errorMsg: err.response.error});
      });
  };

  getOwner = () =>
    (this.state.collection.aclList.find(acl => acl.role==='ROLE_OWNER') || {username:''}).username;

  addUserToAcl = (username) => {
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.concat({
          username: username,
          role: 'ROLE_VIEWER'
        })
      }
    }, this.userSearchRef.current.refilter);
  };

  userNotInAcl = username =>
    !this.state.collection.aclList.find(aclEntry => username===aclEntry.username);

  saveChanges = () => {
    const current = this.state.collection;
    const previous = this.state.lastLoadedCollection;

    // get changes in acl
    const newEntries = current.aclList.filter(aclEntry =>
      !previous.aclList.find(pAclEntry => aclEntry.username===pAclEntry.username && aclEntry.role===pAclEntry.role));
    const removedEntries = previous.aclList.filter(aclEntry =>
      !current.aclList.find(cAclEntry => aclEntry.username===cAclEntry.username))
      .map(aclEntry => ({...aclEntry, role: 'ROLE_NONE'}));
    const aclListDiff = newEntries.concat(removedEntries);

    // TODO: do something if owner changes

    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/update`, {
      method: 'POST',
      body: JSON.stringify({
        aclList: aclListDiff
      })
    })
      .then(res => console.log(res))
      .catch(err => {
        console.error(err)
      });
  };

  updateAclEntryRole = (index, newRole) => {
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.map((aclEntry, i) =>
          i!==index
            ? aclEntry
            : {...aclEntry, role: newRole}
        )
      }
    });
  };

  removeAclEntry = index =>
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.filter((_, i) => i!==index)
      }
    });

  addPhoto = (uri) => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/addphoto`, {
        method: 'POST',
        body: JSON.stringify({
            uri: uri
        })
    })
        .then(res => this.getCollection())
        .catch(res => console.error(res));
  };
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

    const uploadJsx = (
      <div>
        <Photos onSelect = {photos => photos.forEach(photo => this.addPhoto(photo.uri))}>
        </Photos>
      </div>
    );
    const uploadOrCollection = this.state.uploadPressed ? uploadJsx: photosJsx ;

    const aclListJsx = (
      <ul>
        {
          this.state.collection.aclList.map((aclEntry, index) =>
            <li key={aclEntry.username}>
              <select value={aclEntry.role}
                      onChange={evt => this.updateAclEntryRole(index, evt.target.value)}>
                <option value="ROLE_OWNER">Owner</option>
                <option value="ROLE_EDITOR">Editor</option>
                <option value="ROLE_VIEWER">Viewer</option>
              </select>
              <button onClick={() => this.removeAclEntry(index)}>Remove</button>
              {aclEntry.username}
            </li>
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
        <h2>Add user</h2>
        <UserSearch selectText='Add to collection'
                    onUserSelect={this.addUserToAcl}
                    userFilter={this.userNotInAcl}
                    ref={this.userSearchRef} />
        <button onClick={this.saveChanges}>Save changes</button>
        <button onClick={this.getCollection}>Undo changes and reload</button>
        <div>
          <button onClick={() => this.setState({uploadPressed: !this.state.uploadPressed})}>Upload/See photos</button>
          {uploadOrCollection}
        </div>
        <Link to='/collections'>Return to list of collections.</Link>
      </div>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);