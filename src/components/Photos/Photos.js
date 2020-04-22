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
      isSelected: false,
    };

  }

  componentDidMount() {
    this.getPhotoList();
  }

  render = () => {

    const selectPhotos = (photo, index) => (
        <li><input type="checkbox" id={"ph" + index}
                   checked={photo.selected}
                   onChange={(evt) => this.setState({
                     photoList : this.state.photoList.map((p,i) =>
                       i!=index ? p : {...p,selected:evt.target.checked}
                     )
                   })} />
          <label for={"ph" + index}>
            <img className="photos" src={`${env.serverUrl}/perma/${photo.uri}`}/>
          </label>
        </li>
    );

    const notSelectPhotos = (photo) => (
      <span key={photo.uri}>
          <Link to={"/photo/" + photo.uri}>
            <img className="photos" src={`${env.serverUrl}/perma/${photo.uri}`}/>
          </Link>
      </span>
    );

    return (<div className="Photos">
      Photos Component
      <input className="Buttons"
             type="file"
             onChange={this.uploadPhoto}
             multiple
      />
      <button
        onClick={() => {
          if(this.state.isSelected === true) {
            this.state.photoList.forEach((photo) => photo.selected = false)
          }
          this.setState({isSelected: !this.state.isSelected});
        }}
        className={this.state.isSelected && "ButtonOn"}>
        Select Photos
      </button>
      {this.state.isSelected && <button onClick={this.deleteSelectedPhotos}>Delete Photos</button>}
      <br/>

      {this.state.photoList.map((photo, index) =>
        this.state.isSelected === true ? selectPhotos(photo, index) : notSelectPhotos(photo)
      )}
    </div>
    );
  };

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({ photoList: res.response.map(photo => ({
        ...photo,selected:false,
      }) ) });
    }).catch(err => {
      console.error(err);
    });
  };

  deleteSelectedPhotos = () => {
    this.state.photoList.forEach((photo) => {
      if (photo.selected == true) {
        this.deletePhoto(photo.uri);
      }
    })
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
