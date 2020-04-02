import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import './Authenticator.css';
import LoginManager from '../../util/LoginManager';

class Authenticator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: 'tiff',
      password: 'password'
    };
    this.lm = new LoginManager();

    // if logged in and at route /authenticate, redirect away
    // console.log(props.location.pathname==='/authenticate', props.username);
    // if(props.location.pathname==='/authenticate' && props.username!=='not logged in') {
    //   console.log('testing');
    // }

    // bind "this" to functions (necessary for ES6 class syntax)
    this.logIn = this.logIn.bind(this);
  }
  
  logIn() {
    this.lm.logIn(this.state.username, this.state.password)
      .catch(err => console.error(err));
  }
  
  render() {
    return (
      <div className="Authenticator">
      {this.props.location.pathname==='/authenticate' && this.props.username!=='not logged in'
          && <Redirect to='/' />}
        <div>
          <h1>Log in</h1>
            Username <input type='text'
                            value={this.state.username}
                            onChange={evt => this.setState({username: evt.target.value})}/><br/>
            Password <input type='password'
                            value={this.state.password}
                            onChange={evt => this.setState({password: evt.target.value})}/><br/>
            <button onClick={this.logIn}>Log in</button>
          </div>
          {this.props.username}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});

export default withRouter(connect(mapStateToProps)(Authenticator));
