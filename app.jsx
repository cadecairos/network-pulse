import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Analytics from './js/analytics.js';
import Main from './main.jsx';

Analytics.initialize();

ReactDOM.render((
  <BrowserRouter>
    <Main />
  </BrowserRouter>
), document.getElementById(`app`));
