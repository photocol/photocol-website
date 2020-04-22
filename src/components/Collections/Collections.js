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

  deleteCollection = uri => {
    this.acm.request('/collection/currentuser' + uri , {
      method: 'POST'
    })
      .then(res => this.getCollectionList())
      .catch(res => console.error(res));
  };

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.updateCollections}/>);

    return (
      <div className='Collections'>
        {this.state.collections.map(collection => {
          const currentUserRole = collection.aclList.find(aclEntry => aclEntry.username === this.props.username).role;
          const collectionOwner = collection.aclList.find(aclEntry => aclEntry.role === 'ROLE_OWNER').username;
          return (
            <div key={collection.uri}>
              <Link to={`/collection/${collectionOwner}/${collection.uri}`}>
                Collection: {collection.name}<br/>
                Role: {currentUserRole}
              </Link>
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
