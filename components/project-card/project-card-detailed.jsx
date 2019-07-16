import React from "react";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";
import PropTypes from "prop-types";
import classNames from "classnames";
import moment from "moment";
import Creators from "./meta/creators.jsx";
import Thumbnail from "./meta/thumbnail.jsx";
import Title from "./meta/title.jsx";
import Description from "./meta/description.jsx";
import WhyInteresting from "./meta/why-interesting.jsx";
import IssuesAndTags from "./meta/issues-and-tags.jsx";
import GetInvolved from "./meta/get-involved.jsx";
import BookmarkControl from "../bookmark-control.jsx";
import bookmarkManager from "../../js/bookmarks-manager";
import user from "../../js/app-user.js";

class DetailedProjectCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarked: false
    };
  }

  sendGaEvent(config) {
    config = Object.assign(
      {
        category: `Entry`,
        action: ``,
        label: this.props.title
      },
      config
    );

    // config usually contains the following properties:
    // category, action, label, transport
    ReactGA.event(config);
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

    if (bookmarks) {
      let bookmarked = bookmarks.indexOf(this.props.id) > -1;
      this.setState({ bookmarked });
    }
  }

  updateCardBookmarkedState(isBookmarked) {
    this.setState({ bookmarked: isBookmarked });
  }

  handleCreatorClick(event, creator) {
    this.sendGaEvent({
      action: `Creator tap`,
      label: `${this.props.title} - ${creator}`
    });
  }

  handlePublisherClick(event, publisher) {
    this.sendGaEvent({
      action: `Submitter tap`,
      label: `${this.props.title} - ${publisher}`
    });
  }

  handleTwitterShareClick() {
    this.sendGaEvent({
      action: `Twitter share tap`,
      transport: `beacon`
    });
  }

  handleVisitBtnClick() {
    this.sendGaEvent({
      action: `Visit button tap`,
      transport: `beacon`
    });
  }

  renderVisitButton() {
    if (!this.props.contentUrl) return null;

    return (
      <a
        href={this.props.contentUrl}
        target="_blank"
        className="btn btn-block btn-primary"
        onClick={() => this.handleVisitBtnClick()}
      >
        Visit
      </a>
    );
  }

  renderTimePosted() {
    if (!this.props.created && !this.props.publishedBy) return null;

    let timePosted = this.props.created
      ? ` ${moment(this.props.created).format(`MMM DD, YYYY`)}`
      : null;
    let publishedBy = this.props.publishedBy ? (
      <span>
        {" "}
        by{" "}
        <Link
          to={`/profile/${this.props.submitterProfileId}`}
          onClick={event =>
            this.handlePublisherClick(event, this.props.publishedBy)
          }
        >
          {this.props.publishedBy}
        </Link>
      </span>
    ) : null;

    return (
      <p>
        Added{timePosted}
        {publishedBy}
      </p>
    );
  }

  renderSocialPanel() {
    let twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      this.props.title
    )}&url=${encodeURIComponent(window.location.href)}`;

    return (
      <div className="action-panel mb-3 mb-lg-0 pb-1 px-0 col-lg-2 justify-content-lg-end">
        <div className="d-flex flex-lg-column share pr-lg-5">
          <BookmarkControl
            id={this.props.id}
            className="circle-heart large mr-3 mr-lg-0 mb-lg-3"
            title={this.props.title}
            isBookmarked={this.props.isBookmarked}
            updateCardBookmarkedState={bookmarked => {
              this.updateCardBookmarkedState(bookmarked);
            }}
          />
          <a
            href={twitterUrl}
            onClick={evt => this.handleTwitterShareClick(evt)}
            className="circle-twitter large"
          />
        </div>
      </div>
    );
  }

  renderTitleAuthor() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8 mb-4">
            <Title 
              title={this.props.title} 
              className="mb-1 h1-heading"
              role="heading"
              ariaLevel="1"
            />
            <Creators
              creators={this.props.relatedCreators}
              showLabelText={true}
              creatorClickHandler={(event, name) =>
                this.handleCreatorClick(event, name)
              }
            />
          </div>
          <div className="col-12">
            {this.renderVisitButton()}
            <a
              href="https://www.google.com"
              target="_blank"
              className="btn btn-block btn-secondary text-center"
            >
              Get Involved
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderThumbnailAndTitle() {
    return (
      <div className="col-12 p-0 mb-5">
        <div className="pl-lg-5 ml-lg-5">
          <Thumbnail 
            thumbnail={this.props.thumbnail}
            className="mb-4 col-lg-5"
          />
          <div className="title-author mb-4">
            {this.renderTitleAuthor()}
          </div>
        </div>  
      </div>
    );
  }

  renderOtherContent() {
    let wrapperClassnames = classNames(`w-100 mb-2`);

    return (
      <div className={wrapperClassnames}>
        <div className="social-panel container d-lg-flex mb-lg-5">
          {this.renderSocialPanel()}
          <div className="my-3 my-lg-0 px-0">
            <Description description={this.props.description} className="mt-3" /> 
            <WhyInteresting interest={this.props.interest} />
          </div>
        </div>
        <GetInvolved
          getInvolved={this.props.getInvolved}
          getInvolvedUrl={this.props.getInvolvedUrl}
          helpTypes={this.props.helpTypes}
          sendGaEvent={config => this.sendGaEvent(config)}
        />
      </div>
    );
  }

  render() {
    let wrapperClassnames = classNames(`col-12 mt-lg-5 project-card detail-view`, {
      bookmarked: this.state.bookmarked
    });

    return (
      <div className={wrapperClassnames}>
        <div className="row">
          {this.renderThumbnailAndTitle()}
          {this.renderOtherContent()}
        </div>
        <div className="row">
          <div className="w-100">
            <div className="container">
                <div className="offset-lg-2">
                  <IssuesAndTags issues={this.props.issues} tags={this.props.tags}/>
                  <div className="time-posted">{this.renderTimePosted()}</div>
                  <div className="row">
                    <div className="col-12 col-md-8">
                      <p className="report-correction mt-3">
                        Correction?{" "}
                        <a href="https://mzl.la/pulse-contact">Contact us</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

DetailedProjectCard.propTypes = {
  id: PropTypes.number.isRequired,
  creators: PropTypes.array,
  description: PropTypes.string.isRequired,
  featured: PropTypes.bool,
  getInvolved: PropTypes.string,
  getInvolvedUrl: PropTypes.string,
  interest: PropTypes.string,
  issues: PropTypes.arrayOf(PropTypes.string),
  thumbnail: PropTypes.string,
  title: PropTypes.string.isRequired,
  contentUrl: PropTypes.string,
  isBookmarked: PropTypes.bool,
  onDetailView: PropTypes.bool
};

DetailedProjectCard.defaultProps = {
  onDetailView: true
};

export default DetailedProjectCard;
