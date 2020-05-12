import React from 'react';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
import { Button, Row, Col, Form, FormGroup, Label, Container, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ApiConnectionManager from "../../util/ApiConnectionManager";


class Photo extends React.Component {
  constructor(props) {
    super(props);
    // get params from uri
    const {photouri} = props.match.params;
    this.acm = new ApiConnectionManager();

    this.state = {
      photouri,
      photo: {
        filename: '',
        uploadDate: '',
        caption: '',
        uri: ''
      }
    };
  }

  render = () => {
    return (
        <div className={'Photo'}>
          <Link to='/photos'>
            <Button color="info" >Go back</Button>
          </Link>
          <div className='fill-screen'>
            <img className="photo333" src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}/>
          </div>
        </div>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
