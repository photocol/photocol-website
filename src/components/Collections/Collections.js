import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Collections.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import Authenticator from "../Authenticator/Authenticator";
import {Button, Row, Col, FormGroup, Container, Card, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody} from 'reactstrap';
import "@reach/menu-button/styles.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import catlogo from '../../cat-profile.png';

class Collections extends React.Component {
  constructor(props) {
    super(props);

    this.acm = new ApiConnectionManager();
    this.dropdownClick = this.dropdownClick.bind(this);
    this.state = {
      collections: [],
      collectionName: '',
      isCreating: false,
      collection: {
        description: '',
        coverPhotoUri: ''
      },
      dropdownOpen: null
    };
  }

  dropdownClick = name => {
    if(this.state.dropdownOpen===name)
      this.setState({ dropdownOpen: null });
    else
      this.setState({ dropdownOpen: name });
  };

  onEnter = evt => {
    if(evt.key === 'Enter') {
      this.createCollection();
    }
  };

  toggleIsCreating = () => this.setState({isCreating: !this.state.isCreating});

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
        isPublic: 0,
        name: this.state.collectionName
      })
    })
      .then(res => this.updateCollections())
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
      return (<Authenticator onUserAction={this.updateCollections} promptText={'Authenticate to see your collections'} />);

    const createCollection = (
        <Modal isOpen={this.state.isCreating} toggle={this.toggleIsCreating} >
          <ModalHeader toggle={this.toggleIsCreating}>
            Create Collection
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col>
                <FormGroup>
                  <input type='text'
                         id="form-control"
                         value={this.state.collectionName}
                         onChange={evt => this.setState({collectionName: evt.target.value})} onKeyDown={this.onEnter}/><br/>
                </FormGroup>
              </Col>
              <Col>
                <Button outline color="info" onClick={this.createCollection}>Create </Button>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
    );
    return (
        <div >
          <Container>
            <br/>
            <Row>
              <Container>
                {createCollection}
                <Button outline title={'Create Collection'} onClick={this.toggleIsCreating}>
                  <FontAwesomeIcon icon={faPlus} /> Create
                </Button>
              </Container>
            </Row>
          </Container>
          <br/>
          <Container>
            <Row>
              {this.state.collections.map(collection => {
                // const currentUserRole = collection.aclList.find(aclEntry => aclEntry.username === this.props.username).role;
                const collectionOwner = collection.aclList.find(aclEntry => aclEntry.role === 'ROLE_OWNER').username;
                return (

                        <div key={collectionOwner + collection.uri}>
                          <Col>
                            <Card>
                              <Dropdown
                                  isOpen={this.state.dropdownOpen === collection.name} size="lg"
                                  onClick = {() => this.dropdownClick(collection.name)}>
                                <DropdownToggle outline color="info">
                                  <Row>
                                    <Col xs={"1"}>
                                      <img src={collection.coverPhotoUri ? `${process.env.REACT_APP_SERVER_URL}/perma/${collection.coverPhotoUri}` : catlogo}
                                           alt={`${collection.name}`}
                                           style={{width: 30, height: 30}} />
                                    </Col>
                                    <Col xs={"9"}>
                                      {collection.name}<br/>
                                      By {collectionOwner}
                                    </Col>
                                  </Row>
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem>
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
                            </Card>

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