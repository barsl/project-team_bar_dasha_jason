import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./navbar.component"
import { withRouter } from 'react-router-dom';
import Chatkit from '@pusher/chatkit-client';

class CreateEvent extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      users: []
    }
  }

  componentDidMount() {
    axios.get('/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })

  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    })
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const event = {
      username: this.state.username,
      description: this.state.description,
      date: this.state.date
    }

    console.log(event);



    axios.post('/events/add', event)
      .then(res => console.log(res.data));

    window.location = '/';
  }

  render() {
    return (
      <div>
        <Navbar />
        <h3>Create New Event Log</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function (user) {
                  return <option
                    key={user}
                    value={user}>{user}
                  </option>;
                })
              }
            </select>
          </div>
          <div className="form-group">
            <label>Description: </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.description}
              onChange={this.onChangeDescription}
            />
          </div>
          <div className="form-group">
            <label>Date: </label>
            <div>
              <DatePicker
                selected={this.state.date}
                onChange={this.onChangeDate}
              />
            </div>
          </div>

          <div className="form-group">
            <input type="submit" value="Create Event Log" className="btn btn-primary" />
          </div>
        </form>
      </div>
    )
  }
}

export default withRouter(CreateEvent);