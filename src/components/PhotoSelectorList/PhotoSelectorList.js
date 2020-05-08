import React from 'react';
import PropTypes from 'prop-types';
import './PhotoSelectorList.css';
import SelectedImage from "./SelectedImage";
import Gallery from 'react-photo-gallery';
import { env } from "../../util/Environment";

class PhotoSelectorList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      photoList: props.photoList
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      photoList: nextProps.photoList.map(photo => ({
        src: `${env.serverUrl}/perma/${photo.uri}`,
        width: photo.metadata.width,
        height: photo.metadata.height
      }))
    });
  }

  // this calls onChange with the selected photos
  changeHandler = () => {
    this.props.onSelectedChange(this.state.photoList
      .map((photo, index) => photo.isSelected ? index : -1)
      .filter(index => index>=0));
  };

  setSelected = (index, value) => {
    this.setState({
      photoList: this.state.photoList.map((photo, i) => i === index ? {...photo, isSelected: value} : photo)
    }, this.changeHandler);
  };

  selectedImageRenderer = ({index, left, top, key, photo}) => (
    <SelectedImage selected={this.state.photoList[index].isSelected}
                   key={key}
                   margin={'2px'}
                   index={index}
                   photo={photo}
                   left={left}
                   top={top}
                   onChange={this.setSelected} />
  );

  render = () => <Gallery photos={this.state.photoList} renderImage={this.selectedImageRenderer} />;

}

PhotoSelectorList.propTypes = {
  photoList: PropTypes.arrayOf(PropTypes.object),
  onSelectedChange: PropTypes.func
};

PhotoSelectorList.defaultProps = {
  // FOR TESTING ONLY; always specify photoList manually
  photoList: [
    { src: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg', width: 546, height: 340, isSelected: false },
    { src: 'https://imagekit.io/static/img/newPages/homepage-wave-bg.svg', width: 1440, height: 861, isSelected: false },
    { src: 'https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png', width: 780, height: 460, isSelected: false },
    { src: 'https://www.w3schools.com/w3css/img_lights.jpg', width: 600, height: 400, isSelected: false },
    { src: 'https://s.ftcdn.net/v2013/pics/all/curated/RKyaEDwp8J7JKeZWQPuOVWvkUjGQfpCx_cover_580.jpg?r=1a0fc22192d0c808b8bb2b9bcfbf4a45b1793687', width: 580, height: 435, isSelected: false },
    { src: 'https://helpx.adobe.com/content/dam/help/en/stock/how-to/visual-reverse-image-search/jcr_content/main-pars/image/visual-reverse-image-search-v2_intro.jpg', width: 1000, height: 560, isSelected: false },
    { src: 'https://image.freepik.com/free-photo/image-human-brain_99433-298.jpg', width: 626, height: 417, isSelected: false }
  ],
  onSelectedChange: () => {}
};

export default PhotoSelectorList;