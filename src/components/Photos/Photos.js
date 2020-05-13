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
import {faBan, faCheck, faCheckSquare, faFileUpload} from '@fortawesome/free-solid-svg-icons';
import {ToastChef, Toaster} from "../../util/Toaster";

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
      isSelectComponent: !!props.onSelect,
      toasts: []
    };

    this.history = props.history;

    // if used as selection component
    // state.isSelected is used as temporary select (if component), isSelect is used if only used for selecting photos
    this.isSelect = props.onSelect !== null;
    this.isSelect && (this.onSelect = props.onSelect);
  }

  addToast = ToastChef.getAddToastFunction(this);

  componentDidMount = () => {
    this.getPhotoList();
  };

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

  uploadPhoto = (evt) => {
    this.setState({uploadTotal : this.state.uploadTotal+evt.target.files.length});
    Array.from(evt.target.files).forEach(file =>
      this.acm.request(`/photo/${file.name}`, {
        method: 'PUT',
        mode: 'cors',
        body: file,
        headers: { 'Access-Control-Request-Method': 'PUT' }
      }).then(res => {
        this.setState({
          uploadCount: this.state.uploadCount+1
        }, () => {
          if(this.state.uploadCount === this.state.uploadTotal) {
            this.setState({uploadTotal: 0});
            this.addToast('', 'Finished uploading photos.', 'info');
            this.toggleUploadModal();
          }
        });
        this.getPhotoList();
      }).catch(err => {
        const error = err.response.error;
        const details = err.response.details;
        switch (error) {
          case 'INPUT_FORMAT_ERROR':
            if(details.split(' ')[0]==='IMAGE_FORMAT_ERROR')
              this.addToast('Error', `${details.split(' ')[1]} upload failed: not an image.`, 'danger');
            else
              this.addToast('', error + ' ' + details, 'danger');
            break;
          default:
            this.addToast('', error, 'danger');
        }

        this.setState({
          uploadCount: this.state.uploadCount+1
        }, () => {
          if(this.state.uploadCount === this.state.uploadTotal) {
            this.setState({uploadTotal: 0});
            this.addToast('', 'Finished uploading photos.', 'info');
            this.toggleUploadModal();
          }
        });
      }));
  };

  toggleSelectAll = () => {
    // if any not selected, select all
    const unSelected = this.state.photoList.find(photo => !photo.isSelected);
    if(unSelected!==undefined) {
      this.setState({
        photoList: this.state.photoList.map(photo => ({...photo, isSelected: true}))
      });
      return;
    }

    // else all selected, so unselect all
    this.setState({
      photoList: this.state.photoList.map(photo => ({...photo, isSelected: false}))
    });
  };

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.getPhotoList} promptText={'Authenticate to see your photos'} />);

    const selectedPhotos = this.state.photoList.filter(photo => photo.isSelected);

    return (
      <div className="Photos">
        <Toaster toasts={this.state.toasts} onRemoveToast={ToastChef.getRemoveToastFunction(this)} />

        {/* file upload modal */}
        <Modal isOpen={this.state.uploadModal} toggle={this.toggleUploadModal}>
          <ModalHeader toggle={this.toggleUploadModal}>
            Upload photos
          </ModalHeader>
          <ModalBody>
            {/* progress bar */}
            {this.state.uploadTotal
              ? (<Progress animated
                           color="primary"
                           value={this.state.uploadCount/this.state.uploadTotal * 100}
                           className={'mb-3'} />)
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
                  <FontAwesomeIcon fw icon={faFileUpload} /> Upload
                </Button>
                {/* confirm selection button shows when a select component */}
                {
                  this.state.isSelectComponent && (
                    <Button outline
                            className={'m-2'}
                            color={'success'}
                            title={'Confirm selection'}
                            onClick={this.confirmPhotoSelection}>
                      <FontAwesomeIcon fw icon={faCheck} />
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
                      <FontAwesomeIcon fw icon={faCheck} /> Select
                    </Button>
                  )
                }
                {/* select all button shows when selecting */}
                {
                  this.state.isSelectMode && (
                    <Button outline
                            className={'m-2'}
                            color={'warning'}
                            title={'Select all'}
                            onClick={this.toggleSelectAll}>
                      <FontAwesomeIcon fw icon={faCheckSquare} /> Select All
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
                      <FontAwesomeIcon fw icon={faBan} /> Delete
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

        {/* if no images */}
        {this.state.photoList.length===0 && (
          <Container className={'mt-3'}>
            <p>You have no photos here! Get started by clicking the upload button in blue.</p>
          </Container>
        )}
      </div>
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