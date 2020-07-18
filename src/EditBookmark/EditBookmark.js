import React, { Component } from 'react';
import BookmarksContext from '../BookmarksContext';
import config from '../config'
import './EditBookmark.css';

const Required = () => (
  <span className='EditBookmark__required'>*</span>
)

class EditBookmark extends Component {
  constructor(props) {
    super(props);
    this.titleInput = React.createRef();
    this.urlInput = React.createRef();
    this.ratingInput = React.createRef();
  }

  static contextType = BookmarksContext;

  state = {
    title: '',
    url: '',
    description: '',
    rating: 1,
    error: null,
  };

  componentDidMount() {
    const bookmarkId = this.props.match.params.bookmarkId;
    fetch(`${config.API_ENDPOINT}${bookmarkId}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(res.status);
        }
        return res.json()
      })
      .then(res => {
        this.setState({
          title: res.title,
          url: res.url,
          description: res.description,
          rating: res.rating,
        })
      })
      .catch(error => this.setState({ error }));
  }

  handleSubmit = e => {
    e.preventDefault()
    const { title, url, description, rating } = e.target
    const bookmarkId = this.props.match.params.bookmarkId;
    const bookmark = {
      id: bookmarkId,
      title: title.value,
      url: url.value,
      description: description.value,
      rating: rating.value,
    }
    this.setState({ error: null })
    fetch(`${config.API_ENDPOINT}${bookmarkId}`, {
      method: 'PATCH',
      body: JSON.stringify(bookmark),
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${config.API_KEY}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(error => Promise.reject(error))
        }
        return res
      })
      .then(data => {
        this.context.updateBookmark(bookmark);
        title.value = '';
        url.value = '';
        description.value = '';
        rating.value = '';
        this.props.history.push('/');
      })
      .catch(error => {
        console.log(error);
        this.setState({ error });
      })
  }

  handleClickCancel = () => {
    this.props.history.push('/');
  };

  updateDescription = (e) => {
    this.setState({ description: e.value });
  }

  render() {
    const { error, title, url, description, rating } = this.state
    return (
      <section className='EditBookmark'>
        <h2>Edit bookmark</h2>
        <form
          className='EditBookmark__form'
          onSubmit={this.handleSubmit}
        >
          <div className='EditBookmark__error' role='alert'>
            {error && <p>{error.message}</p>}
          </div>
          <div>
            <label htmlFor='title'>
              Title
              {' '}
              <Required />
            </label>
            <input
              type='text'
              name='title'
              id='title'
              ref={this.titleInput}
              placeholder='Great website!'
              defaultValue={title}
              required
            />
          </div>
          <div>
            <label htmlFor='url'>
              URL
              {' '}
              <Required />
            </label>
            <input
              type='url'
              name='url'
              id='url'
              ref={this.urlInput}
              placeholder='https://www.great-website.com/'
              defaultValue={url}
              required
            />
          </div>
          <div>
            <label htmlFor='description'>
              Description
            </label>
            <textarea
              name='description'
              id='description'
              value={description}
              onChange={(e) => this.updateDescription(e)}
            />
          </div>
          <div>
            <label htmlFor='rating'>
              Rating
              {' '}
              <Required />
            </label>
            <input
              type='number'
              name='rating'
              id='rating'
              defaultValue={rating}
              min='1'
              max='5'
              ref={this.ratingInput}
              required
            />
          </div>
          <div className='EditBookmark__buttons'>
            <button type='button' onClick={this.handleClickCancel}>
              Cancel
            </button>
            {' '}
            <button type='submit'>
              Save
            </button>
          </div>
        </form>
      </section>
    );
  }
}

export default EditBookmark;