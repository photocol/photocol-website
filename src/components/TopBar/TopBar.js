import React from 'react';
import { connect } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import LoginManager from '../../util/LoginManager';
import './TopBar.css';
import { Button, Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, NavbarText } from 'reactstrap';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.lm = new LoginManager();
    this.state = {
        isOpen:false
      }
  }
  
  render() {
    return (
        <div>
            <Navbar color="dark" dark expand="md">
                <LinkContainer to='/'>
                    <NavbarBrand>Photocol</NavbarBrand>
                </LinkContainer>
                <NavbarToggler onClick={() => this.setState({isOpen: !this.state.isOpen})} />
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="mr-auto" navbar>
                        <LinkContainer to='/profile'>
                            <NavLink>Profile</NavLink>
                        </LinkContainer>
                        <LinkContainer to='/collections'>
                            <NavLink>Collections</NavLink>
                        </LinkContainer>
                        <LinkContainer to='/photos'>
                            <NavLink>Photos</NavLink>
                        </LinkContainer>
                    </Nav>
                    {this.props.username!=='not logged in' &&
                        <NavbarText className="mr-3">{this.props.username}</NavbarText>}
                    <NavItem>
                        {this.props.username==='not logged in'
                            ? <LinkContainer to='/authenticate'>
                                <Button outline color="info">Log in / Sign up</Button>
                              </LinkContainer>
                            : <Button outline color="info" onClick={this.lm.logOut}>Sign out</Button>
                        }
                    </NavItem>
                </Collapse>
            </Navbar>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});

// redux props
export default connect(mapStateToProps)(TopBar);
