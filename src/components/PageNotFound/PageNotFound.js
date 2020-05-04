import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';
import { Container } from 'reactstrap';

const PageNotFound = () => (
  <Container className="PageNotFound mt-5 text-center">
    <h1 className='display-1'>404</h1>
    You're lost. <Link to='/'>Go home</Link>.
  </Container>
);

export default PageNotFound;
