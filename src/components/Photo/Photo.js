import React from 'react';
import './Photo.css';
import {Link} from 'react-router-dom';
import {
  Button,
  Card,
  Container,
  CardBody,
  CardText,
  CardImg,
  Table,
  ModalBody,
  ModalHeader,
  Modal,
  Form, FormGroup, Label, Input, ModalFooter, FormFeedback
} from 'reactstrap';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import {withRouter, Route} from "react-router-dom";
import {faArrowCircleLeft, faDownload, faEdit} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux";
import {ToastChef, Toaster} from "../../util/Toaster"; // https://slate.com/technology/2014/04/charles-o-rear-is-the-photographer-who-took-the-windows-xp-wallpaper-photo-in-napa-valley.html
class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.acm = new ApiConnectionManager();
    this.goBack = this.goBack.bind(this);
    this.addToast = ToastChef.getAddToastFunction(this);

    this.state = {
      photouri,
      captionError: {},
      fileNameError: {},
      toasts: [],
      photo: {
        filename: '',
        uploadDate: new Date(),
        caption: '',
        uri: '',
        metadata: {
          mimeType: '',
          exposureTime: -1,
          fNumber: -1,
          iso: -1,
          width: -1,
          height: -1,
          captureDate: new Date()
        }
      },
      isEditing: false
    };
  }

  goBack() {
    this.props.history.goBack();
  }

  getPhoto = () => {
    this.acm.request(`/perma/${this.state.photouri}/details`)
      .then(res => {
        this.setState({
          photo: res.response,
          captionError: {}
        });
        console.log(res.response);
      })
      .catch(res => {
        const error = res.response.error;
        console.log(error);
        const details = res.response.details;
        console.log(details);
      });
  };

  componentDidMount = () => {
    this.getPhoto();
  };

  toggleEditModal = () => this.setState({isEditing: !this.state.isEditing});

  saveChanges = () => {
    this.acm.request(`/photo/${this.state.photouri}/update`, {
      method: 'POST',
      body: JSON.stringify({
        caption: this.state.photo.caption,
        filename: this.state.photo.filename
      })
    })
      .then(res => {
        console.log(res.response);
        this.addToast('', 'Changes successfully saved', 'success');

      })
      .catch(res => {
        const error = res.response.error;
        const details = res.response.details;
        console.log(error);
        this.addToast('Error', error + ' ' + details, 'warning');
        switch(error){
          case 'INPUT_FORMAT_ERROR':
            break;
          default:
            this.setState({captionError: {caption: `Error: "${error}". Please contact the devs for more info.`}});
            return;
        }
        console.log(res.response);
        console.log(details);
        switch(details){
          case 'CAPTION_LENGTH':
            this.setState({captionError: {caption: 'Caption is too long'}});
            break;
          case 'FILENAME_MISSING':
            this.setState({fileNameError: {filename: 'Filename missing'}});
            break;
          case 'FILENAME_LENGTH':
            this.setState({fileNameError: {filename: 'Filename word limit is exceeded'}});
            break;
          case 'INVALID_FILNAME':
            this.setState({fileNameError: {filename: 'Invalid filename'}});
            break;
          default:
        }
      });
  };
  cancelChanges = () => {
    this.toggleEditModal();
    this.getPhoto();
  };

  render = () => {
    const editModal = (
      <Modal isOpen={this.state.isEditing} toggle={this.cancelChanges}>
        <ModalHeader toggle={this.cancelChanges}>
          Edit photo
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label htmlFor={'edit-caption'}>Caption</Label>
              <Input value={this.state.photo.caption}
                     id={'edit-caption'}
                     onChange={evt => this.setState({photo: {...this.state.photo, caption: evt.target.value}})}
                     placeholder={'Describe your photo here!'}
                     invalid={!!this.state.captionError.caption}/>
              <FormFeedback>
                {this.state.captionError.caption}
              </FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label htmlFor={'edit-filename'}>Filename</Label>
              <Input value={this.state.photo.filename}
                     id={'edit-filename'}
                     onChange={evt => this.setState({photo: {...this.state.photo, filename: evt.target.value}})}
                     invalid={!!this.state.fileNameError.filename}/>
              <FormFeedback>
                {this.state.fileNameError.filename}
              </FormFeedback>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color={'secondary'} outline onClick={this.cancelChanges}>Cancel changes</Button>
          <Button color={'success'} outline onClick={this.saveChanges}>Save changes</Button>
        </ModalFooter>
      </Modal>
    );

    return (
      <div className={'Photo'}>
        {editModal}
        <Container>
          <div className={'my-3'}>
            <Button outline color="info" className={'m-2'} onClick = {this.goBack}><FontAwesomeIcon icon={faArrowCircleLeft} /> Go back</Button>
            <Button outline color="info" href={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}/download/${this.state.photo.filename}`}
                    download
                    className={'m-2'} ><FontAwesomeIcon icon={faDownload} /> Download</Button>
            {
              this.props.username && this.props.username===this.state.photo.ownerUsername &&
              <Button outline color={'info'} className={'m-2'} onClick={this.toggleEditModal}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </Button>
            }
          </div>
          <div>
            <Card class={'mb-5'}>
              <CardImg
                   src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}
                   alt={this.state.photo.filename}/>
                  <Table>
                    <tbody>
                    <tr>
                      <th>Owner</th>
                      <td>{this.state.photo.ownerUsername}</td>
                    </tr>
                    <tr>
                      <th> Filename</th>
                      <td>{this.state.photo.filename} </td>
                    </tr>
                    {this.state.photo.caption &&
                    <tr>
                      <th>Caption</th>
                      <td>{this.state.photo.caption}</td>
                    </tr>
                    }
                    {this.state.photo.uploadDate === undefined &&
                    <tr>
                      <th>Upload Date</th>
                      <td>{this.state.photo.uploadDate}</td>
                    </tr>
                    }
                    <tr>
                      <th> Height</th>
                      <td>{this.state.photo.metadata.height}</td>
                    </tr>
                    <tr>
                      <th>Width</th>
                      <td>{this.state.photo.metadata.width}</td>
                    </tr>
                    <tr>
                      <th>Mime Type</th>
                      <td>{this.state.photo.metadata.mimeType}</td>
                    </tr>
                    {this.state.photo.metadata.exposureTime === undefined &&
                    <tr>
                      <th>Exposure Time</th>
                      <td>{this.state.photo.metadata.exposureTime}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.fNumber === undefined &&
                    <tr>
                      <th>Fnumber</th>
                      <td>{this.state.photo.metadata.fNumber}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.iso === undefined &&
                    <tr>
                      <th>Iso</th>
                      <td>{this.state.photo.metadata.iso}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.captureDate === 0 &&
                    <tr>
                      <th>Iso</th>
                      <td>{this.state.photo.metadata.captureDate.toLocaleTimeString()}</td>
                    </tr>
                    }
                    </tbody>
                  </Table>
            </Card>
          </div>
        </Container>
      </div>
    );
  }
}

Photo.propTypes = {};
Photo.defaultProps = {};

const mapStateToProps = state => ({
  username: state.user.username
});

export default connect(mapStateToProps)(withRouter(Photo));
