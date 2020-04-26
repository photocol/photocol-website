import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import LoginManager from '../../util/LoginManager';
import './TopBar.css';
import { CardBody, CardImg, CardTitle, Button, CardText, Row, Col, Form, FormGroup, Label, Input, Jumbotron, Container, Card } from 'reactstrap';
import { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavbarText
} from 'reactstrap';
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
                <NavbarBrand href="/">Photocol</NavbarBrand>
                <NavbarToggler onClick={() => this.setState({isOpen: !this.state.isOpen})} />
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="mr-auto" navbar>
                        <NavItem>
                            <NavLink href='/profile'>Profile</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href='/collections'>Collections</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href='/photos'>Photos</NavLink>
                        </NavItem>

                    </Nav>
                    <NavbarText className ="text-center">Currently signed-in user:<br/>
                        {this.props.username}</NavbarText> &nbsp; &nbsp; &nbsp;
                    <NavItem>
                        {this.props.username==='not logged in'
                            ? <Button color="success" href='/authenticate'>Sign in</Button>
                            : <Button color="success" onClick={this.lm.logOut}>Sign out</Button>
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
