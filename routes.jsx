import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import { Helmet } from "react-helmet";
import pageSettings from './js/app-page-settings';

import ProjectLoader from './components/project-loader/project-loader.jsx';
import Bookmarks from './pages/bookmarks.jsx';
import Issues from './pages/issues/issues.jsx';
import Issue from './pages/issue.jsx';
import Entry from './pages/entry.jsx';
import Add from './pages/add/add.jsx';
import Submitted from './pages/add/submitted.jsx';
import Search from './pages/search/search.jsx';
import Moderation from './pages/moderation.jsx';
import NotFound from './pages/not-found.jsx';

import Navbar from './components/navbar/navbar.jsx';
import Footer from './components/footer/footer.jsx';

const Featured = () => {
  return <div>
          <Helmet><title>Featured</title></Helmet>
          <ProjectLoader featured={`True`} />
        </div>;
};

const Latest = () => {
  return <div>
          <Helmet><title>Latest</title></Helmet>
          <ProjectLoader />
        </div>;
};

const Tag = (router) => {
  return <div>
          <Helmet><title>{router.params.tag}</title></Helmet>
          <ProjectLoader tag={router.params.tag} />
        </div>;
};

const App = React.createClass({
  pageTitle: `Mozilla Network Pulse`,
  render() {
    return (
      <div>
        <Helmet titleTemplate={`%s - ${this.pageTitle}`}
                defaultTitle={this.pageTitle}>
        </Helmet>
        <Navbar router={this.props.router}/>
        <div id="main" className="container">
          {this.props.children}
        </div>
        <Footer/>
      </div>
    );
  }
});

// We have renamed all non user facing "favorites" related variables and text (e.g., favs, faved, etc) to "bookmarks".
// This is because we want client side code to match what Pulse API uses (i.e., bookmarks)
// For user facing bits like UI labels and URL path we want them to stay as "favorites".
// That's why a route like <Route path="favs" component={Bookmarks} /> is seen here.
// For more info see: https://github.com/mozilla/network-pulse/issues/326

// PageSettings is used to preserve a project list view state.
// Attach route enter hook pageSettings.setCurrentPathname(evt.location.pathname)
// *only* to routes that render a list of projects.
module.exports = (
  <Route path="/" component={App}>
    <IndexRedirect to="/featured" />
    <Route path="featured" component={Featured} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    <Route path="latest" component={Latest} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    <Route path="favs" component={Bookmarks} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    <Route path="issues">
      <IndexRoute component={Issues} />
      <Route path=":issue" component={Issue} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    </Route>
    <Route path="entry/:entryId" component={Entry} onEnter={() => pageSettings.setScrollPosition()} onLeave={() => pageSettings.setRestore(true)} />
    <Route path="add" component={Add} />
    <Route path="submitted" component={Submitted} />
    <Route path="search" component={Search} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    <Route path="tags">
      <IndexRedirect to="/latest" />
      <Route path=":tag" component={Tag} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    </Route>
    <Route path="moderation" component={Moderation} onEnter={evt => pageSettings.setCurrentPathname(evt.location.pathname)} />
    <Route path="*" component={NotFound}/>
  </Route>
);
