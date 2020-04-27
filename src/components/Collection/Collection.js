
import React from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
import './Collection.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { env } from "../../util/Environment";
import UserSearch from "../UserSearch/UserSearch";
import Photos from "../Photos/Photos";
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
    Label,
    Input,
    Jumbotron,
    Container,
    Card,
    NavbarToggler, Collapse, Navbar
} from 'reactstrap';
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
      uploadPressed: false
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

    const photosJsx = this.state.collection.photos.map(photo =>
      <div className='collection-photo-container' key={photo.uri}>
          <img src={`${env.serverUrl}/perma/${photo.uri}`} />
        <p>{photo.description}</p>
        <p>Uploaded on {photo.uploadDate}</p>
        <Button color="success" onClick={() => this.deletePhoto(photo.uri)}>Delete</Button>
      </div>
    );

    const uploadJsx = (
      <div>
          <Photos onSelect = {photos => photos.forEach(photo => this.addPhoto(photo.uri))}>
        </Photos>
      </div>
    );
    const uploadOrCollection = this.state.uploadPressed ? uploadJsx: photosJsx ;

    const aclListJsx = (
        <Container>
            <ul>
                {
                    this.state.collection.aclList.map((aclEntry, index) =>

                        <li key={aclEntry.username}>
                            <Form>
                                <Row >
                                    <Col className="text-center" sm={6}>
                                        <a2>{aclEntry.username}</a2>
                                        <FormGroup>
                                            <select class="form-control"
                                                    value={aclEntry.role}
                                                    onChange={evt => this.updateAclEntryRole(index, evt.target.value)}>
                                                <option value="ROLE_OWNER">Owner</option>
                                                <option value="ROLE_EDITOR">Editor</option>
                                                <option value="ROLE_VIEWER">Viewer</option>
                                            </select>
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <br/>
                                        <Button color="success" onClick={() => this.removeAclEntry(index)}>Remove</Button>

                                    </Col>
                                    &nbsp;&nbsp; &nbsp;

                                </Row>
                            </Form>
                        </li>
                    )
                }
            </ul>


        </Container>
    );

    return (
        <Container>
            <div className='Collection'>
                <br/>

                <h1 className="heading">Collection {this.state.collection.name}</h1>
                <h2>
                    by {this.getOwner()}
                </h2>
                <br/>
                <Container>
                    <Row>
                        <h3>ACL List:</h3>
                        {aclListJsx}
                    </Row>
                    <Row>
                        <Col sm="2.5">
                            <h3>Add user</h3>
                        </Col>
                        <Col >
                            <UserSearch  id="form-control"
                                        selectText='Add to collection'
                                        onUserSelect={this.addUserToAcl}
                                        userFilter={this.userNotInAcl}
                                        ref={this.userSearchRef} />
                        </Col>
                    </Row>
                </Container>


                <Button color="success" onClick={this.saveChanges}>Save changes</Button>  &nbsp;&nbsp; &nbsp;
                <Button color="success" onClick={this.getCollection}>Undo changes and reload</Button>
                <div>
                    <br/>

                    <Button color="success" onClick={() => this.setState({uploadPressed: !this.state.uploadPressed})}>Upload/See photos</Button>
                    <br/>
                    {uploadOrCollection}

                </div>
                <br/>
                <Link to='/collections'>Return to list of collections.</Link>
            </div>
        </Container>
    );
  }
}

Collection.propTypes = {};

Collection.defaultProps = {};

export default withRouter(Collection);