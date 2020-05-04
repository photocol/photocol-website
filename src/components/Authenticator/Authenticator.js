import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import './Authenticator.css';
import LoginManager from '../../util/LoginManager';
import { CardBody, CardTitle, FormText, Button, Form, FormGroup, Label, Input, Container, Card } from 'reactstrap';


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

    this.onUserAction = props.onUserAction;
  }

  logIn = () => {
    this.lm.logIn(this.state.username, this.state.password)
      .then(res => {
        console.log(res);
        this.onUserAction();
      })
      .catch(err => console.error(err));
  };

  signUp = () => {
    this.lm.signUp(this.state.username, this.state.password, this.state.email)
      .then(res => {
        console.log(res);
        this.onUserAction();
      })
      .catch(err => console.error(err));
  };

  submitOnEnter = evt => {
    if(evt.key === 'Enter')
      (this.state.isLogin ? this.logIn : this.signUp)();
  };

  toggleLoginSignup = evt => {
    this.setState({isLogin: !this.state.isLogin});
    evt.preventDefault();
  };

  render = () => {
    const loginJsx = (
      <Form>
        <FormGroup>
          <Label htmlFor="form-username" >Username</Label>
            <Input type="text" id="form-username"
                   placeholder='John Doe'
                   value={this.state.username}
                   onChange={evt => this.setState({username: evt.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="form-password">Password</Label>
            <Input type="password"
                   class="form-control"
                   id="form-password"
                   placeholder="password123"
                   value={this.state.password}
                   onChange={evt => this.setState({password: evt.target.value})}
                   onKeyDown={this.submitOnEnter} />
          </FormGroup>
          <FormGroup>
            <Button outline color='info' onClick={this.logIn}>Log in</Button>
          </FormGroup>
      </Form>
    );
    const signupJsx = (
      <Form>
        <FormGroup>
          <Label htmlFor="form-username">Username</Label>
          <Input type="text"
                 id="form-username"
                 className='form-control'
                 placeholder='John Doe'
                 value={this.state.username}
                 onChange={evt => this.setState({username: evt.target.value})} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="form-email">Email</Label>
          <Input type="email"
                 id="form-email"
                 className='form-control'
                 value={this.state.email}
                 placeholder='johndoe@email.org'
                 onChange={evt => this.setState({email: evt.target.value})} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="form-password">Password</Label>
          <Input type="password"
                 id="form-password"
                 placeholder="password123"
                 value={this.state.password}
                 onChange={evt => this.setState({password: evt.target.value})}
                 onKeyDown={this.submitOnEnter} />
        </FormGroup>
        <FormGroup>
          <Button outline className='mt-2' color='info' onClick={this.signUp}>Sign up</Button>
        </FormGroup>
      </Form>
  );

    const loginOrSignup = this.state.isLogin ? loginJsx : signupJsx;

    return (
        <Container className='mt-5 Authenticator' style={{maxWidth: '40rem'}}>
          {/* if on /authenticate route and logged in, redirect to homepage */
            this.props.location.pathname==='/authenticate' && this.props.username!=='not logged in'
            && <Redirect to='/' />}
          <h1 className='display-3'>Hi, who dis?</h1>
          <h3 className='display-4'>{this.state.isLogin ? 'Welcome back.' : 'Create an account.'}</h3>
          <Card>
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
