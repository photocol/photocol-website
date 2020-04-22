import React from 'react';
import PropTypes from 'prop-types';
import './Photos.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import store from "../../util/Store";
import { Link } from "react-router-dom"
import { env } from "../../util/Environment";

class Photos extends React.Component {
  constructor(props) {
    super(props);
    this.acm = new ApiConnectionManager();
    this.state = {
      photoList: [],
    };
  }

  componentDidMount() {
    this.getPhotoList();
  }

  render = () => (
    <div className="Photos">
      Photos Component
      <input className="Buttons"
             type="file"
             onChange={this.uploadPhoto}
             multiple
      /><br/>
      {this.state.photoList.map(photo => (
        <div key={photo.uri}>
          <Link to={"/photo/" + photo.uri}>
            <img className="photo" src={`${env.serverUrl}/perma/${photo.uri}`} />
          </Link>
          <button onClick={() => this.deletePhoto(photo.uri)}>Delete</button>
        </div>
        ))}
    </div>
  );

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({ photoList: res.response });
    }).catch(err => {
      console.error(err);
    });
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
    Array.from(evt.target.files).forEach(file =>
      this.acm.request(`/photo/${file.name}`, {
        method: 'PUT',
        mode: 'cors',
        body: file,
        headers: { 'Access-Control-Request-Method': 'PUT' }
      }).then(res => {
        this.getPhotoList();
      }).catch(err => {
        console.log(err)
      }));
  };
}

Photos.propTypes = {};

Photos.defaultProps = {};

export default Photos;
