import React from 'react'
import Whiteboard from '../../components/whiteboard/Whiteboard'

export const whiteboardRoutes = [
    {
        key: 'whiteboard',
        path: '/project/whiteboard/:id',
        component: React.lazy(() => import('../../components/whiteboard/Whiteboard')),
        authority: [],
    },
    // {
    //     key: 'whiteboard',
    //     path: '/project/whiteboard/:id',
    //     component: Whiteboard,
    //     authority: [],
    // },
    {
        key: 'whiteboard-fullscreen',
        path: '/project/whiteboard/fullscreen/:id',
        component: React.lazy(() => import('../../components/whiteboard/Whiteboard')),
        authority: [],
    },
]
