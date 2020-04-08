import React from 'react';
import PropTypes from 'prop-types';
import './Photos.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import store from "../../util/Store";
import {Link} from "react-router-dom"

/*
const Photos = () => (
  <div className="Photos">
    Photos Component
    <button className="Buttons">
      Upload
    </button>
  </div>
);
*/

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
        <a href={"http://localhost:4567/image/" + photo.uri}
           target="_blank"
        >
        <img key={photo.uri}
               className="photo"
               src={"http://localhost:4567/image/" + photo.uri}
          />
        </a>
        )
      )
      }
    </div>
  );

  // renderImage = () => {
  //   return (
  //     this.photoList().map(image => {
  //
  //       }
  //     )
  //   )
  // };

  getPhotoList = () => {
    this.acm.request('/userphotos').then(res => {
      console.log(res);
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
        this.acm.request(`/image/${file.name}/upload`, {
          method: 'PUT',
          mode: 'cors',
          body: file,
          headers: new Headers({
            //'Content-Type':'image/jpg',
            'Access-Control-Request-Method': 'PUT'
          })
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
