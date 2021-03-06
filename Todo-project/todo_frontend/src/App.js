import './App.css';
import React, { Component } from "react";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false,
      },
      editing: false,
    }
    this.fetchTask = this.fetchTask.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)
    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.strikeUnStrike = this.strikeUnStrike.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTask()
  }

  fetchTask() {
    console.log('fetching...')
    fetch('http://localhost:8000/api/task-list/')
      .then(response => response.json())
      .then(data =>
        this.setState({
          todoList: data
        })
      )
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    var url = 'http://localhost:8000/api/task-create/'


    if (this.state.editing === true) {
      url = `http://localhost:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTask()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false,
        }
      })
    }).catch(function (error) {
      console.log('Error:', error)
    })
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    })
  }

  deleteItem(task) {
    var csrftoken = this.getCookie('csrftoken')

    fetch(`http://localhost:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      }
    }).then((response) => {
      this.fetchTask()
    })
  }

  strikeUnStrike(task) {
    task.completed = !task.completed;

    var csrftoken = this.getCookie('csrftoken')

    var url = `http://localhost:8000/api/task-update/${task.id}/`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ 'completed': task.completed, 'title': task.title })
    }).then(() => {
      this.fetchTask()
    })
  }

  render() {
    var tasks = this.state.todoList
    var self = this;
    return (
      <div className='container'>
        <h1 style={{
          paddingTop: '2px',
          textAlign: 'center'
        }}>My todo list</h1>
        <div id='task-container'>
          <div id='form-wrapper'>
            <form onSubmit={this.handleSubmit} id='form'>
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} type="text" className="form-control" id='title' value={this.state.activeItem.title} name='title' placeholder='Add task' />
                </div>

                <div style={{ flex: 1 }}>
                  <input type="submit" className='btn btn-warning' id='submit' name='Add' />
                </div>
              </div>
            </form>
          </div>

          <div id='list-wrapper'>
            {tasks.map(function (task, index) {
              return (
                <div key={index} className='task-wrapper flex-wrapper' >
                  <div onClick={() => self.strikeUnStrike(task)} style={{ flex: 7 }}>
                    {task.completed === false ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}

                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default App;