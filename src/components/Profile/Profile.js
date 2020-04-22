import React from 'react';
import PropTypes from 'prop-types';
import './Profile.css';
import {connect} from "react-redux";
import Authenticator from "../Authenticator/Authenticator";

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator/>);

    return (
      <div className='Profile'>
        <h1>Profile</h1>
        <h2>Good day, {this.props.username}!</h2>
        <p>This page is a work in progress.</p>
      </div>
    );
  }
}

Profile.propTypes = {};

Profile.defaultProps = {};

const mapStateToProps = state => ({
  username: state.user.username
});
export default connect(mapStateToProps)(Profile);
