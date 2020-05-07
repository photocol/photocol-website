import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { env } from "../../util/Environment";
import UserSearch from "../UserSearch/UserSearch";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash, faEdit, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import Photos from "../Photos/Photos";
import catlogo from '../../cat-profile.png';
import {
  CardBody, CardImg, CardTitle, Button, CardText, Row, Col, Form, FormGroup, Label, Input, Jumbotron, Container,
  Card, NavbarToggler, Collapse, Navbar, Modal, ModalHeader, ModalBody, ModalFooter, ListGroupItem, ListGroup,
  CardHeader } from 'reactstrap';
class Collection extends React.Component {
    constructor(props) {
        super(props);

    // get params from uri
    const { username, collectionuri } = props.match.params;
    this.state = {
      username, collectionuri,
      collection: {
        name: '',
        uri: '',
        photos: [],
        aclList: []
      },
      lastLoadedCollection: {}, // for use when updating component
      errorMsg: '',
      uploadPressed: false,
      isEditingAcl: false
    };

    this.acm = new ApiConnectionManager();
    this.userSearchRef = React.createRef();
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.getCollection();
  }

  getCollection = () => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}`)
      .then(res => {
        this.setState({
          errorMsg: '',
          collection: res.response,
          lastLoadedCollection: JSON.parse(JSON.stringify(res.response))  // simple clone for checking against later
        });
      })
      .catch(err => {
        if(!err.response)
          return;
        this.setState({errorMsg: err.response.error});
      });
  };

  getOwner = () =>
    (this.state.collection.aclList.find(acl => acl.role==='ROLE_OWNER') || {username:''}).username;

  addUserToAcl = (username) => {
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.concat({
          username: username,
          role: 'ROLE_VIEWER'
        })
      }
    }, this.userSearchRef.current.refilter);
  };

  userNotInAcl = username =>
    !this.state.collection.aclList.find(aclEntry => username===aclEntry.username);

  saveChanges = () => {
    const current = this.state.collection;
    const previous = this.state.lastLoadedCollection;

    // get changes in acl
    const newEntries = current.aclList.filter(aclEntry =>
      !previous.aclList.find(pAclEntry => aclEntry.username===pAclEntry.username && aclEntry.role===pAclEntry.role));
    const removedEntries = previous.aclList.filter(aclEntry =>
      !current.aclList.find(cAclEntry => aclEntry.username===cAclEntry.username))
      .map(aclEntry => ({...aclEntry, role: 'ROLE_NONE'}));
    const aclListDiff = newEntries.concat(removedEntries);

    // TODO: do something if owner changes

    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/update`, {
      method: 'POST',
      body: JSON.stringify({
        aclList: aclListDiff
      })
    })
      .then(res => console.log(res))
      .catch(err => {
        console.error(err)
      });
  };

  updateAclEntryRole = (index, newRole) => {
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.map((aclEntry, i) =>
          i!==index
            ? aclEntry
            : {...aclEntry, role: newRole}
        )
      }
    });
  };

  removeAclEntry = index =>
    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.filter((_, i) => i!==index)
      }
    });

  addPhoto = (uri) => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/addphoto`, {
        method: 'POST',
        body: JSON.stringify({
            uri: uri
        })
    })
        .then(res => this.getCollection())
        .catch(res => console.error(res));
  };

  deletePhoto = uri => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/removephoto`, {
      method: 'POST',
      body: JSON.stringify({
        uri: uri
      })
    })
      .then(res => this.getCollection())
      .catch(res => console.error(res));
  };

  render = () => {
    // FIXME: negative EQ error handling
    if(this.state.errorMsg)
      return (
        <div>
          Received error from server: {this.state.errorMsg}.<br/>
          <Link to='/collections'>Return to collections</Link>
        </div>
      );

    const editAclModalUser = (userAcl, index) => (
      <ListGroupItem className={'d-flex justify-content-between'}>
        <div className={'d-flex flex-column justify-content-center'}>{userAcl.username}</div>
        <div className={'d-flex flex-row align-items-center'}>
          <select value={userAcl.role} className={'form-control w-auto mr-2'}>
            <option value={'ROLE_OWNER'}>Owner</option>
            <option value={'ROLE_EDITOR'}>Editor</option>
            <option value={'ROLE_VIEWER'}>Viewer</option>
          </select>
          <Button color={'danger'}>
            <FontAwesomeIcon icon={faUserSlash} />
          </Button>
        </div>
      </ListGroupItem>
    );

    const toggleEditModal = () => this.setState({ isEditing: !this.state.isEditing });

    const editAclModal = (
      <Modal isOpen={this.state.isEditing} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit collection</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Collection name</Label>
              <Input type={'text'} value={this.state.collection.name} />
            </FormGroup>
            <FormGroup>
              <Label>Collection URI</Label>
              <Input type={'text'} value={this.state.collection.uri} disabled />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <textarea className={'form-control'} rows={4} value={this.state.collection.description}></textarea>
            </FormGroup>
            <FormGroup>
              <Label>Change user access</Label>
              <Card>
                <CardHeader onClick={() => this.setState({isEditingAcl: !this.state.isEditingAcl})}
                            style={{cursor: 'pointer'}}>Show user list</CardHeader>
                <Collapse isOpen={this.state.isEditingAcl}>
                  <ListGroup flush>
                    {this.state.collection.aclList.map(editAclModalUser)}
                  </ListGroup>
                </Collapse>
              </Card>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => this.setState({isEditing: false, isEditingAcl: false})} outline>Cancel</Button>
          <Button onClick={() => this.setState({isEditing: false, isEditingAcl: false})} outline color={'info'}>Save and exit</Button>
        </ModalFooter>
      </Modal>
    );

    const photosJsx = this.state.collection.photos.length===0
      ? (
        <Container>
          <p>There are no photos here yet.</p>
        </Container>
      )
      : this.state.collection.photos.map(photo =>
        <div className='collection-photo-container' key={photo.uri}>
          <img src={`${env.serverUrl}/perma/${photo.uri}`} />
          <p>{photo.description}</p>
          <p>Uploaded on {photo.uploadDate}</p>
          <Button color="success" onClick={() => this.deletePhoto(photo.uri)}>Delete</Button>
        </div>
      );

    const uploadJsx = (
      <Photos onSelect = {photos => photos.forEach(photo => this.addPhoto(photo.uri))}></Photos>
    );
    const uploadOrCollection = this.state.uploadPressed ? uploadJsx: photosJsx ;

    const userAclCard = (aclEntry, index) => (
      <div key={aclEntry.username} className={'mr-2'}>
        <Card outline color={aclEntry.role==='ROLE_OWNER'?'success':aclEntry.role==='ROLE_ENTRY'?'warning':'danger'}
              style={{width: 50, height: 50}}>
          <img src={catlogo} title={aclEntry.username} style={{width: 50, height: 50}}/>
        </Card>
      </div>
    );

    return (
      <div className={'Collection'}>
        <Jumbotron fluid>
          <Container className={'mt-5 Collection'}>
            {editAclModal}
            <div class={'d-flex flex-row align-items-center'}>
              <span className="display-3 mr-3">{this.state.collection.name}</span>
              <span>
                <Button className={'mr-2'} outline onClick={toggleEditModal}><FontAwesomeIcon icon={faEdit} /></Button>
                <Button className={'mr-2'} outline onClick={() => this.setState({uploadPressed: !this.state.uploadPressed})}><FontAwesomeIcon icon={faFileUpload} /></Button>
              </span>
            </div>
            <p>
            </p>
            <div className={'d-flex flex-row'}>{ this.state.collection.aclList.map(userAclCard) }</div>
            {/*<UserSearch id="form-control"*/}
            {/*            selectText='Add to collection'*/}
            {/*            onUserSelect={this.addUserToAcl}*/}
            {/*            userFilter={this.userNotInAcl}*/}
            {/*            ref={this.userSearchRef} />*/}
          </Container>
        </Jumbotron>

        {uploadOrCollection}
      </div>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);