import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './PageNotFound.css';

const PageNotFound = () => (
  <div className="PageNotFound">
    You are friggin lost. <Link to='/'>Go home</Link>
  </div>
);

PageNotFound.propTypes = {};

PageNotFound.defaultProps = {};

export default PageNotFound;
