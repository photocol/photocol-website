import React from 'react';
import PropTypes from 'prop-types';
import './UserSearch.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import {
  CardBody,
  CardImg,
  CardTitle,
  Button,
  CardText,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Jumbotron,
  Container,
  Card,
  NavbarToggler, Collapse, Navbar
} from 'reactstrap';
class UserSearch extends React.Component {
  constructor(props) {
    super(props);

    this.acm = new ApiConnectionManager();
    this.state = {
      queryString: '',
      searchResults: []
    };
  }

  searchUsers = () => {
    if(this.state.queryString.length===0) {
      this.setState({searchResults: []});
      return;
    }

    this.acm.request(`/search/user/${this.state.queryString}`)
      .then(res => {
        this.setState({searchResults: res.response.filter(this.props.userFilter)});
      })
      .catch(err => console.error(err));
  };

  // can be manually called from parent component with a ref
  refilter = () => {
    this.setState({
      searchResults: this.state.searchResults.filter(this.props.userFilter)
    });
  };

  render = () => {
    return (
      <div>
        <input class="form-control"
               type='text'
               value={this.state.queries}
               onChange={evt => {
                 this.setState({queryString: evt.target.value}, this.searchUsers)
               }} />
               <br/>
        <ul>
          {
            this.state.searchResults.map(result =>
                <Container>
                  <div key={result}>
                    {result} &nbsp; &nbsp;
                    <Button color="success" onClick={() => this.props.onUserSelect(result)}>
                      {this.props.selectText}
                    </Button>
                    <br/>
                    <br/>
                  </div>
                </Container>

            )
          }
        </ul>
      </div>
    );
  };
}

UserSearch.propTypes = {
  onUserSelect: PropTypes.func,
  buttonText: PropTypes.string,
  userFilter: PropTypes.func
};

UserSearch.defaultProps = {
  onUserSelect: () => {},
  buttonText: 'Select',
  userFilter: () => true
};

export default UserSearch;
