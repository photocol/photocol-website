import React from 'react';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
import {Button} from "reactstrap";

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
      <Link to='/photos'>
        <Button color="success">Return to Photos</Button>
      </Link>
      <div class='fill-screen'><img className="photo333" src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}/></div>
    </div>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
