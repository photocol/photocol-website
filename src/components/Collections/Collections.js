import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Collections.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";

class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.acm = new ApiConnectionManager();

    this.state = {
      collections: []
    };
  }

  componentDidMount = () => {
    this.acm.request('/collection/currentuser')
      .then(res => {
        console.log(res);
        this.setState({
          ...this.state,
          collections: res.response
        })
      })
      .catch(err => console.error(err));
  };

  render = () => (
    <div className='Collections'>
      {this.state.collections.map(collection => (
        <div key={collection.uri}>
          <Link to={`/collection/${collection.aclList.find(aclEntry => aclEntry.role==='ROLE_OWNER').username}/${collection.uri}`}>
            Collection: {collection.name}<br/>
            {/*Role: {collection.aclList.find(aclEntry => aclEntry.username===this.props.username).role}*/}
            {collection.aclList.map(acl => (<div>{acl.username} {acl.role}</div>))}
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
