import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import LoginManager from '../../util/LoginManager';
import './TopBar.css';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.lm = new LoginManager();
  }
  
  render() {
    return (
      <div className="TopBar">
        <nav className="TopSpace">
          <Link to='/'>Home</Link>
          <Link to='/profile'>Profile</Link>
          <Link to='/collections'>Collections</Link>
          <Link to='/photos'>Photos</Link>

          <span>Currently signed-in user: {this.props.username}<br/></span>
            {this.props.username==='not logged in'
              ? <Link to='/authenticate'>Sign in</Link>
              : <button onClick={this.lm.logOut}>Sign out</button>
          }
        </nav>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});

// redux props
export default connect(mapStateToProps)(TopBar);
