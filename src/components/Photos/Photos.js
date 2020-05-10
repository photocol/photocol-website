import React from 'react';
import PropTypes from 'prop-types';
import './Photos.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { withRouter} from "react-router-dom"
import {connect} from "react-redux";
import Authenticator from "../Authenticator/Authenticator";
import { Button, Jumbotron, Container, ModalBody, Modal, Progress, ModalHeader } from 'reactstrap';
import PhotoSelectorList from '../PhotoSelectorList/PhotoSelectorList';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBan, faCheck, faFileUpload, faObjectUngroup} from '@fortawesome/free-solid-svg-icons';

class Photos extends React.Component {
  constructor(props) {
    super(props);
    this.acm = new ApiConnectionManager();
    this.state = {
      photoList: [],
      isSelected: false,
      uploadCount: 0,
      uploadTotal: 0,
      uploadModal: false,
      isSelectMode: !!props.onSelect || false,
      isSelectComponent: !!props.onSelect
    };

    this.history = props.history;

    // if used as selection component
    // state.isSelected is used as temporary select (if component), isSelect is used if only used for selecting photos
    this.isSelect = props.onSelect !== null;
    this.isSelect && (this.onSelect = props.onSelect);
  }

  componentDidMount() {
    this.getPhotoList();
  }

  confirmPhotoSelection = () => {
    this.onSelect(this.state.photoList.filter(photo => photo.isSelected));
  };

  toggleUploadModal = () => this.setState({ uploadModal: !this.state.uploadModal });

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({ photoList: res.response });
    }).catch(err => {
      console.error(err);
    });
  };

  deleteSelectedPhotos = () => {
    this.state.photoList.filter(photo => photo.isSelected).forEach(photo => this.deletePhoto(photo.uri));
    this.getPhotoList();
  };

  deletePhoto = uri => {
    this.acm.request("/photo/" + uri, {
      method: 'DELETE'
    })
      .then(res => this.getPhotoList())
      .catch(res => console.error(res));
  };

  /* TODO: make the upload button a separate component
     TODO: add an actual upload button and not automatically upload
   */

  uploadPhoto = (evt) => {
    this.setState({uploadTotal : this.state.uploadTotal+evt.target.files.length});
    Array.from(evt.target.files).forEach(file =>
      this.acm.request(`/photo/${file.name}`, {
        method: 'PUT',
        mode: 'cors',
        body: file,
        headers: { 'Access-Control-Request-Method': 'PUT' }
      }).then(res => {
        this.setState({uploadCount: this.state.uploadCount+1});
        if(this.state.uploadCount === this.state.uploadTotal) {
          this.setState({uploadTotal: 0});
        }
        this.getPhotoList();
      }).catch(err => {
        console.log(err)
      }));
  };

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.getPhotoList}/>);

    // how to show an image
    // const photoJsx = (photo, index) => (
    //   <li key={photo.uri}>
    //     <input type="checkbox" id={"ph" + index}
    //            checked={photo.selected}
    //            onChange={evt => {
    //              // act like checkbox in select mode
    //              this.setState({
    //                photoList: this.state.photoList.map((p, i) =>
    //                  i !== index ? p : {...p, selected: evt.target.checked}
    //                )
    //              });
    //            }}
    //            disabled={!this.isSelect && !this.state.isSelected}/>
    //     <label htmlFor={"ph" + index}
    //            onClick={() => {
    //              // act like link in non-select mode
    //              if(!this.isSelect && !this.state.isSelected)
    //                this.history.push(`/photo/${photo.uri}`)
    //            }}>
    //     </label>
    //   </li>
    // );

    const selectedPhotos = this.state.photoList.filter(photo => photo.isSelected);

    return (
      <div className="Photos">
        {/* file upload modal */}
        <Modal isOpen={this.state.uploadModal} toggle={this.toggleUploadModal}>
          <ModalHeader toggle={this.toggleUploadModal}>
            Upload photos
          </ModalHeader>
          <ModalBody>
            {/* progress bar */}
            {this.state.uploadTotal
              ? (<Progress animated color="success" value={this.state.uploadCount/this.state.uploadTotal * 100} />)
              : ""}

            {/* file upload input */}
            <div className="custom-file">
              <input className="custom-file-input"
                     id="customFile"
                     type="file"
                     onChange={this.uploadPhoto}
                     multiple/>
              <label className="custom-file-label" htmlFor="customFile">Upload...</label>
            </div>
          </ModalBody>
        </Modal>

        {/* control buttons go here */}
        <Jumbotron fluid style={{marginBottom: 2}} className={this.state.isSelectMode ? 'bg-dark text-light' : ''}>
          <Container>
            <div className="custom-file">
              <h1 className={'display-1'}>{this.state.isSelectMode ? 'Select' : 'Your' } photos</h1>
              <div>
                {/* upload button always displays */}
                <Button outline
                        className={'m-2'}
                        color={'primary'}
                        onClick={this.toggleUploadModal}
                        title={'Upload photos'}>
                  <FontAwesomeIcon icon={faFileUpload} />
                </Button>
                {/* confirm selection button shows when a select component */}
                {
                  this.state.isSelectComponent && (
                    <Button outline
                            className={'m-2'}
                            color={'success'}
                            title={'Confirm selection'}
                            onClick={this.confirmPhotoSelection}>
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                  )
                }
                {/* select button displays when not a select component */}
                {
                  !this.state.isSelectComponent && (
                    <Button outline
                            className={'m-2'}
                            color={'info'}
                            title={'Toggle selection mode'}
                            onClick={() => this.setState({isSelectMode: !this.state.isSelectMode})}>
                      <FontAwesomeIcon icon={faObjectUngroup} />
                    </Button>
                  )
                }
                {/* delete button only shows when selecting and not a select component */}
                {
                  this.state.isSelectMode && !this.state.isSelectComponent && (
                    <Button outline
                            className={'m-2'}
                            color={'danger'}
                            title={'Delete selected photos'}
                            onClick={this.deleteSelectedPhotos}
                            disabled={selectedPhotos.length===0}>
                      <FontAwesomeIcon icon={faBan} />
                    </Button>
                  )
                }
                <span>{!this.state.isSelectMode || selectedPhotos.length===0 ? '' : selectedPhotos.length + ' selected photos'}</span>
              </div>
            </div>
          </Container>
        </Jumbotron>

        {/* displaying the actual photos */}
        <PhotoSelectorList photoList={this.state.photoList}
                           selectEnabled={this.state.isSelectMode}
                           onSelectedChange={photoList => this.setState({photoList: photoList})} />
      </div>

      //   <Container>
      //     <Row>
      //       <Col>
      //         <div className ="select">
      //           <Button color="success" className={this.state.isSelected ? "ButtonOn" : ''}
      //               onClick={
      //                 () => {
      //                   this.state.isSelected && this.state.photoList.forEach((photo) => photo.selected = false);
      //                   this.setState({isSelected: !this.state.isSelected});
      //                 }
      //               }>
      //             {this.state.isSelected ? "Cancel" : "Select Photos"}
      //           </Button> &nbsp;&nbsp; &nbsp;
      //
      //           {!this.isSelect && this.state.isSelected && <Button color="success" onClick={this.deleteSelectedPhotos}>Delete Photos</Button>}
      //           {
      //             // for when used as selection component
      //             this.isSelect && (<Button color="success" onClick={this.confirmPhotoSelection}>Upload</Button>)
      //           }
      //         </div>
      //       </Col>
      //       <Col>
      //         <div className="custom-file">
      //           <input className="custom-file-input"
      //                id="customFile"
      //                type="file"
      //                onChange={this.uploadPhoto}
      //                multiple/>
      //           <label className="custom-file-label" htmlFor="customFile">Upload file</label>
      //         </div>
      //       </Col>
      //     </Row>
      //     <br/>
      //     <Row>
      //       <Col>
      //         <div>
      //           {this.state.uploadTotal ? (<Progress animated color="success"
      //                            value={this.state.uploadCount/this.state.uploadTotal * 100} />) : ""}
      //         </div>
      //       </Col>
      //     </Row>
      //     <br/>
      //     {
      //       // listing images -- fun code is here.
      //       this.state.isSelected ? <Gallery photos={this.state.photoList}/> : <Gallery photos={this.state.photoList}/>
      //       // this.state.photoList.map((photo, index) => {
      //       //   photoJsx(photo, index);
      //       //   console.log(photo);
      //       // })
      //     }
      //   </Container>
      //
      //
      //
      //
      // </div>
    );
  };
}


Photos.propTypes = {
  onSelect: PropTypes.func
};

Photos.defaultProps = {
  onSelect: null
};

const mapStateToProps = state => ({
  username: state.user.username
});
export default withRouter(connect(mapStateToProps)(Photos));