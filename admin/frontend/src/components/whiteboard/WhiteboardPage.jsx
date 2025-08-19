import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LoadingOverlay, ScrollArea, Box, Button, Popover, Avatar, Textarea, CloseButton, Group, Text, Card, Divider, Anchor } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import { Excalidraw, Footer, MainMenu, WelcomeScreen } from '@excalidraw/excalidraw';
import {
    fetchProjectWhiteboard,
    saveProjectWhiteboard,
    saveWhiteboardComment,
    fetchWhiteboardComments,
} from "./store/whiteboardSlice";
import { translate } from '../../utils/i18n';
import { showNotification } from '@mantine/notifications';
import { IconMessage, IconMessageCircle, IconSend, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import WhiteboardComments from './WhiteboardComments';

const WhiteboardPage = ({ project_id }) => {
    // const { project_id } = useParams();
    const { isLoading } = useSelector((state) => state.whiteboard.whiteboard);
    const { projectWhiteboard, projectWhiteboardComments } = useSelector((state) => state.whiteboard.whiteboard);
    // const { loggedUserId } = useSelector((state) => state.auth.user);
    // const { loggedInUser } = useSelector((state) => state.auth.session);
    const { loggedInUser } = 1;
    const { loggedUserId } = 1;

    const dispatch = useDispatch();
    const excalidrawRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSavedScene, setLastSavedScene] = useState(null);

    const [popoverOpened, setPopoverOpened] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
    const [commentMode, setCommentMode] = useState(false);
    const [commentModal, setCommentModal] = useState(false);
    const [commentPoint, setCommentPoint] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [hoveredCommentId, setHoveredCommentId] = useState(null);
    const [excalidrawAppState, setExcalidrawAppState] = useState({ zoom: 1, scrollX: 0, scrollY: 0 });
    const [addLoading, setAddLoading] = useState(false);

    const isSceneEqual = (sceneA, sceneB) => {
        return (
            JSON.stringify(sceneA?.elements) === JSON.stringify(sceneB?.elements) &&
            JSON.stringify(sceneA?.appState) === JSON.stringify(sceneB?.appState) &&
            JSON.stringify(sceneA?.files) === JSON.stringify(sceneB?.files)
        );
    };

    useEffect(() => {
        if (project_id) {
            dispatch(fetchProjectWhiteboard(project_id));
            dispatch(fetchWhiteboardComments(project_id));
        }
    }, [project_id, dispatch]);
    const textareaRef = useRef(null);
    const dropdownRef = useCallback((node) => {
        if (!node) return; // unmount
        // Focus after dropdown has mounted and layout is done
        requestAnimationFrame(() => {
            textareaRef.current?.focus({ preventScroll: true });
            // optional: put cursor at end
            const len = textareaRef.current?.value?.length ?? 0;
            try { textareaRef.current?.setSelectionRange(len, len); } catch { }
        });
    }, []);

    // useEffect(() => {
    //     const handleBeforeUnload = (e) => {
    //         if (hasUnsavedChanges) {
    //             e.preventDefault();
    //             e.returnValue = '';
    //         }
    //     };
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    // }, [hasUnsavedChanges]);

    const initialData = projectWhiteboard && projectWhiteboard.elements ? projectWhiteboard : null;

    useEffect(() => {
        // Set lastSavedScene when initial data loads
        if (initialData) {
            setLastSavedScene(initialData);
        }
    }, [initialData]);

    const handleChange = (elements, appState) => {
        setHasUnsavedChanges(true);
        const scene = {
            elements,
            appState: {
                ...appState,
                collaborators: undefined,
            },
            files: excalidrawRef.current?.getFiles(),
        };

        setHasUnsavedChanges(!isSceneEqual(scene, lastSavedScene));

        // Only update if zoom/scroll changed
        setExcalidrawAppState(prev => {
            const newState = {
                zoom: appState.zoom?.value || 1,
                scrollX: appState.scrollX || 0,
                scrollY: appState.scrollY || 0,
            };
            if (
                prev.zoom !== newState.zoom ||
                prev.scrollX !== newState.scrollX ||
                prev.scrollY !== newState.scrollY
            ) {
                return newState;
            }
            return prev;
        });
    };

    const handleSave = () => {
        if (!excalidrawRef.current) return;
        setSubmitting(true);
        const elements = excalidrawRef.current.getSceneElements();
        const appState = excalidrawRef.current.getAppState();
        const files = excalidrawRef.current.getFiles();

        const scene = {
            elements,
            appState: {
                ...appState,
                collaborators: undefined,
            },
            files,
        };

        dispatch(saveProjectWhiteboard({ id: project_id, data: scene })).then((response) => {
            if (response.payload.status === 200) {
                setHasUnsavedChanges(false);
                setLastSavedScene(scene);
                setSubmitting(false);
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: translate('Project Whiteboard'),
                    message: response.payload.message || translate('Whiteboard saved successfully'),
                    disallowClose: true,
                    color: 'green',
                });
            } else {
                setSubmitting(false);
                console.error('Failed to save whiteboard:', response.payload.message);
            }
        });

    }

    function screenToCanvasCoords({ x, y }, { zoom, scrollX, scrollY }) {
        const zoomValue = typeof zoom === "object" && zoom?.value ? zoom.value : zoom || 1;
        return {
            x: x / zoomValue - scrollX,
            y: y / zoomValue - scrollY,
        };
    }

    // Handle comment mode click on canvas overlay
    const handleCanvasClick = (e) => {
        if (!commentMode) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const canvasPoint = screenToCanvasCoords({ x, y }, excalidrawAppState);
        console.log('Canvas click at:', canvasPoint);
        console.log('Canvas click at:', x, y);
        setCommentPoint(canvasPoint);
        setPopoverPosition({ x, y });
        setPopoverOpened(true);
        setCommentMode(false);
    };

    // Add comment to state
    const handleAddComment = async () => {
        if (!commentText.trim() || !commentPoint) return;
        setAddLoading(true);
        const newComment = {
            comments_coordinates: commentPoint,
            comment: commentText,
            created_by: 1,
            // created_by: loggedInUser ? loggedInUser.loggedUserId : loggedUserId,
        };
        console.log('Adding comment:', newComment);
        dispatch(saveWhiteboardComment({ id: project_id, data: newComment })).then((response) => {
            console.log('response:', response);
            setAddLoading(false);
            if (response.payload.status === 200) {
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: translate('Project Whiteboard'),
                    message: response.payload.message || translate('Whiteboard comment added successfully'),
                    disallowClose: true,
                    color: 'green',
                });
                setComments([...comments, newComment]);
                setPopoverOpened(false);
                setCommentText('');
                setCommentPoint(null);
            } else {
                setAddLoading(false);
                console.error('Failed to save whiteboard:', response.payload.message);
            }
        });
    };

    const { zoom, scrollX, scrollY } = excalidrawAppState;
    // const getTransformedCoords = (coords) => ({
    //     x: coords.x * zoom + scrollX,
    //     y: coords.y * zoom + scrollY,
    // });
    const getTransformedCoords = (coords) => ({
        x: (coords.x + scrollX) * zoom,
        y: (coords.y + scrollY) * zoom,
    });

    return (
        <>
            <Box style={{ width: '100%', height: '92vh', position: 'relative' }}>
                <LoadingOverlay visible={isLoading} />

                <Excalidraw
                    key={initialData ? JSON.stringify(initialData.elements) : 'empty'}
                    ref={excalidrawRef}
                    onChange={handleChange}
                    initialData={initialData}
                    renderTopRightUI={() => {
                        return (
                            <>
                                <Button
                                    size="sm"
                                    color={"#EBF1F4"}
                                    styles={{
                                        label: {
                                            color: "#202020"
                                        }
                                    }}
                                    onClick={() => setCommentMode(!commentMode)}
                                >
                                    <IconMessageCircle stroke={1.25} size={24} color={"#202020"} className="mr-1" />
                                </Button>
                                <Button size="md" h={34} className={`font-semibold`} onClick={handleSave} variant="filled"
                                    color="#ED7D31" loaderProps={{ type: 'dots' }}
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    {translate('Save')}
                                </Button>
                            </>
                        );
                    }}
                >
                    <WelcomeScreen>
                        <WelcomeScreen.Center>
                            <WelcomeScreen.Center.Heading>
                                Welcome LazyTasks Whiteboard
                            </WelcomeScreen.Center.Heading>
                            {/* <WelcomeScreen.Center.Menu>
                                <WelcomeScreen.Center.MenuItemLoadScene />
                                <WelcomeScreen.Center.MenuItemHelp />
                            </WelcomeScreen.Center.Menu> */}
                            <WelcomeScreen.Hints.ToolbarHint />
                            <WelcomeScreen.Hints.MenuHint />
                            <WelcomeScreen.Hints.HelpHint />
                        </WelcomeScreen.Center>
                    </WelcomeScreen>
                    <Footer>
                        <Text size="sm" c="dimmed" fw={500} mt={8} ml={10}>
                            Powered by{" "}
                            <Anchor
                                href="https://excalidraw.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                underline
                                c="#39758D"
                                fw={600}
                            >
                                Excalidraw
                            </Anchor>
                        </Text>
                    </Footer>

                </Excalidraw>


                {/* Overlay for comment mode */}
                {commentMode && (
                    <Box
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            zIndex: 10,
                            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'><path d=\'M21 6.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 6.5v7A2.5 2.5 0 0 0 5.5 16H6v3.382a.5.5 0 0 0 .809.393L11.157 16H18.5A2.5 2.5 0 0 0 21 13.5v-7z\'/></svg>") 0 32, auto',
                        }}
                        onClick={handleCanvasClick}
                    />
                )}

                <WhiteboardComments
                    project_id={project_id}
                    comments={projectWhiteboardComments}
                    excalidrawAppState={excalidrawAppState}
                />

                {/* Popover for comment input */}
                <Popover
                    opened={popoverOpened}
                    onClose={() => {
                        setPopoverOpened(false);
                        setCommentText('');
                        setCommentPoint(null);
                    }}
                    width={300}
                    position="bottom"
                    withArrow
                    shadow="md"
                    withinPortal={false}
                    styles={{
                        dropdown: {
                            position: 'absolute',
                            left: popoverPosition.x,
                            top: popoverPosition.y,
                            transform: 'translate(-50%, 10px)',
                            zIndex: 20,
                        }
                    }}
                >
                    <Popover.Dropdown
                        ref={dropdownRef}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Box style={{ position: 'relative' }}>
                            <CloseButton
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    zIndex: 1
                                }}
                                size="sm"
                                onClick={() => {
                                    setPopoverOpened(false);
                                    setCommentText('');
                                    setCommentPoint(null);
                                }}
                            />
                            <Textarea
                                ref={textareaRef}
                                value={commentText}
                                onChange={e => setCommentText(e.currentTarget.value)}
                                placeholder={translate('Type your comment...')}
                                minRows={2}
                                autosize
                                styles={{
                                    input: { paddingRight: 30 }
                                }}
                            />
                        </Box>
                        <Button mt={4} size='xs' color="#39758D"
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                            loading={addLoading}
                            loaderProps={{ type: 'dots' }}
                        >
                            <IconSend stroke={1.25} />
                        </Button>
                    </Popover.Dropdown>
                </Popover>

            </Box>
        </>
    );
};

export default WhiteboardPage;