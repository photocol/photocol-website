import React from 'react';
import './Photo.css';
import {Link, withRouter} from 'react-router-dom';
import { Button, Card, Container, CardBody, CardText } from 'reactstrap';
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
        uploadDate: new Date(),
        caption: '',
        uri: '',
        metadata: {
          mimeType: '',
          exposureTime: -1,
          fNumber: -1,
          iso: -1,
          width: -1,
          height: -1,
          captureDate: new Date()
        }
      }
    };
  }
    componentDidMount = () => {
        this.acm.request(`/photo/${this.state.photouri}/details`, {
            method: 'POST'
        })
            .then(res => {
              this.setState({ photo: res.response });
                console.log(res.response);
            })
            .catch(err => {
                console.log(err);
             //   console.error(err.response.error);
            })
    };
  render = () => {
      return (
        <div className={'Photo'}>
          <Container >
            <br/>
            <Link to='/photos'>
              <Button outline color="info" className={'m-2'} >Go back</Button>
            </Link>
            <Button outline color="info" href={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}/${this.state.photo.filename}`}
                    download
                    className={'m-2'} > Download</Button>
            <br/>
            <br/>
            <div>
              <img className="photo333"
                   src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}
                   alt={this.state.photo.filename}/>
              <Card>
                <CardBody>
                  <CardText>
                    Filename: {this.state.photo.filename} <br/>
                    Caption: {this.state.photo.caption}<br/>
                    {this.state.photo.uploadDate === undefined
                      ? 'Upload Date:'+ this.state.photo.uploadDate.toLocaleTimeString()
                      : ''
                    }
                  </CardText>
                  <CardText>
                    Metadata: <br/>
                    Width: {this.state.photo.metadata.width} <br/>
                    Height: {this.state.photo.metadata.height} <br/>
                    Mime Type: {this.state.photo.metadata.mimeType} <br/>
                    {this.state.photo.metadata.exposureTime === undefined
                      ? 'Exposure Time: '+ this.state.photo.metadata.exposureTime
                      : ''
                    }<br/>
                    {this.state.photo.metadata.fNumber === undefined
                      ? 'FNumber: '+ this.state.photo.metadata.fNumber
                      : ''
                    }<br/>
                    {this.state.photo.metadata.iso === undefined
                      ? 'Iso: '+ this.state.photo.metadata.iso
                      : ''
                    }<br/>
                    {this.state.photo.metadata.captureDate === undefined
                      ? 'Capture Date:'+ this.state.photo.metadata.captureDate.toLocaleTimeString()
                      : ''
                    }
                  </CardText>
                </CardBody>
              </Card>
            </div>
          </Container>
        </div>);
  }
};


Photo.propTypes = {};

Photo.defaultProps = {};

export default withRouter(Photo);
