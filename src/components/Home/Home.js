import React from 'react';
import './Home.css';
import {Card, CardBody, CardImg, Col, Container, Jumbotron, Row} from 'reactstrap';
import welcome from "../../signs.svg";
import {Link} from "react-router-dom";
import cover from "../../windows.jpg";
import ApiConnectionManager from "../../util/ApiConnectionManager"; //Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collections: []
    };

    this.acm = new ApiConnectionManager();
  }

  componentDidMount = () => {
    this.acm.request('/perma/collections/public').then(res => {
      console.log(res);
      this.setState({ collections: res.response });
    }).catch(err => {
      console.error(err);
    });
  };

  render = () => {
    const collectionsJsx = this.state.collections.map(collection => (
      <Col xs={10} md={6} lg={4} className="mb-4">
        <Link to={`/collection/${this.state.username}/${collection.uri}`} className={'link-nostyle'}>
          <Card style={{ height: '14rem' }}>
            {collection.coverPhotoUri === undefined
              ?  <CardImg top src={cover} alt="Card image cap"
                          className = "image"/>
              :  <CardImg top src={`${process.env.REACT_APP_SERVER_URL}/perma/${collection.coverPhotoUri}`}
                          className = "image"/>
            }
            <CardBody>
              <p className={'text-truncate'}>{collection.name}</p>
              <p className={'small text-secondary, text-truncate'}>{collection.description}</p>
            </CardBody>
          </Card>
        </Link>
      </Col>
    ));

    return (
      <Container className="Home mt-5">
        <Jumbotron fluid className={'text-center bg-transparent'}>
          <img className="d-block mx-auto" src={welcome} style={{height: '20rem'}}/>
          <h2>to</h2>
          <h1>  Photocol!</h1>
          <p>by JLRLTYVZ</p>
        </Jumbotron>

        <Jumbotron>
          <h1>Public and discoverable collections</h1>
          <Row>
            {collectionsJsx}
          </Row>
        </Jumbotron>

      </Container>
    );
  }
}

export default Home;
