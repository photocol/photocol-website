import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import UserSearch from "../UserSearch/UserSearch";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSlash, faUserPlus, faEdit, faFileUpload, faObjectUngroup, faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import Photos from "../Photos/Photos";
import defaultAvatar from '../../default_avatar.svg';    // https://fontawesome.com/license
import {
  Button, Form, FormGroup, Label, Input, Jumbotron, Container, Card, Collapse, Modal, ModalHeader, ModalBody,
  ModalFooter, ListGroupItem, ListGroup, CardHeader, FormText, CardImg
} from 'reactstrap';
import PhotoSelectorList from "../PhotoSelectorList/PhotoSelectorList";
import {ToastChef, Toaster} from "../../util/Toaster";

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
        isPublic: 0,
        photos: [],
        aclList: []
      },
      lastLoadedCollection: {}, // for use when updating component
      notFound: false,
      uploadPressed: false,
      isEditingAcl: false,
      isAddingPhotos: false,
      isSelectMode: false,
      newAclEntryRole: 'ROLE_VIEWER',
      addUsername: '',
      toasts: []
    };

    this.acm = new ApiConnectionManager();
    this.userSearchRef = React.createRef();

    this.addToast = ToastChef.getAddToastFunction(this);
  }
  
  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
    this.getCollection();
  }

  getCollection = () => {
    this.acm.request(`/perma/collection/${this.state.username}/${this.state.collectionuri}`)
      .then(res => {
        this.setState({
          notFound: false,
          errorMsg: '',
          collection: res.response,
          lastLoadedCollection: JSON.parse(JSON.stringify(res.response))  // simple clone for checking against later
        }, async () => {
          // get profile photos; do this in callback to avoid extra wait time
          const aclListWithProfilePhotos = await Promise.all(this.state.collection.aclList.map(async (aclEntry, index) => {
            const profilePhoto = (await this.acm.request(`/user/profile/${aclEntry.username}`)).response.profilePhoto;
            return {...aclEntry, profilePhoto};
          }));
          this.setState({collection: {...this.state.collection, aclList: aclListWithProfilePhotos}});
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({notFound: true});
      });
  };

  getOwner = () =>
    (this.state.collection.aclList.find(acl => acl.role==='ROLE_OWNER') || {username:''}).username;

  addUserToAcl = async username => {
    const profilePhoto = (await this.acm.request(`/user/profile/${username}`)).response.profilePhoto;

    this.setState({
      collection: {
        ...this.state.collection,
        aclList: this.state.collection.aclList.concat({
          username: username,
          role: this.state.newAclEntryRole,
          profilePhoto: profilePhoto
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
    const newIsPublic = current.isPublic===previous.isPublic ? null : current.isPublic;

    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/update`, {
      method: 'POST',
      body: JSON.stringify({
        name: newName,
        description: newDescription,
        coverPhotoUri: newCoverPhotoUri,
        aclList: aclListDiff,
        isPublic: newIsPublic
      })
    })
      .then(res => {
        // TODO: handle username or owner change
        this.addToast('', 'Changes successfully saved', 'success');
        this.toggleEditModal();
      })
      .catch(err => {
        // TODO: error handling here
        this.addToast('Error', err.response.error + ' ' + err.response.details, 'warning');
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

  addPhoto = uri => {
    this.acm.request(`/collection/${this.state.username}/${this.state.collectionuri}/addphoto`, {
        method: 'POST',
        body: JSON.stringify({
            uri: uri
        })
    })
        .then(res => this.getCollection())
        .catch(res => console.error(res));
  };

  addPhotos = selectedPhotos => {
    selectedPhotos.forEach(photo => this.addPhoto(photo.uri));
    this.toggleAddPhotosModal();
  };

  removeSelectedPhotos = () => {
    const selectedPhotos = this.state.collection.photos.filter(photo => photo.isSelected);
    selectedPhotos.forEach(photo => this.removePhoto(photo.uri));
  };

  removePhoto = uri => {
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
  toggleAddPhotosModal = () => this.setState({ isAddingPhotos: !this.state.isAddingPhotos });

  cancelChangesAndExit = () => {
    this.getCollection();
    this.toggleEditModal();
    this.addToast('', 'Cancelled changes to profile', 'info');
  };

  updateCollectionPhotos = photoList => {
    this.setState({
      collection: {
        ...this.state.collection,
        photos: photoList
      }
    });
  };

  render = () => {
    if(this.state.notFound)
      return (
        <Jumbotron className={'bg-transparent text-center'}>
          <Container>
            <h1 className={'display-4 mb-2'}>Collection not found.</h1>
            <p>Return <Link to={`/`}>home</Link> or to <Link to={`/collections`}>your collections</Link>.</p>
          </Container>
        </Jumbotron>
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
                    searchQuery={this.state.addUsername}
                    onChange={evt => this.setState({addUsername: evt.target.value})}
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

    const collectionAclWithoutProfilePhotos = this.state.collection.aclList.map(aclEntry => ({...aclEntry, profilePhoto: undefined}));
    const hasUnsavedChanges = JSON.stringify({
      ...this.state.collection,
      aclList: collectionAclWithoutProfilePhotos
    })!==JSON.stringify(this.state.lastLoadedCollection);
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
              <Label htmlFor={'edit-collection-pub'}>Visibility</Label>
              <select className={'form-control'}
                      value={this.state.collection.isPublic}
                      onChange={evt => this.setState({collection: {...this.state.collection, isPublic: evt.target.value}})}>
                <option value={0}>Private</option>
                <option value={1}>Public</option>
                <option value={2}>Discoverable</option>
              </select>
              <FormText>
                {
                  this.state.collection.isPublic===0
                    ? 'Private collections are only viewable by the users it is explicitly shared with.'
                    : this.state.collection.isPublic===1
                      ? 'Public collections are viewable by anyone.'
                      : 'Discoverable collection details are public, but their images are private.'
                }
              </FormText>
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
          {hasUnsavedChanges && <FormText>Unsaved changes</FormText>}
          <Button onClick={this.cancelChangesAndExit} outline>Cancel changes and exit</Button>
          <Button onClick={this.saveChanges} outline color={'info'}>Save and exit</Button>
        </ModalFooter>
      </Modal>
    );

    const addPhotosModal = (
      <Modal toggle={this.toggleAddPhotosModal} isOpen={this.state.isAddingPhotos} style={{maxWidth: 1000}}>
        <ModalHeader toggle={this.toggleAddPhotosModal}></ModalHeader>
        <Photos onSelect={this.addPhotos}></Photos>
      </Modal>
    );

    const userAclCard = (aclEntry, index) => (
      <div key={aclEntry.username} className={'mr-4'}>
        <Link to={`/profile/${aclEntry.username}`} title={aclEntry.username}>
          <Card outline className={'overflow-hidden ' + (aclEntry.role==='ROLE_OWNER'?'bg-success':aclEntry.role==='ROLE_ENTRY'?'bg-warning':'bg-danger')}>
            <CardHeader className={'pb-0'} />
            <CardImg src={aclEntry.profilePhoto ? `${process.env.REACT_APP_SERVER_URL}/perma/${aclEntry.profilePhoto}` : defaultAvatar}
                     alt={aclEntry.username}
                     style={{width: 64, height: 64}}
                     className={'bg-light'}
                     bottom />

          </Card>
        </Link>
      </div>
    );

    const selectedPhotos = this.state.collection.photos.filter(photo => photo.isSelected);

    return (
      <div className={'Collection'}>
        {editAclModal}
        {addPhotosModal}
        <Toaster toasts={this.state.toasts} onRemoveToast={ToastChef.getRemoveToastFunction(this)} />
        <Jumbotron fluid className={'mb-0 text-light position-relative d-flex flex-column justify-content-center'} style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          height: '30rem'
        }}>
          <div className={'w-100 h-100 position-absolute'}
               style={{
                 backgroundImage: `url(${process.env.REACT_APP_SERVER_URL}/perma/${this.state.collection.coverPhotoUri})`,
                 top: 0,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 zIndex: -1
               }}></div>
          <Container>
            <div className={'d-flex flex-row align-items-center'}>
              <span className="display-4 mr-3">{this.state.collection.name}</span>
              <span>
                <Button className={'mr-2'}
                        onClick={this.toggleEditModal}
                        color={'info'}
                        title={'Edit collection details'}>
                  <FontAwesomeIcon icon={faEdit} fixedWidth={true} />
                </Button>
                <Button className={'mr-2'}
                        title={'Add photos to collection'}
                        color={'info'}
                        onClick={this.toggleAddPhotosModal}>
                  <FontAwesomeIcon icon={faFileUpload} fixedWidth={true} />
                </Button>
                <Button className={'mr-2'}
                        title={'Select photos'}
                        color={'info'}
                        onClick={() => this.setState({isSelectMode: !this.state.isSelectMode})}>
                  <FontAwesomeIcon icon={faObjectUngroup} fixedWidth={true} />
                </Button>
                {
                  this.state.isSelectMode && (
                    <Button className={'mr-2'}
                            title={'Remove selected photos'}
                            color={'danger'}
                            disabled={selectedPhotos.length===0}
                            onClick={this.removeSelectedPhotos}>
                      <FontAwesomeIcon icon={faMinusSquare} fixedWidth={true} />
                    </Button>
                  )
                }
                {!this.state.isSelectMode || selectedPhotos.length===0 ? '' : selectedPhotos.length + ' photos selected.'}
              </span>
            </div>
            <p>{this.state.collection.description || (<em>No description provided.</em>)}</p>
            <div className={'d-flex flex-row'}>{ this.state.collection.aclList.map(userAclCard) }</div>
          </Container>
        </Jumbotron>
        <PhotoSelectorList photoList={this.state.collection.photos}
                           onSelectedChange={this.updateCollectionPhotos}
                           selectEnabled={this.state.isSelectMode} />
      </div>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);