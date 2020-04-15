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
        <Link to={"/photo/" + photo.uri} key={photo.uri}>
          <img className="photo"
               src={`${env.serverUrl}/perma/${photo.uri}`} />
        </Link>
      ))}
    </div>
  );

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      console.log(res);
      if(res.status != 'STATUS_OK') return;
      this.setState({photoList: res.payload});
    }).catch(err => {
      console.log(err);
    });
  };

  /* TODO: make the upload button a separate component
     TODO: add an actual upload button and not automatically upload
   */

  uploadPhoto = (evt) => {
    console.log(evt.target.files);
    Array.from(evt.target.files).forEach(file => {
      console.log(file.stream());
        this.acm.request(`/photo/${file.name}/upload`, {
          method: 'PUT',
          mode: 'cors',
          body: file,
          headers: { 'Access-Control-Request-Method': 'PUT' }
        }).then(res => {
          console.log(res);
          this.getPhotoList();
        }).catch(err => {
          console.log(err)
        });
    })
  };
}


Photos.propTypes = {};

Photos.defaultProps = {};

export default Photos;
