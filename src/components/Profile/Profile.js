import React from 'react';
import './Profile.css';
import {connect} from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardImg,
  Col,
  Collapse,
  Container,
  FormGroup,
  FormText,
  Input,
  Jumbotron,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader, Row
} from 'reactstrap';
import {Toaster,ToastChef} from "../../util/Toaster";
import {Link, Redirect, withRouter} from 'react-router-dom';
import Authenticator from "../Authenticator/Authenticator";
import ApiConnectionManager from "../../util/ApiConnectionManager";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faUserEdit} from "@fortawesome/free-solid-svg-icons";
import PhotoSelectorList from "../PhotoSelectorList/PhotoSelectorList";
import UserSearch from "../UserSearch/UserSearch";
import defaultAvatar from '../../noprofile.png';

class Profile extends React.Component {

  constructor(props) {
    super(props);

    // get username from url, if applicable
    const username = props.match.params.username;

    this.state = {
      username: username || this.props.username,
      isUrlUsername: !!username,
      isEditing: false,
      isSelectingPhoto: false,
      user: {
        username: '',
        email: '',
        profilePhoto: '',
        displayName: ''
      },
      photoList: [],
      toasts: [],
      collections: [],
      searchUsername: ''
    };
    this.acm = new ApiConnectionManager();

    this.addToast = ToastChef.getAddToastFunction(this);
  }

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({ photoList: res.response });
    }).catch(err => {
      console.error(err);
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const username = this.props.match.params.username || this.props.username;
    if (username!==prevState.username)
      this.updateUser(username);
  };

  componentDidMount = () => {
    const username = this.props.match.params.username || this.props.username;
    this.updateUser(username);
  };

  updateUser = username => {
    console.log(username);
    if(username===this.props.username || (!username && this.props.username))
      this.getPhotoList();
    this.setState({
      username: username,
      isUrlUsername: !!this.props.match.params.username,
      user: {
        username: '',
        email: '',
        profilePhoto: '',
        displayName: ''
      },
      collections: []
    });
    this.acm.request('/user/profile' + (this.state.username ? `/${this.state.username}` : ''))
      .then(res => {
        this.setState({
          user: {displayName: '', profilePhoto: '', ...res.response, collections: undefined},
          collections: res.response.collections
        });
      })
      .catch(err => {
        switch(err.response.error) {
          // handled normally, ignore here
          case 'USER_NOT_FOUND':
            break;
          // unexpected errors
          default:
            this.addToast('Error', err.response.error, 'danger');
        }
      });
  };

  switchUser = () => {
    this.props.history.push(`/profile/${this.state.searchUsername}`);
    this.setState({searchUsername: ''});
  };

  saveProfile = () => {
    this.acm.request('/user/update', {
      method: 'POST',
      body: JSON.stringify({
        displayName: this.state.user.displayName,
        profilePhoto: this.state.user.profilePhoto
      })
    })
      .then(res => {
        this.toggleIsEditing();
        this.addToast('', 'Saved changes to profile successfully', 'success');
      })
      .catch(err => {
        this.addToast('Error', err.response.error, 'danger');
      });
  };

  cancelChanges = () => {
    this.updateUser(this.state.username);
    this.toggleIsEditing();
    this.addToast('', 'Changes to profile cancelled', 'info');
  };

  toggleIsEditing = () => this.setState({isEditing: !this.state.isEditing});

  render = () => {

    console.log(this.state.user);

    const searchUserJsx = (
      <Jumbotron fluid className={'text-center bg-transparent'}>
        <Container>
          <h1 className={'display-4'}>View a user's profile</h1>
          <UserSearch promptText={'Search users'}
                      searchQuery={this.state.searchUsername}
                      onChange={evt => this.setState({searchUsername: evt.target.value})}
                      onUserSelect={username => this.setState({searchUsername: username})}
                      className={'d-inline-block mx-2'} />
          <Button onClick={this.switchUser}
                  outline
                  color={'primary'}>View profile</Button>
        </Container>
      </Jumbotron>
    );

    /* show authentication if not logged in and if no username is specified as url param */
    if(this.props.username==='not logged in' && !this.state.isUrlUsername)
      return (
        <>
          {searchUserJsx}
          <Authenticator promptText={'View your profile'} />
        </>
      );

    /* this makes some of the above code dealing with case that not specified in username, but is useful */
    if(this.props.username!=='not logged in' && !!!this.props.match.params.username )
      return (<Redirect to={`/profile/${this.props.username}`} />);

    const collectionsJsx = this.state.collections.map(collection => (
      <Col xs={12} md={6} lg={4}>
        <Link to={`/collection/${this.state.username}/${collection.uri}`} className={'link-nostyle'}>
          <Card>
            <CardImg top src={`${process.env.REACT_APP_SERVER_URL}/perma/${collection.coverPhotoUri}`} />
            <CardBody>
              <p className={'text-truncate'}>{collection.name}</p>
              <p className={'small text-secondary'}>{collection.description}</p>
            </CardBody>
          </Card>
        </Link>
      </Col>
    ));

    const selectedPhoto = this.state.photoList.find(photo => photo.isSelected);
    const defaultPhoto = defaultAvatar;
    const editUserModal = (
      <Modal isOpen={this.state.isEditing} toggle={this.cancelChanges} style={{maxWidth: 1000}}>
        <ModalHeader toggle={this.cancelChanges}>
          {this.props.username}: Editing profile
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label htmlFor={'display-name-input'}>Display name{' '}
              <FormText className={'d-inline'}>({this.state.user.displayName.length}/50)</FormText>
            </Label>
            <Input value={this.state.user.displayName}
                   type={'text'}
                   placeholder={'Johnny Appleseed'}
                   onChange={evt => this.setState({user: {...this.state.user, displayName: evt.target.value}})}
                   maxLength={50} />
          </FormGroup>
          <FormGroup>
            <Label className={'d-block'}>Profile photo</Label>
            <Card className={'my-2 d-inline-block'}>
              <img src={this.state.user.profilePhoto ? `${process.env.REACT_APP_SERVER_URL}/perma/${this.state.user.profilePhoto}` : defaultPhoto}
                   alt={`${this.props.username}'s profile`}
                   style={{maxWidth:100, maxHeight: 100}}/>
            </Card>
            <Button color={'danger'}
                    outline
                    className={'ml-2'}
                    onClick={() => this.setState({user: {...this.state.user, profilePhoto: ''}})}>Remove profile photo</Button>
            <Card>
              <CardHeader className={'cursor-pointer d-flex flex-row justify-content-between align-items-center'}
                          onClick={() => this.setState({isSelectingPhoto: !this.state.isSelectingPhoto})}>
                Select from your photos
                <Button outline
                        color={'success'}
                        disabled={!!!selectedPhoto}
                        onClick={() => this.setState({user: {...this.state.user, profilePhoto: selectedPhoto.uri}})}><FontAwesomeIcon icon={faCheck} /></Button>
              </CardHeader>
              <Collapse isOpen={this.state.isSelectingPhoto} style={{maxHeight: 400, overflowY: 'scroll'}}>
                <PhotoSelectorList selectEnabled={true}
                                   multiSelectEnabled={false}
                                   onSelectedChange={photoList => this.setState({photoList: photoList})}
                                   photoList={this.state.photoList} />
              </Collapse>
            </Card>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.cancelChanges}>Cancel changes and exit</Button>
          <Button color={'success'} onClick={this.saveProfile}>Save and exit</Button>
        </ModalFooter>
      </Modal>
    );

    return (
      <>
        {editUserModal}
        <Toaster toasts={this.state.toasts} onRemoveToast={ToastChef.getRemoveToastFunction(this)} />
        <Jumbotron className={'bg-transparent'}>
          <Container className='mt-5 text-center'>
            <img src={this.state.user.profilePhoto ? `${process.env.REACT_APP_SERVER_URL}/perma/${this.state.user.profilePhoto}` : defaultPhoto}
                 alt={`${this.state.user.username}'s profile`}
                 title={`${this.state.user.username}'s profile`}
                 style={{width: '300px', height: '300px', borderRadius: '50%', objectFit: 'cover'}}
                 className={"mb-4"}/>
            <h1 className={'display-3'}>{this.state.user.username || 'User not found'}</h1>
            { this.state.user.displayName && <p><em>({this.state.user.displayName})</em></p> }
            <p>{this.state.user.email}</p>
            {this.props.username!=='not logged in' && this.props.username===this.state.user.username && (
                <Button outline title={'Edit user profile'} onClick={this.toggleIsEditing}>
                  <FontAwesomeIcon icon={faUserEdit} />
                </Button>
              )
            }
            { !this.state.user.username && (
                <p>
                  <Link to={'/'}>Return home.</Link>{' '}
                  {this.props.username!=='not logged in' && <Link to={'/profile'}>View your profile.</Link>}
                </p>
              )
            }
          </Container>
        </Jumbotron>
        <Jumbotron fluid className={'bg-transparent'}>
          <Container><h1>Friends</h1></Container>
        </Jumbotron>
        <Jumbotron fluid className={'bg-transparent'}>
          <Container>
            <h1>Public collections</h1>
            <Row>
              {collectionsJsx}
            </Row>
          </Container>
        </Jumbotron>
        {searchUserJsx}
      </>
    );
  }
}

const mapStateToProps = state => ({
  username: state.user.username
});
export default withRouter(connect(mapStateToProps)(Profile));
