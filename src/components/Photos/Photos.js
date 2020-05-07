import React from 'react';
import PropTypes from 'prop-types';
import './Photos.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import store from "../../util/Store";
import {Link, withRouter} from "react-router-dom"
import { env } from "../../util/Environment";
import {connect} from "react-redux";
import Authenticator from "../Authenticator/Authenticator";
import { CardBody, CardImg, CardTitle, Button, CardText, Row, Col, Form, FormGroup, Label, Input, Jumbotron, Container, Card } from 'reactstrap';
import { Progress } from 'reactstrap';
import Gallery from "react-photo-gallery";


class Photos extends React.Component {
  constructor(props) {
    super(props);
    this.acm = new ApiConnectionManager();
    this.state = {
      photoList: [],
      isSelected: false,
      uploadCount: 0,
      uploadTotal: 0,
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
    this.onSelect(this.state.photoList.filter(photo => photo.selected));
  };

  render = () => {
    if(this.props.username==='not logged in')
      return (<Authenticator onUserAction={this.getPhotoList}/>);

    // how to show an image
    const photoJsx = (photo, index) => (
      <li key={photo.uri}>
        <input type="checkbox" id={"ph" + index}
             checked={photo.selected}
             onChange={evt => {
               // act like checkbox in select mode
               this.setState({
                 photoList: this.state.photoList.map((p, i) =>
                   i !== index ? p : {...p, selected: evt.target.checked}
                 )
               });
             }}
             disabled={!this.isSelect && !this.state.isSelected}/>
        <label htmlFor={"ph" + index}
             onClick={() => {
               // act like link in non-select mode
               if(!this.isSelect && !this.state.isSelected)
                 this.history.push(`/photo/${photo.uri}`)
             }}>
        </label>
      </li>
    );

    return (
      <div className="Photos">
        <Container>
          <Row>
            <Col>
              <div className ="select">
                <Button color="success" className={this.state.isSelected ? "ButtonOn" : ''}
                    onClick={
                      () => {
                        this.state.isSelected && this.state.photoList.forEach((photo) => photo.selected = false);
                        this.setState({isSelected: !this.state.isSelected});
                      }
                    }>
                  {this.state.isSelected ? "Cancel" : "Select Photos"}
                </Button> &nbsp;&nbsp; &nbsp;

                {!this.isSelect && this.state.isSelected && <Button color="success" onClick={this.deleteSelectedPhotos}>Delete Photos</Button>}
                {
                  // for when used as selection component
                  this.isSelect && (<Button color="success" onClick={this.confirmPhotoSelection}>Upload</Button>)
                }
              </div>
            </Col>
            <Col>
              <div className="custom-file">
                <input className="custom-file-input"
                     id="customFile"
                     type="file"
                     onChange={this.uploadPhoto}
                     multiple/>
                <label className="custom-file-label" htmlFor="customFile">Upload file</label>
              </div>
            </Col>
          </Row>
          <br/>
          <Row>
            <Col>
              <div>
                {this.state.uploadTotal ? (<Progress animated color="success"
                                 value={this.state.uploadCount/this.state.uploadTotal * 100} />) : ""}
              </div>
            </Col>
          </Row>
          <br/>
          {
            // listing images -- fun code is here.
            this.state.isSelected ? <Gallery photos={this.state.photoList}/> : <Gallery photos={this.state.photoList}/>
            // this.state.photoList.map((photo, index) => {
            //   photoJsx(photo, index);
            //   console.log(photo);
            // })
          }
        </Container>




      </div>
    );
  };




  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({
        photoList: res.response.map(photo => ({
          ...photo,
          src: `${env.serverUrl}/perma/${photo.uri}`,
          width: 3,
          height: 2,
          selected: false,
        }))
      });
    }).catch(err => {
      console.error(err);
    });
  };

  deleteSelectedPhotos = () => {
    this.state.photoList.forEach((photo) => {
      photo.selected && this.deletePhoto(photo.uri);
    });
    this.setState({isSelected : false})
  };

  deletePhoto = uri => {
    console.log(uri);
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
        //console.log("Uploaded Photos: " + this.state.uploadCount);
        //console.log("Upload Total: " + this.state.uploadTotal);
        this.getPhotoList();
      }).catch(err => {
        console.log(err)
      }));
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