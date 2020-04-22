import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Collections.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import Authenticator from "../Authenticator/Authenticator";
import {env} from "../../util/Environment";

class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.acm = new ApiConnectionManager();

    this.state = {
      collections: [],
      collectionName: ''
    };
  }
  onEnter = (evt) => {
    if(evt.key === 'Enter') {
      this.createCollection();
    }
  };
  updateCollections = () => {
    this.acm.request('/collection/currentuser')
      .then(res => {
        console.log(res);
        this.setState({
          collections: res.response
        })
      })
      .catch(err => console.error(err));
  }

  componentDidMount = () => {
    this.updateCollections();
  };

  createCollection = () => {
    this.acm.request('/collection/new', {
      method: 'POST',
      body: JSON.stringify({
        isPublic: false,
        name: this.state.collectionName
      })
    }) .then(res => {
      this.updateCollections();})
      .catch(err => console.error(err));
  };

  deleteCollection = (username, uri) => {
    this.acm.request(`/collection/${username}/${uri}/delete`, {
      method: 'POST'
    })
      .then(res => this.updateCollections())
      .catch(res => console.error(res));
  };

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.updateCollections}/>);

    return (
      <div className='Collections'>

        <div>
          <h1>Create Collection</h1>
          Collection <input type='text'
                            value={this.state.collectionName}
                            onChange={evt => this.setState({collectionName: evt.target.value})} onKeyDown={this.onEnter}/><br/>
          <button onClick={this.createCollection}>Create Collection</button>
        </div>

        {this.state.collections.map(collection => {
          const currentUserRole = collection.aclList.find(aclEntry => aclEntry.username === this.props.username).role;
          const collectionOwner = collection.aclList.find(aclEntry => aclEntry.role === 'ROLE_OWNER').username;
          return (
            <div key={collection.uri}>
              <Link to={`/collection/${collectionOwner}/${collection.uri}`}>
                Collection: {collection.name}<br/>
                Role: {currentUserRole}
              </Link>
              <button onClick={() => this.deleteCollection(collectionOwner, collection.uri)}>Delete</button>
            </div>
          );
        })}
      </div>
    );
  };
}

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps)(Collections);
