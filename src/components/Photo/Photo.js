import React from 'react';
import PropTypes from 'prop-types';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
import {env} from "../../util/Environment";

class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.state = {
      photouri,
    };
  }

  render = () => {
    return (<div>
      <Link to='/photos'>Return to list of photos.</Link>
      <div class='fill-screen'><img className="photo333" src={`${env.serverUrl}/perma/${this.state.photouri}`}/></div>
    </div>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
