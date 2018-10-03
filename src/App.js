import React, {Component} from 'react';
import {HashRouter as Router, Route} from "react-router-dom";

import './App.css';
import 'react-select/dist/react-select.css';

import {Provider} from "mobx-react";
import PropTypes from 'prop-types';
import IntegrationStore from './stores/IntegrationStore'
import Program from './components/program';

import D2UIApp from '@dhis2/d2-ui-app';
import Aggregate from "./components/aggregate";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "../node_modules/@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";
import NotificationsIcon from "../node_modules/@material-ui/icons/Notifications";
import Drawer from "@material-ui/core/Drawer";
import ChevronLeftIcon from "../node_modules/@material-ui/icons/ChevronLeft";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {mainListItems, secondaryListItems} from "./components/listItems";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import HeaderBar from '@dhis2/d2-ui-header-bar';


import styles from "./components/styles";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            d2: props.d2,
            baseUrl: props.baseUrl,
            open: true
        };
    }

    getChildContext() {
        return {d2: this.state.d2};
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    render() {
        const {classes} = this.props;
        return (
            <Provider IntegrationStore={IntegrationStore}>
                <Router>
                    <React.Fragment>
                        <CssBaseline/>
                        {/*<header className="header">
                            <h1 className="App-title">Welcome to the DHIS2 UI library</h1>
                        </header>*/}
                        <div className={classes.root}>
                            <AppBar
                                position="absolute"
                                color="primary"
                                className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
                            >
                                {/*<HeaderBar d2={this.state.d2}/>*/}
                                <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
                                    <IconButton
                                        color="inherit"
                                        aria-label="Open drawer"
                                        onClick={this.handleDrawerOpen}
                                        className={classNames(
                                            classes.menuButton,
                                            this.state.open && classes.menuButtonHidden
                                        )}
                                    >
                                        <MenuIcon/>
                                    </IconButton>
                                    <Typography variant="title" color="inherit" noWrap className={classes.title}>
                                    </Typography>
                                    {/*<IconButton color="inherit">
                                        <Badge badgeContent={4} color="secondary">
                                            <NotificationsIcon/>
                                        </Badge>
                                    </IconButton>*/}
                                </Toolbar>
                            </AppBar>
                            <Drawer
                                variant="permanent"
                                classes={{
                                    paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose)
                                }}
                                open={this.state.open}
                            >
                                <div className={classes.toolbarIcon}>
                                    <IconButton onClick={this.handleDrawerClose}>
                                        <ChevronLeftIcon/>
                                    </IconButton>
                                </div>
                                {/*<Divider/>*/}
                                <List>{mainListItems}</List>
                                {/*<Divider/>
                                <List>{secondaryListItems}</List>*/}
                            </Drawer>
                            <main className={classes.content}>
                                <div className={classes.appBarSpacer}/>
                                <D2UIApp>
                                    <Route
                                        exact
                                        path='/'
                                        component={() => <Program d2={this.state.d2} baseUrl={this.state.baseUrl}/>}/>
                                    <Route
                                        path='/aggregates'
                                        component={() => <Aggregate d2={this.state.d2}/>}/>
                                </D2UIApp>
                            </main>
                        </div>
                    </React.Fragment>
                </Router>
            </Provider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

App.propTypes = {
    d2: PropTypes.object.isRequired,
    baseUrl: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired
};


export default withStyles(styles)(App);
