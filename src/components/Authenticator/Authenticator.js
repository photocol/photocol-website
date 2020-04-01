import React from 'react';
import { connect } from 'react-redux';
import './Authenticator.css';

const Authenticator = props => (
  <div className="Authenticator">
    <div>
      <h1>Log in</h1>
      Username <input type='text'/><br/>
      Password <input type='password'/><br/>
      <button onClick={props.signIn}>Sign in</button>
    </div>
    {props.username}
  </div>
);

const mapStateToProps = state => ({
  username: state.user.username
});
const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch({type: 'signin'})
});

export default connect(mapStateToProps, mapDispatchToProps)(Authenticator);
