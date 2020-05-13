import React from 'react';
import './Photo.css';
import {Link} from 'react-router-dom';
import { Button, Card, Container, CardBody, CardText, CardImg, Table} from 'reactstrap';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import {withRouter, Route} from "react-router-dom"; // https://slate.com/technology/2014/04/charles-o-rear-is-the-photographer-who-took-the-windows-xp-wallpaper-photo-in-napa-valley.html
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
    this.acm.request(`/perma/${this.state.photouri}/details`)
      .then(res => {
        this.setState({ photo: res.response });
        this.props.history.push()
        console.log(res.response);
      })
      .catch(res => {
        const error = res.response.error;
        console.log(error);
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
          <Button outline color="info" href={`${process.env.REACT_APP_SERVER_URL}/perma/download/${this.state.photouri}/${this.state.photo.filename}`}
                  download
                  className={'m-2'} > Download</Button>
          <br/>
          <br/>
          <div>
            <Card>
              <CardImg
                   src={`${process.env.REACT_APP_SERVER_URL}/perma/${this.state.photouri}`}
                   alt={this.state.photo.filename}/>
              <CardBody>
                <CardText>
                </CardText>
                <CardText>
                  <Table>
                    <tbody>
                    <tr>
                      <th> Filename</th>
                      <td>{this.state.photo.filename} </td>
                    </tr>
                    {this.state.photo.caption &&
                    <tr>
                      <th>Caption</th>
                      <td>{this.state.photo.caption}</td>
                    </tr>
                    }
                    {this.state.photo.uploadDate === undefined &&
                    <tr>
                      <th>Upload Date</th>
                      <td>{this.state.photo.uploadDate}</td>
                    </tr>
                    }
                    <tr>
                      <th> Height</th>
                      <td>{this.state.photo.metadata.height}</td>
                    </tr>
                    <tr>
                      <th>Width</th>
                      <td>{this.state.photo.metadata.width}</td>
                    </tr>
                    <tr>
                      <th>Mime Type</th>
                      <td>{this.state.photo.metadata.mimeType}</td>
                    </tr>
                    {this.state.photo.metadata.exposureTime === undefined &&
                    <tr>
                      <th>Exposure Time</th>
                      <td>{this.state.photo.metadata.exposureTime}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.fNumber === undefined &&
                    <tr>
                      <th>Fnumber</th>
                      <td>{this.state.photo.metadata.fNumber}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.iso === undefined &&
                    <tr>
                      <th>Iso</th>
                      <td>{this.state.photo.metadata.iso}</td>
                    </tr>
                    }
                    {this.state.photo.metadata.captureDate === 0 &&
                    <tr>
                      <th>Iso</th>
                      <td>{this.state.photo.metadata.captureDate.toLocaleTimeString()}</td>
                    </tr>
                    }
                    </tbody>
                  </Table>
                </CardText>
              </CardBody>
            </Card>
          </div>
        </Container>
      </div>
    );
  }
}

Photo.propTypes = {};
Photo.defaultProps = {};

export default withRouter(Photo);
