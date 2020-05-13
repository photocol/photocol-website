import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';
import {CardImg, Container} from 'reactstrap';
import lost from "../../lost.jpg"; //https://images.app.goo.gl/RuxdH8zds8hs29Sp8


const PageNotFound = () => (
  <Container className="PageNotFound mt-5 text-center">
    <h1 className='display-1'>404</h1>
    <img className="d-block mx-auto" src={lost} />
    You're lost. <Link to='/'>Go home</Link>.
  </Container>
);

export default PageNotFound;
