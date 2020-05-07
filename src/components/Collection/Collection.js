import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { env } from "../../util/Environment";
import UserSearch from "../UserSearch/UserSearch";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash, faUserPlus, faEdit, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import Photos from "../Photos/Photos";
import catlogo from '../../cat-profile.png';
import {
  Button, Form, FormGroup, Label, Input, Jumbotron, Container, Card, Collapse, Modal, ModalHeader, ModalBody,
  ModalFooter, ListGroupItem, ListGroup, CardHeader, FormText } from 'reactstrap';

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
        description: '',
        coverPhotoUri: '',
        photos: [],
        aclList: []
      },
      lastLoadedCollection: {}, // for use when updating component
      errorMsg: '',
      uploadPressed: false,
      isEditingAcl: false,
      newAclEntryRole: 'ROLE_VIEWER'
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
          role: this.state.newAclEntryRole
        })
      },
      newAclEntryRole: 'ROLE_VIEWER'
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

    // get changes in name, description, coverPhotoUri
    // set to null if no change so to prevent unnecessary db updates when not necessary
    const newName = current.name===previous.name ? null : current.name;
    const newDescription = current.description===previous.description ? null : current.description;
    const newCoverPhotoUri = current.coverPhotoUri===previous.coverPhotoUri ? null : current.coverPhotoUri;

    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/update`, {
      method: 'POST',
      body: JSON.stringify({
        name: newName,
        description: newDescription,
        coverPhotoUri: newCoverPhotoUri,
        aclList: aclListDiff
      })
    })
      .then(res => {
        if(res.response===true) {

          // TODO: if owner or username changed, redirect to new url

          this.toggleEditModal();
          return;
        }

        // TODO: ERROR HANDLING HERE
        console.error(res.response);
      })
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

  toggleEditModal = () => this.setState({ isEditing: !this.state.isEditing });

  cancelChangesAndExit = () => {
    this.getCollection();
    this.toggleEditModal();
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
      <ListGroupItem className={'d-flex justify-content-between'} key={userAcl.username}>
        <div className={'d-flex flex-column justify-content-center'}>{userAcl.username}</div>
        <div className={'d-flex flex-row align-items-center'}>
          <select value={userAcl.role}
                  className={'form-control w-auto mr-2'}
                  onChange={evt => this.updateAclEntryRole(index, evt.target.value)}>
            <option value={'ROLE_OWNER'}>Owner</option>
            <option value={'ROLE_EDITOR'}>Editor</option>
            <option value={'ROLE_VIEWER'}>Viewer</option>
          </select>
          <Button outline color={'danger'} onClick={() => this.removeAclEntry(index)}>
            <FontAwesomeIcon icon={faUserSlash} />
          </Button>
        </div>
      </ListGroupItem>
    );

    const addAclModalUser = (
      <ListGroupItem className={'d-flex justify-content-between'}>
        <UserSearch id="form-control"
                    promptText={'Add user'}
                    onUserSelect={this.addUserToAcl}
                    userFilter={this.userNotInAcl}
                    ref={this.userSearchRef} />
        <div className={'d-flex flex-row align-items-center'}>
          <select value={this.state.newAclEntryRole}
                  className={'form-control w-auto mr-2'}
                  onChange={evt => this.setState({newAclEntryRole: evt.target.value})}>
            <option value={'ROLE_OWNER'}>Owner</option>
            <option value={'ROLE_EDITOR'}>Editor</option>
            <option value={'ROLE_VIEWER'}>Viewer</option>
          </select>
          <Button outline color={'success'} disabled className={'border-0'}>
            <FontAwesomeIcon icon={faUserPlus} />
          </Button>
        </div>
      </ListGroupItem>
    );

    const changeCollectionName = evt => {
      const newName = evt.target.value;
      const newUri = newName.trim().toLowerCase().replace(/ /g, '-').replace(/[^0-9a-z\-.]/g, '');

      this.setState({
        collection: {
          ...this.state.collection,
          name: newName,
          uri: newUri
        }
      })
    };

    const editAclModal = (
      <Modal isOpen={this.state.isEditing} toggle={this.cancelChangesAndExit} style={{maxWidth: 1000}}>
        <ModalHeader toggle={this.cancelChangesAndExit}>Edit collection</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label htmlFor={'edit-collection-name'}>
                Collection name{' '}
                <FormText className={'d-inline'}>({this.state.collection.name.length}/50)</FormText>
              </Label>
              <Input id={'edit-collection-name'}
                     type={'text'}
                     value={this.state.collection.name}
                     maxLength={50}
                     onChange={changeCollectionName} />
              <FormText>This collection will be available at <code>/collection/{this.state.username}/{this.state.collection.uri}</code>.</FormText>
            </FormGroup>
            <FormGroup>
              <Label htmlFor={'edit-collection-description'}>
                Description{' '}
                <FormText className={'d-inline'}>({(this.state.collection.description || '').length}/1000)</FormText>
              </Label>
              <textarea className={'form-control'}
                        id={'edit-collection-description'}
                        rows={6}
                        maxLength={1000}
                        placeholder={'A description helps people know what this collection is about!'}
                        value={this.state.collection.description}
                        onChange={evt => this.setState({collection: { ...this.state.collection, description: evt.target.value}})}></textarea>
            </FormGroup>
            <FormGroup>
              <Label htmlFor={'edit-collection-cover-photo'}>Choose cover image</Label>
              <Input id={'edit-collection-cover-photo'}
                     value={this.state.collection.coverPhotoUri}
                     placeholder={'Enter URI here. (This is temporary)'}
                     onChange={evt => this.setState({collection: {...this.state.collection, coverPhotoUri: evt.target.value}})} />
            </FormGroup>
            <FormGroup>
              <Label>Change user access</Label>
              <Card>
                <CardHeader onClick={() => this.setState({isEditingAcl: !this.state.isEditingAcl})}
                            style={{cursor: 'pointer'}}>Show user list</CardHeader>
                <Collapse isOpen={this.state.isEditingAcl}>
                  <ListGroup flush>
                    {this.state.collection.aclList.map(editAclModalUser)}
                    {addAclModalUser}
                  </ListGroup>
                </Collapse>
              </Card>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          {JSON.stringify(this.state.collection)!==JSON.stringify(this.state.lastLoadedCollection) && <FormText>Unsaved changes</FormText>}
          <Button onClick={this.cancelChangesAndExit} outline>Cancel changes and exit</Button>
          <Button onClick={this.saveChanges} outline color={'info'}>Save and exit</Button>
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
        <Jumbotron fluid className={'text-light position-relative d-flex flex-column justify-content-center'} style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          height: '30rem'
        }}>
          <div className={'w-100 h-100 position-absolute'}
               style={{
                 backgroundImage: `url(${env.serverUrl}/perma/${this.state.collection.coverPhotoUri})`,
                 top: 0,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 zIndex: -1
               }}></div>
          <Container>
            {editAclModal}
            <div class={'d-flex flex-row align-items-center'}>
              <span className="display-4 mr-3">{this.state.collection.name}</span>
              <span>
                <Button className={'mr-2'}
                        outline
                        onClick={this.toggleEditModal}
                        color={'info'}
                        title={'Edit collection'}>
                  <FontAwesomeIcon icon={faEdit} fixedWidth={true} />
                </Button>
                <Button className={'mr-2'}
                        outline
                        title={'Toggle show/upload photos'}
                        color={'info'}
                        onClick={() => this.setState({uploadPressed: !this.state.uploadPressed})}>
                  <FontAwesomeIcon icon={faFileUpload} fixedWidth={true} />
                </Button>
              </span>
            </div>
            <p>{this.state.collection.description || (<em>No description provided.</em>)}</p>
            <div className={'d-flex flex-row'}>{ this.state.collection.aclList.map(userAclCard) }</div>
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