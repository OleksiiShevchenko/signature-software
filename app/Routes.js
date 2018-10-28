/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import routes from './constants/routes.json';

import App from './containers/App';
import Home from './containers/home';

export default () => (
  <App>
    <Switch>
      <Redirect from="/" exact to="/keys" />
      <Route path={routes.HOME} component={Home} />
    </Switch>
  </App>
);
