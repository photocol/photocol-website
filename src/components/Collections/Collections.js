import React from 'react';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import Authenticator from "../Authenticator/Authenticator";
import {connect} from 'react-redux';
import './Collections.css';
import {Button, Row, Col, CardImg, CardImgOverlay, CardHeader, CardTitle, CardSubtitle, CardText, CardBody, CardColumns, Form, FormGroup,
  FormFeedback, Label, Container, Card, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, Progress, Input, FormText
} from 'reactstrap';
import "@reach/menu-button/styles.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import { LinkContainer } from 'react-router-bootstrap';
import cover from '../../windows.jpg'; // https://slate.com/technology/2014/04/charles-o-rear-is-the-photographer-who-took-the-windows-xp-wallpaper-photo-in-napa-valley.html

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
      dropdownOpen: null,
      createCollectionError: {},
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
      this.setState({
        collectionName: '',
        createCollectionError: {}
      })
    }
  };

  toggleIsCreating = () => this.setState({isCreating: !this.state.isCreating});

  updateCollections = () => {
    this.acm.request('/collection/currentuser')
        .then(res => {
          this.setState({
            collections: res.response
          })
        })
        .catch(err => console.error(err));
  };

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
      .then(res => {
          this.updateCollections();
          console.log(res);
      }
      )
      .catch(res => {
        const error = res.response.error;
        const details = res.response.details;
        console.log(error);
        switch(error){
          case 'INPUT_FORMAT_ERROR':
            break;
          default:
            this.setState({createCollectionError: {collectionName: `Error: "${error}". Please contact the devs for more info.`}});
            return;
        }
        console.log(res.response);
        console.log(details);
        switch(details){
          case 'NAME_FORMAT':
            this.setState({createCollectionError: {collectionName: 'Invalid Collection Name'}});
            break;
          case 'NAME_MISSING':
            this.setState({createCollectionError: {collectionName: 'Collection name missing'}});
            break;
          default:
        }
      });
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
                  <Input type='text'
                         id="form-control"
                         value={this.state.collectionName}
                         invalid={!!this.state.createCollectionError.collectionName}
                         onChange={evt => this.setState({collectionName: evt.target.value})}
                         onKeyDown={this.onEnter}/>
                  <FormFeedback>
                    {this.state.createCollectionError.collectionName}
                  </FormFeedback>
                  <FormText>Collection name cannot be empty or more than 50 characters</FormText>
                  <br/>
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
          <Container >
            <Row>
              {this.state.collections.map(collection => {
                // const currentUserRole = collection.aclList.find(aclEntry => aclEntry.username === this.props.username).role;
                const collectionOwner = collection.aclList.find(aclEntry => aclEntry.role === 'ROLE_OWNER').username;
                return (
                  <Col key={collectionOwner + collection.uri}
                       xs={"10"} md={"6"} lg={"4"}
                       className="mb-4">
                    <LinkContainer to={`/collection/${collectionOwner}/${collection.uri}`}
                                   style={{ height: '17rem' }}>
                      <Card className="text-center">
                        {collection.coverPhotoUri === undefined
                          ?  <CardImg top src={cover} alt="Card image cap"
                                      className = "image"/>
                          :  <CardImg top src={`${process.env.REACT_APP_SERVER_URL}/perma/${collection.coverPhotoUri}`}
                                      className = "image"/>
                        }
                        <CardBody>
                          <CardTitle style={{ fontWeight: 'bold' }}>
                            {collection.name}
                          </CardTitle>
                          <CardSubtitle className="mb-2 text-muted">
                            By {collectionOwner}
                          </CardSubtitle>
                          <CardText className ="description" >
                            {collection.description}
                          </CardText>
                        </CardBody>
                      </Card>
                    </LinkContainer>
                  </Col>
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