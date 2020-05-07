import React from 'react';
import './Profile.css';
import {connect} from "react-redux";
import { Container } from 'reactstrap';
import Authenticator from "../Authenticator/Authenticator";

class Profile extends React.Component {

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator/>);

    return (
      <Container className='Profile mt-5'>
        <h1>Profile</h1>
        <h2>Good day, {this.props.username}!</h2>
        <p>This page is a work in progress.</p>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});
export default connect(mapStateToProps)(Profile);
