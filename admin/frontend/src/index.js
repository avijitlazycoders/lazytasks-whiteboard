// src/index.js
import { render } from '@wordpress/element';
import App from "./App";

if (document.getElementById('lazytasks-whiteboard')) {
    render( <App />, document.getElementById('lazytasks-whiteboard'));
}