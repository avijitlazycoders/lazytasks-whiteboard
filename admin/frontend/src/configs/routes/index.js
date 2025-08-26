import React from 'react'

export const whiteboardRoutes = [
    {
        key: 'whiteboard',
        path: '/project/whiteboard/:id',
        component: React.lazy(() => import('../../components/whiteboard/Whiteboard')),
        authority: [],
    },
    {
        key: 'whiteboard-fullscreen',
        path: '/project/whiteboard/fullscreen/:id',
        component: React.lazy(() => import('../../components/whiteboard/WhiteboardFullscreen')),
        authority: [],
    },
]
