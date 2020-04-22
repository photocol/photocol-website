import React from 'react';
import PropTypes from 'prop-types';
import './Photo.css';
import { withRouter } from 'react-router-dom';
import {env} from "../../util/Environment";
//import CollectionManager from "../../util/CollectionManager";

/*
const Photo = () => (

    <div className="Photo">
      Photo Component
    </div>
);
*/


class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.state = {
      photouri,
    };
  }

  // putting this in componentDidMount() hook to be able to call setState properly
  componentDidMount() {
  }

  render = () => {
    return (<img className="photo" src={`${env.serverUrl}/perma/${this.state.photouri}`}/>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
