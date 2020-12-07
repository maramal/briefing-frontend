import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import New from '../pages/New';

export default () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/nuevo" component={New} exact />
            </Switch>
        </BrowserRouter>
    );
}