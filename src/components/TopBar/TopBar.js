import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div className="TopBar">
          <span>Currently signed-in user: {this.props.username}</span>
        {this.props.username==='not signed in'
          ? <button onClick={this.props.signIn}>Sign in</button>
        : <button onClick={this.props.signOut}>Sign out</button>
        }
      </div>
    );
  }
}

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
