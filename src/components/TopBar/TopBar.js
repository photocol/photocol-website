import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './TopBar.css';

const TopBar = props => (
  <div className="TopBar">
    <span>Currently signed-in user: {props.username}</span>
    {props.username==='not signed in'
      ? <button onClick={props.signIn}>Sign in</button>
      : <button onClick={props.signOut}>Sign out</button>
    }
  </div>
);

// props
TopBar.propTypes = {};
TopBar.defaultProps = {};

const mapStateToProps = state => ({
  username: state.user.username
});
const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch({type: 'signin'}),
  signOut: () => dispatch({type: 'signout'}),
});

// redux props
export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
