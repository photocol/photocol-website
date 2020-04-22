import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import './Authenticator.css';
import LoginManager from '../../util/LoginManager';

class Authenticator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      email: '',
      isLogin: true   // true if login, false if signup
    };
    this.lm = new LoginManager();

    const nf = (() => {});    // null function
    this.onUserAction = props.onUserAction || nf;
  }
  
  logIn = () => {
    this.lm.logIn(this.state.username, this.state.password)
      .then(res => {
        console.log(res);
      })
      .catch(err => console.error(err));
  };

  signUp = () => {
    this.lm.signUp(this.state.username, this.state.password, this.state.email)
      .then(res => {
        console.log(res);
        this.setup();
      })
      .catch(err => console.error(err));
  };

  onEnter = (evt) => {
    if(evt.key === 'Enter') {
      this.logIn();
    }
  };

  render = () => {
    const loginJsx = (
      <div>
        <h1>Log in</h1>
        Username <input type='text'
                        value={this.state.username}
                        onChange={evt => this.setState({username: evt.target.value})}/><br/>
        Password <input type='password'
                        value={this.state.password}
                        onChange={evt => this.setState({password: evt.target.value})} onKeyDown={this.onEnter}/><br/>
        <button onClick={this.logIn}>Log in</button>
      </div>
    );
    const signupJsx = (
      <div>
        <h1>Sign up</h1>
        Username <input type='text'
                        value={this.state.username}
                        onChange={evt => this.setState({username: evt.target.value})}/><br/>
        Password <input type='password'
                        value={this.state.password}
                        onChange={evt => this.setState({password: evt.target.value})}/><br/>
        Email <input type='email'
                     value={this.state.email}
                     onChange={evt => this.setState({email: evt.target.value})}/><br/>
        <button onClick={this.signUp}>Sign up</button>
      </div>
    );

    const loginOrSignup = this.state.isLogin ? loginJsx : signupJsx;

    return (
      <div className="Authenticator">
        {/* if on /authenticate route and logged in, redirect to homepage */
          this.props.location.pathname==='/authenticate' && this.props.username!=='not logged in'
          && <Redirect to='/' />}
        <div>
          {loginOrSignup}
          <button onClick={() => this.setState({isLogin: !this.state.isLogin})}>Toggle sign up/log in</button>
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  username: state.user.username
});

export default withRouter(connect(mapStateToProps)(Authenticator));
