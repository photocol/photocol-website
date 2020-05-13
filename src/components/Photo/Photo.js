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
  Form, FormGroup, Label, Input, ModalFooter
} from 'reactstrap';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import {withRouter, Route} from "react-router-dom";
import {faArrowCircleLeft, faDownload, faEdit} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux"; // https://slate.com/technology/2014/04/charles-o-rear-is-the-photographer-who-took-the-windows-xp-wallpaper-photo-in-napa-valley.html
class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.acm = new ApiConnectionManager();
    this.goBack = this.goBack.bind(this);
    this.state = {
      photouri,
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
        this.setState({ photo: res.response });
        console.log(res.response);
      })
      .catch(res => {
        const error = res.response.error;
        console.log(error);
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
      })
      .catch(err => {
        console.log(err.response.error);
      })
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
                     placeholder={'Describe your photo here!'} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor={'edit-filename'}>Filename</Label>
              <Input value={this.state.photo.filename}
                     id={'edit-filename'}
                     onChange={evt => this.setState({photo: {...this.state.photo, filename: evt.target.value}})} />
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
