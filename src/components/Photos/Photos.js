import React from 'react';
import PropTypes from 'prop-types';
import './Photos.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import store from "../../util/Store";
import {Link, withRouter} from "react-router-dom"
import { env } from "../../util/Environment";
import {connect} from "react-redux";
import Authenticator from "../Authenticator/Authenticator";

class Photos extends React.Component {
  constructor(props) {
    super(props);
    this.acm = new ApiConnectionManager();
    this.state = {
      photoList: [],
      isSelected: false,
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
          <img className="photos" src={`${env.serverUrl}/perma/${photo.uri}`}/>
        </label>
      </li>
    );

    return (
      <div className="Photos">
        Photos Component
        <input className="Buttons"
               type="file"
               onChange={this.uploadPhoto}
               multiple />
        <button className={this.state.isSelected ? "ButtonOn" : ''}
                onClick={
                  () => {
                    this.state.isSelected && this.state.photoList.forEach((photo) => photo.selected = false);
                    this.setState({isSelected: !this.state.isSelected});
                  }
                }>
          Select Photos
        </button>
        {!this.isSelect && this.state.isSelected && <button onClick={this.deleteSelectedPhotos}>Delete Photos</button>}
        <br/>

        {
          // listing images
          this.state.photoList.map((photo, index) => photoJsx(photo, index))
        }
        {
          // for when used as selection component
          this.isSelect && (<button onClick={this.confirmPhotoSelection}>Select these photos</button>)
        }
      </div>
    );
  };

  getPhotoList = () => {
    this.acm.request('/photo/currentuser').then(res => {
      this.setState({
        photoList: res.response.map(photo => ({
          ...photo,
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
