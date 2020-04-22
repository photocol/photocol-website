import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Collections.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
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
createCollection = () => {
    this.acm.request('/collection/new', {
      method: 'POST',
      body: JSON.stringify({
        isPublic: false,
        name: this.state.collectionName
      })
    }) .then(res => {console.log(res)})
        .catch(err => console.error(err));
};
  onEnter = (evt) => {
    if(evt.key === 'Enter') {
      this.createCollection();
    }
  };
  componentDidMount = () => {
    this.getCollectionList();
  }
  getCollectionList = () => {
    this.acm.request('/collection/currentuser').then(res => {
      this.setState({ collections: res.response });
    }).catch(err => {
      console.error(err);
    });
  };
  deleteCollection = uri => {
    this.acm.request('/collection/currentuser' + uri , {
      method: 'POST'
    })
        .then(res => this.getCollectionList())
        .catch(res => console.error(res));
  };
  render = () => (
    <div className='Collections'>
      <div>
      <h1>Create Collection</h1>
      Collection <input type='text'
                      value={this.state.collectionName}
                      onChange={evt => this.setState({collectionName: evt.target.value})} onKeyDown={this.onEnter}/><br/>
      <button onClick={this.createCollection}>Create Collection</button>
    </div>
      {this.state.collections.map(collection => (
        <div key={collection.uri}>
          <Link to={`/collection/${collection.aclList.find(aclEntry => aclEntry.role==='ROLE_OWNER').username}/${collection.uri}`}>
            Collection: {collection.name}<br/>
            {/*Role: {collection.aclList.find(aclEntry => aclEntry.username===this.props.username).role}*/}
            {collection.aclList.map(acl => (<div>{acl.username} {acl.role}
            </div>))}
            <button onClick={() => this.deleteCollection(collection.uri)}>Delete</button>
          </Link>
        </div>
      ))}
    </div>
  );
}

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps)(Collections);
