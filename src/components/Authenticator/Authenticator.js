import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import './Authenticator.css';
import LoginManager from '../../util/LoginManager';
import { CardBody, FormText, Button, Form, FormGroup, Label, FormFeedback, Input, Container, Card } from 'reactstrap';


class Authenticator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      email: '',
      isLogin: true,   // true if login, false if signup,
      loginError: {},
      signupError: {},
    };
    this.lm = new LoginManager();

    this.onUserAction = props.onUserAction;
  }

  logIn = () => {
    // basic formatting
    const username = this.state.username.trim().toLowerCase();
    this.setState({username: username});

    this.lm.logIn(username, this.state.password)
      .then(res => {
        console.log(res);
        this.onUserAction();
      })
      .catch(res => {
        const error = res.response.error;
        const details = res.response.details;

        switch(error) {
          case 'CREDENTIALS_INVALID':
            this.setState({loginError: {password: 'Your username or password is incorrect.'}});
            return;
          case 'USER_NOT_FOUND':
            this.setState({loginError: {username: 'User not found.'}});
            return;
          case 'INPUT_FORMAT_ERROR':
            break;
          default:
            this.setState({loginError: {username: `Error: "${error}". Please contact the devs for more info.`}});
            return;
        }

        switch(details) {
          case 'USERNAME_MISSING':
            this.setState({loginError: {username: 'Username left blank.'}});
            break;
          case 'PASSWORD_MISSING':
            this.setState({loginError: {password: 'Password left blank.'}});
            break;
        }
      });
  };

  signUp = () => {
    // basic formatting
    const username = this.state.username.trim().toLowerCase();
    const email = this.state.email.trim().toLowerCase();
    this.setState({ username: username, email: email });

    this.lm.signUp(username, this.state.password, email)
      .then(res => {
        console.log(res);
        this.onUserAction();
      })
      .catch(res => {
        const error = res.response.error;
        const details = res.response.details;
        console.log(error);
        switch(error) {
          case 'CREDENTIALS_NOT_UNIQUE':
            this.setState({signupError: {username: 'Username not unique.'}});
            return;
          case 'INPUT_FORMAT_ERROR':
            break;
          default:
            this.setState({signupError: {username: `Error: "${error}". Please contact the devs for more info.`}});
            return;
        }

        console.log(res.response);
        console.log(details);
        switch(details) {
          case 'USERNAME_MISSING':
            this.setState({signupError: {username: 'Username left blank.'}});
            break;
          case 'USERNAME_FORMAT':
            this.setState({signupError: {username: 'Username format requirements not met.'}});
            break;
          case 'EMAIL_MISSING':
            this.setState({signupError: {email: 'Email left blank.'}});
            break;
          case 'EMAIL_FORMAT':
            this.setState({signupError: {email: 'Email invalid.'}});
            break;
          case 'PASSWORD_MISSING':
            this.setState({signupError: {password: 'Password left blank.'}});
            break;
          case 'PASSWORD_FORMAT':
            this.setState({signupError: {password: 'Password format requirements not met.'}});
            break;
        }
      });
  };

  submitOnEnter = evt => {
    if(evt.key === 'Enter')
      (this.state.isLogin ? this.logIn : this.signUp)();
  };

  toggleLoginSignup = evt => {
    // toggle isLogin, reset errors
    this.setState({
      isLogin: !this.state.isLogin,
      loginError: {},
      signupError: {}
    });
    evt.preventDefault();
  };

  render = () => {
    const loginJsx = (
      <Form inline>
        <FormGroup className='mr-2 flex-grow-1'>
          <Input type="text"
                 className='flex-grow-1'
                 placeholder='Username'
                 value={this.state.username}
                 autoFocus
                 invalid={!!this.state.loginError.username}
                 onKeyDown={this.submitOnEnter}
                 onChange={evt => this.setState({username: evt.target.value})} />
        </FormGroup>
        <FormGroup className='mr-2 flex-grow-1'>
          <Input type="password"
                 className='flex-grow-1'
                 placeholder="Password"
                 value={this.state.password}
                 invalid={!!this.state.loginError.password}
                 onChange={evt => this.setState({password: evt.target.value})}
                 onKeyDown={this.submitOnEnter} />
        </FormGroup>
        <FormGroup>
          <Button outline color='info' onClick={this.logIn}>Log in</Button>
        </FormGroup>
        <FormFeedback className='d-block'>{this.state.loginError.username}</FormFeedback>
        <FormFeedback className='d-block'>{this.state.loginError.password}</FormFeedback>
      </Form>
    );
    const signupJsx = (
      <Form>
        <FormGroup>
          <Label htmlFor="form-username">Username</Label>
          <Input type="text"
                 id="form-username"
                 autoFocus
                 className='form-control'
                 placeholder='John Doe'
                 invalid={!!this.state.signupError.username}
                 onKeyDown={this.submitOnEnter}
                 value={this.state.username}
                 onChange={evt => this.setState({username: evt.target.value})} />
          <FormFeedback>{this.state.signupError.username}</FormFeedback>
          <FormText>Username must be 3-50 characters in length and can only contain alphanumeric characters, underscores,
              dashes, and periods. This will show up in collection URLs, so keep it brief!</FormText>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="form-email">Email</Label>
          <Input type="email"
                 id="form-email"
                 className='form-control'
                 value={this.state.email}
                 placeholder='johndoe@email.org'
                 invalid={!!this.state.signupError.email}
                 onKeyDown={this.submitOnEnter}
                 onChange={evt => this.setState({email: evt.target.value})} />
          <FormFeedback>{this.state.signupError.email}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="form-password">Password</Label>
          <Input type="password"
                 id="form-password"
                 placeholder="myst1cal_un1c0rn"
                 value={this.state.password}
                 onChange={evt => this.setState({password: evt.target.value})}
                 invalid={!!this.state.signupError.password}
                 onKeyDown={this.submitOnEnter} />
          <FormFeedback>{this.state.signupError.password}</FormFeedback>
          <FormText>Password must be 6-50 characters in length.</FormText>
        </FormGroup>
        <FormGroup>
            <Button outline color='info' onClick={this.signUp}>Sign up</Button>
        </FormGroup>
      </Form>
    );

    const loginOrSignup = this.state.isLogin ? loginJsx : signupJsx;

    return (
        <Container className='mt-5 Authenticator' style={{maxWidth: '40rem'}}>
          {/* if on /authenticate route and logged in, redirect to homepage */
            this.props.location.pathname==='/authenticate' && this.props.username!=='not logged in'
            && <Redirect to='/' />}
          <h3 className='display-4'>{this.state.isLogin ? 'Welcome back.' : 'Hi, who dis?'}</h3>
          <Card className='my-2'>
            <CardBody>
              {loginOrSignup}
            </CardBody>
          </Card>
          <small className='text-muted'>
            {this.state.isLogin ? "Don't have an account?" : "Already have an account?"}&nbsp;
            <a color='info' href='' onClick={this.toggleLoginSignup}>{this.state.isLogin ? 'Sign up' : 'Log in'} instead.</a>
          </small>
        </Container>
    );
  };
}

Authenticator.propTypes = {
  onUserAction: PropTypes.func
};

Authenticator.defaultProps = {
  onUserAction: () => {}
};

const mapStateToProps = state => ({
  username: state.user.username
});

export default withRouter(connect(mapStateToProps)(Authenticator));
