import React from 'react';
import PropTypes from 'prop-types';
import './UserSearch.css';
import ApiConnectionManager from "../../util/ApiConnectionManager";
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Input } from 'reactstrap';

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
      <Dropdown isOpen={this.state.searchResults.length>0}>
        <DropdownToggle className={'bg-transparent p-0 border-0'}>
          <Input type='text'
                 value={this.state.queries}
                 placeholder={this.props.promptText}
                 onChange={evt => { this.setState({queryString: evt.target.value}, this.searchUsers) }} />
        </DropdownToggle>
        <DropdownMenu>
          {
            this.state.searchResults.map(result => (
              <DropdownItem key={result} onClick={() => this.props.onUserSelect(result)}>{result}</DropdownItem>
            ))
          }
        </DropdownMenu>
      </Dropdown>
    );
  };
}

UserSearch.propTypes = {
  onUserSelect: PropTypes.func,
  promptText: PropTypes.string,
  userFilter: PropTypes.func
};

UserSearch.defaultProps = {
  onUserSelect: () => {},
  promptText: 'Select user',
  userFilter: () => true
};

export default UserSearch;
