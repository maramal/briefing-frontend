import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import New from '../pages/New';
import Briefing from '../pages/Briefing';

export default () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/nuevo" component={New} exact />
                <Route path="/b/:bid" component={Briefing} exact />
            </Switch>
        </BrowserRouter>
    );
}