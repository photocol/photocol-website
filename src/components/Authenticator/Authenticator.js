import React from 'react';
import { connect } from 'react-redux';
import './Authenticator.css';
import ACM from '../../services/ApiConnectionManager';

class Authenticator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: 'tiff',
      password: 'password'
    };
  }
  
  render() {
    return (
      <div className="Authenticator">
        <div>
          <h1>Log in</h1>
            Username <input type='text'
                            value={this.state.username}
                            onChange={evt => this.setState({username: evt.target.value})}/><br/>
            Password <input type='password'
                            value={this.state.password}
                            onChange={evt => this.setState({password: evt.target.value})}/><br/>
            <button onClick={() => ACM.signIn(this.state.username, this.state.password)}>Sign in</button>
          </div>
          {this.props.username}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});
const mapDispatchToProps = dispatch => ({
  signIn: () => dispatch({type: 'signin'})
});

export default connect(mapStateToProps, mapDispatchToProps)(Authenticator);
