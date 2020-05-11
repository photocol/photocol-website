import React from 'react';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
import {Button} from "reactstrap";
import ApiConnectionManager from "../../util/ApiConnectionManager";

class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.state = {
      photouri,
    };

    this.acm = new ApiConnectionManager();
  }

  componentDidMount = () => {
    this.acm.request(`/photo/${this.state.photouri}/details`, {
      method: 'POST'
    })
      .then(res => {
        console.log(res.response);
      })
      .catch(err => {
        console.error(err.response.error);
      })
  };

  render = () => {
    return (<div>
      <Link to='/photos'>
        <Button color="success">Return to Photos</Button>
      </Link>
      <div class='fill-screen'><img className="photo333" src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}/></div>
    </div>);
  };
}


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
