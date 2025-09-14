import React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Button, Group, MantineProvider, ScrollArea, Text, TextInput, Grid, createTheme } from '@mantine/core';
import '../../index.css';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import store from "../../store";
import WhiteboardPage from "./WhiteboardPage";

const Whiteboard = ({params}) => {
    const project_id = params.id;

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
    return (
        <Provider store={store}>
            <MantineProvider theme={theme}>
                <Notifications />
                    <WhiteboardPage project_id={project_id} />
            </MantineProvider>
        </Provider>

    );
}
export default Whiteboard; 