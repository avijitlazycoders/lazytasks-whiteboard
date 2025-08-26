import React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Button, Group, MantineProvider, ScrollArea, Text, TextInput, Grid, createTheme } from '@mantine/core';
import '../../index.css';
import '@mantine/core/styles.css';
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import store from "../../store";
import WhiteboardPage from "./WhiteboardPage";
import AppRoutes from "../../configs/routes/Routes";

const WhiteboardFullscreen = () => {
    const path = window.location.hash;
    const parts = path.split("/");
    const project_id = parts[parts.length - 1];

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
                <ModalsProvider>
                    <WhiteboardPage project_id={project_id} />
                </ModalsProvider>
            </MantineProvider>
        </Provider>

    );
}
export default WhiteboardFullscreen;