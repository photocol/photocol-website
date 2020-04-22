import React from 'react';
import PropTypes from 'prop-types';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
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
    return (<div>
      <Link to='/photos'>Return to list of photos.</Link>
      <img className="photo" src={`${env.serverUrl}/perma/${this.state.photouri}`}/>
    </div>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
