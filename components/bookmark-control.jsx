import React from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import bookmarkManager from '../js/bookmarks-manager';
import Service from '../js/service.js';
import user from '../js/app-user.js';

class BookmarkControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarked: false
    };
  }

  createGaEventConfig(category = ``, action = ``, transport = ``) {
    let config = {
      category: `Entry Card - ${category}`,
      action: action,
      label: `${this.props.id} - ${this.props.title}`
    };

    if (transport) {
      config.transport = transport;
    }

    return config;
  }

  componentDidMount() {
    this.setInitialBookmarkedStatus();
  }

  setInitialBookmarkedStatus() {
    if (user.loggedin) {
      this.setState({
        bookmarked: this.props.isBookmarked
      });

      return;
    }

    let bookmarks = bookmarkManager.bookmarks.get();
    let bookmarked;

    if (bookmarks) {
      bookmarked = bookmarks.indexOf(this.props.id) > -1;
      this.setState({bookmarked: bookmarked});
    }
  }

  bookmarkToLocalStorage(bookmarks) {
    bookmarks.unshift(this.props.id);
    this.setState({bookmarked: true}, () => {
      this.props.updateBookmarkedState(this.state.bookmarked);
    });
  }

  unbookmarkToLocalStorage(bookmarks) {
    bookmarks.splice(bookmarks.indexOf(this.props.id), 1);
    this.setState({bookmarked: false}, () => {
      this.props.updateBookmarkedState(this.state.bookmarked);
    });
  }

  updateBookmarkOnLocalStorage() {
    let bookmarks = bookmarkManager.bookmarks.get();

    if (bookmarks) {
      if (this.state.bookmarked) {
        this.unbookmarkToLocalStorage(bookmarks);
      } else {
        this.bookmarkToLocalStorage(bookmarks);
      }
      bookmarkManager.bookmarks.set(bookmarks);
    }
  }

  toggleBookmark(callback) {
    Service.entry
      .put.bookmark(this.props.id)
      .then(() => {
        callback(null);
      })
      .catch(reason => {
        console.error(reason);
        callback(reason);
      });
  }

  handleBookmarkClick() {
    if (document && document.onanimationend !== `undefined`) {
      this.refs.heart.classList.add(`beating`);
      this.refs.heart.addEventListener(`animationend`, () => {
        this.refs.heart.classList.remove(`beating`);
      });
    }

    ReactGA.event(this.createGaEventConfig(`Bookmark button`, this.state.bookmarked ? `Unbookmarked` : `Bookmarked`));

    if (user.loggedin) {
      this.toggleBookmark((error) => {
        if (error) return;

        this.setState({ bookmarked: !this.state.bookmarked }, () => {
          this.props.updateBookmarkedState(this.state.bookmarked);
        });
      });

      return;
    }

    this.updateBookmarkOnLocalStorage();
  }

  render() {

    return (
      <a className="heart" ref="heart" onClick={() => this.handleBookmarkClick()}></a>
    );
  }
}

BookmarkControl.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  isBookmarked: PropTypes.bool.isRequired,
  updateBookmarkedState: PropTypes.func.isRequired,
  onDetailView: PropTypes.bool
};

BookmarkControl.defaultProps = {
  onDetailView: true
};

export default BookmarkControl;
