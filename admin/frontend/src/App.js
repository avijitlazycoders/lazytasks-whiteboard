// src/index.js
import React, {useEffect} from 'react';
import { render } from '@wordpress/element';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import {ModalsProvider} from "@mantine/modals";
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import {MobileApp} from "./components/qrCode/MobileApp";
import {Provider} from "react-redux";
import store, {premiumPersistor} from './store';
import WhietboardNav from "./components/whiteboard/WhietboardNav";
import {whiteboardRoutes} from "./configs/routes";

const theme = createTheme({
    colorScheme: 'light',
    primaryColor: 'blue',
    errorColor: 'red',
    fontFamily: 'Open Sans, sans-serif',
    cursorType: 'pointer',
    headings: {
        fontFamily: 'Open Sans, sans-serif',
    },
    legend: {
        fontFamily: 'Open Sans, sans-serif',
        fontSize: '16px',
    },

})

const App = () => {

    const whiteboardTabButton = (project_id) => {
        render(
            <Provider store={store}>
                <MantineProvider theme={theme}>
                    <Notifications />
                    <ModalsProvider>
                        <WhietboardNav project_id={project_id} />
                    </ModalsProvider>
                </MantineProvider>
            </Provider>,
            document.getElementById('lazytasks_whiteboard_tab_button')
        );
    }


    useEffect(() => {
        window.lazytasksWhiteboard = {
            whiteboardTabButton,
            whiteboardRoutes,
        }
    }, []);

    return null;
}

export default App;

