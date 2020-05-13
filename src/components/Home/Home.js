import React from 'react';
import './Home.css';
import { Container, Jumbotron } from 'reactstrap';
import welcome from "../../signs.svg"; //Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>

const Home = () => (
  <Container className="Home mt-5">
    <Jumbotron fluid className={'text-center bg-transparent'}>
      <img className="d-block mx-auto" src={welcome} style={{height: '20rem'}}/>
      <h2>to</h2>
      <h1>  Photocol!</h1>
      <p>by JLRLTYVZ</p>
    </Jumbotron>

  </Container>
);

export default Home;
