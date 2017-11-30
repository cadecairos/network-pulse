import React from 'react';
import { Helmet } from "react-helmet";
import qs from 'qs';
import LoadingNotice from '../components/loading-notice.jsx';
import ProjectCardDetialed from '../components/project-card/project-card-detailed.jsx';
import Service from '../js/service.js';
import Utility from '../js/utility.js';
import pageSettings from '../js/app-page-settings.js';

const NO_ENTRY_TITLE = `Entry unavailable`;
const NO_ENTRY_BLOCK = (
  <div className="text-center">
    <div className="content">
      <p className="description">
        This entry is not currently available.
      </p>
    </div>
  </div>
);

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      justPostedByUser: false,
      entry: null
    };
  }

  componentDidMount() {
    this.fetchData(this.props.match.params.entryId);
  }

  componentWillUnmount() {
    pageSettings.setRestore(true);
  }

  fetchData(entryId = ``) {
    Service.entry
      .get(entryId)
      .then((response) => {
        this.setState({
          dataLoaded: true,
          entry: response
        });
        this.checkIfRedirectedFromFormSubmission();
      })
      .catch((reason) => {
        console.error(reason);
        this.setState({
          dataLoaded: true,
          errorLoadingData: true
        });
      });
  }

  checkIfRedirectedFromFormSubmission() {
    let location = this.props.location;
    let query = qs.parse(location.search.substring(1));
    let justPostedByUser;

    if (query && query.justPostedByUser) {
      justPostedByUser = query.justPostedByUser === `true`;

      // remove 'justPostedByUser' query from URL
      delete query.justPostedByUser;
      this.props.history.replace({
        pathname: location.pathname,
        query: query
      });
    }

    this.setState({
      justPostedByUser: justPostedByUser
    });
  }

  renderEntry() {
    if (!this.state.dataLoaded) return null;

    let justPostedByUserMessage = null;
    let content = NO_ENTRY_BLOCK;
    let docTitle = NO_ENTRY_TITLE; // html doc title

    if (!this.state.errorLoadingData) {
      docTitle = `${this.state.entry.title}`;
      justPostedByUserMessage = this.state.justPostedByUser ? (<h5 className="col-12 text-center">Thanks for submitting!</h5>) : null;
      content = <ProjectCardDetialed {...Utility.processEntryData(this.state.entry)} onDetailView={true} />;
    }

    return (
      <div className="w-100">
        <Helmet><title>{ docTitle }</title></Helmet>
        { justPostedByUserMessage }
        { content }
      </div>
    );
  }

  render() {
    return (
      <div className="row justify-content-center">
        { !this.state.dataLoaded ? <LoadingNotice /> : this.renderEntry() }
      </div>
    );
  }
}

export default Entry;
