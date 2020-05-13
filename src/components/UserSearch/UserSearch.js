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
      searchResults: []
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(this.props.searchQuery!==prevProps.searchQuery)
      this.searchUsers();
  };

  searchUsers = () => {
    if(this.props.searchQuery.length===0) {
      this.setState({searchResults: []});
      return;
    }

    this.acm.request(`/search/user/${this.props.searchQuery}`)
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

  handleSelect = result => {
    this.props.onUserSelect(result);
  };

  render = () => {
    return (
      <Dropdown isOpen={this.state.searchResults.length>0} toggle={() => {}} {...this.props}>
        <DropdownToggle className={'bg-transparent p-0 border-0'}>
          <Input type='text'
                 value={this.props.searchQuery}
                 placeholder={this.props.promptText}
                 onChange={this.props.onChange} />
        </DropdownToggle>
        <DropdownMenu>
          {
            this.state.searchResults.map(result => (
              <DropdownItem key={result} onClick={() => this.handleSelect(result)}>{result}</DropdownItem>
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
  userFilter: PropTypes.func,
  searchQuery: PropTypes.string,
  onChange: PropTypes.func
};

UserSearch.defaultProps = {
  onUserSelect: () => {},
  promptText: 'Select user',
  userFilter: () => true,
  searchQuery: '',
  onChange: () => {}
};

export default UserSearch;
