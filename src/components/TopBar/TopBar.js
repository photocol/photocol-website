import React from 'react';
import { connect } from 'react-redux';
import LoginManager from '../../util/LoginManager';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.lm = new LoginManager();
    
    this.lm.checkIsLoggedIn();
  }
  
  render() {
    return (
      <div className="TopBar">
          <span>Currently signed-in user: {this.props.username}</span>
        {this.props.username==='not logged in'
          ? <button onClick={this.lm.logIn}>Sign in</button>
          : <button onClick={this.lm.logOut}>Sign out</button>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});

// redux props
export default connect(mapStateToProps)(TopBar);
