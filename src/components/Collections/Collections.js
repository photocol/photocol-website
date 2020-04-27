import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Collections.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import Authenticator from "../Authenticator/Authenticator";
import {env} from "../../util/Environment";
import {
  CardBody,
  CardImg,
  CardTitle,
  Button,
  CardText,
  Row,
  Col,
  Form,
  FormGroup,
  Table,
  Tbody,
  Label,
  Input,
  Jumbotron,
  Container,
  Card,
  NavbarToggler, Collapse, Navbar
} from 'reactstrap';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink,
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";
class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.acm = new ApiConnectionManager();

    this.dropdownClick = this.dropdownClick.bind(this);
    this.state = {
      collections: [],
      collectionName: '',
      dropdownOpen: null
    };
  }

  dropdownClick(name) {
    if(this.state.dropdownOpen == name)
    {
      this.setState({
          dropdownOpen: null
      }
      )
    }
    else{
      this.setState({
        dropdownOpen: name
      })
    }
  };
  onEnter = (evt) => {
    if(evt.key === 'Enter') {
      this.createCollection();
    }
  };
  updateCollections = () => {
    this.acm.request('/collection/currentuser')
        .then(res => {
          console.log(res);
          this.setState({
            collections: res.response
          })
        })
        .catch(err => console.error(err));
  }

  componentDidMount = () => {
    this.updateCollections();
  };

  createCollection = () => {
    this.acm.request('/collection/new', {
      method: 'POST',
      body: JSON.stringify({
        isPublic: false,
        name: this.state.collectionName
      })
    }) .then(res => {
      this.updateCollections();})
        .catch(err => console.error(err));
  };

  deleteCollection = (username, uri) => {
    this.acm.request(`/collection/${username}/${uri}/delete`, {
      method: 'POST'
    })
        .then(res => this.updateCollections())
        .catch(res => console.error(res));
  };


  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.updateCollections}/>);

    return (
        <div >
          <Container>
            <br/>
            <Row>
              <Form>
                <FormGroup>

                  <Label htmlFor="form-group" >Collection Name</Label>
                  <input type='text'
                         id="form-control"
                         value={this.state.collectionName}
                         onChange={evt => this.setState({collectionName: evt.target.value})} onKeyDown={this.onEnter}/><br/>
                </FormGroup>
              </Form> &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
              <div>
                <Button color="success" onClick={this.createCollection}>Create Collection</Button>
              </div>
            </Row>
          </Container>
          <Container>
            <Row>
              {this.state.collections.map(collection => {
                const currentUserRole = collection.aclList.find(aclEntry => aclEntry.username === this.props.username).role;
                const collectionOwner = collection.aclList.find(aclEntry => aclEntry.role === 'ROLE_OWNER').username;

                return (

                        <div key={collectionOwner + collection.uri}>
                          <Col>
                            <Dropdown
                                isOpen={this.state.dropdownOpen === collection.name} size="lg"
                                onClick = {() => this.dropdownClick(collection.name)}>
                              <DropdownToggle color="dark">
                                Collection: {collection.name}<br/>
                                Role: {currentUserRole}
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem onClick={() => {}}>
                                  <Link to={`/collection/${collectionOwner}/${collection.uri}`}>Collection</Link>
                                </DropdownItem>
                                {
                                  collectionOwner === this.props.username &&
                                  (
                                      <DropdownItem onClick={() => this.deleteCollection(collectionOwner, collection.uri)}>Delete</DropdownItem>
                                  )
                                }
                              </DropdownMenu>
                            </Dropdown>
                          </Col>

                          <br/>
                        </div>



                );

              })}
            </Row>


          </Container>
        </div>
    );
  };
}

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps)(Collections);