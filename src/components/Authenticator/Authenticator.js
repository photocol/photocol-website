import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';
import './Authenticator.css';
import LoginManager from '../../util/LoginManager';
import { CardBody, CardImg, CardTitle, Button, CardText, Row, Col, Form, FormGroup, Label, Input, Jumbotron, Container, Card } from 'reactstrap';


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

  onEnter = (evt) => {
    if(evt.key === 'Enter') {
      this.logIn();
    }
  };
  onEnter2 = (evt) => {
    if(evt.key === 'Enter') {
      this.signUp();
      this.setState({isLogin: !this.state.isLogin});
    }
  };
  render = () => {
    const loginJsx = (

      <Card className="body-center" >
        <CardBody>
          <Form>
            <FormGroup>
              <Label htmlFor="form-username" >Username</Label>
              <Input type="text" id="form-username"
                     value={this.state.username}
                     onChange={evt => this.setState({username: evt.target.value})} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="form-password">Password</Label>
              <Input type="password" class="form-control"  id="inputPassword" placeholder="Password"
                     value={this.state.password}
                     onChange={evt => this.setState({password: evt.target.value})} onKeyDown={this.onEnter}/>
            </FormGroup>
            <Col className="text-center">
              <FormGroup>
                <br/>
                <Button color='success' onClick={this.logIn}>Log in</Button>
                <a1 onClick={() => this.setState({isLogin: !this.state.isLogin})}>Sign up</a1>
              </FormGroup>
            </Col>
          </Form>
        </CardBody>
      </Card>

    );
    const signupJsx = (
      <Card  className='movedown'>
        <CardBody>
          <Form>
            <FormGroup>
              <Label htmlFor="form-username" >Username</Label>
              <Input type="text" id="form-username"
                     value={this.state.username}
                     onChange={evt => this.setState({username: evt.target.value})} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="form-password">Password</Label>
              <Input type="password" class="form-control"  id="inputPassword" placeholder="Password"
                     value={this.state.password}
                     onChange={evt => this.setState({password: evt.target.value})} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="form-email">Email</Label>
              <Input type="text" id="form-email"
                     value={this.state.email}
                     onChange={evt => this.setState({email: evt.target.value})} onKeyDown={this.onEnter2}/>
            </FormGroup>
            <Col className="text-center">
              <FormGroup>
                <Button color='success' onClick={this.signUp} onClick={() => this.setState({isLogin: !this.state.isLogin})}>Sign up</Button>
              </FormGroup>
            </Col>
          </Form>
        </CardBody>
      </Card>
    );

    const loginOrSignup = this.state.isLogin ? loginJsx : signupJsx;

    return (
        <Container>
          <div className="Authenticator">
            {/* if on /authenticate route and logged in, redirect to homepage */
              this.props.location.pathname==='/authenticate' && this.props.username!=='not logged in'
              && <Redirect to='/' />}
            <div>
              {loginOrSignup}
            </div>
          </div>
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
