import React from 'react';
import ReactDOM from 'react-dom';
import {init} from 'd2/lib/d2';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const baseUrl = 'http://localhost:8080/dhis';
// const baseUrl = 'https://eidsr.dev.hispuganda.org';



init({
    baseUrl: baseUrl + '/api/29'
}).then(d2 => {
    ReactDOM.render(
        <App d2={d2} baseUrl={baseUrl}/>, document.getElementById('root'));
    registerServiceWorker();
}).catch(e => console.error);
