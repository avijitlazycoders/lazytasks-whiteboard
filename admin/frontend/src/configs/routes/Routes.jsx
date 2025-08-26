import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, HashRouter, useLocation, browserHistory } from 'react-router-dom';
import Whiteboard from '../../components/whiteboard/Whiteboard';

const AppRoutes = () => {

    return (
        <>
            <HashRouter>
                <Routes>
                    <Route path="/project/whiteboard/:id" element={<Whiteboard />} />
                </Routes>
            </HashRouter>
        </>
    );
};

export default AppRoutes;
