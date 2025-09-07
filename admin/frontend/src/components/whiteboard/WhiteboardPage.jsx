import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LoadingOverlay, ScrollArea, Box, Button, Popover, Avatar, Textarea, CloseButton, Group, Text, Card, Divider, Anchor, Tooltip, ActionIcon, Modal, ThemeIcon, Stack, Title } from "@mantine/core";
import { modals } from '@mantine/modals';
import { useSelector, useDispatch } from "react-redux";
import { Excalidraw, Footer, MainMenu, Sidebar, WelcomeScreen, Excalifont } from '@excalidraw/excalidraw';
import {
    fetchProjectWhiteboard,
    saveProjectWhiteboard,
    saveWhiteboardComment,
    fetchWhiteboardComments,
    setLoggedInUser,
    deleteWhiteboardAllComments
} from "./store/whiteboardSlice";
import { translate } from '../../utils/i18n';
import { showNotification } from '@mantine/notifications';
import { useHotkeys } from '@mantine/hooks';
import { IconArrowUp, IconCircleArrowLeft, IconCircleArrowUp, IconCircleArrowUpFilled, IconDeviceFloppy, IconExternalLink, IconMessage, IconMessage2, IconMessageCircle, IconRestore, IconSend, IconTrash } from '@tabler/icons-react';
import WhiteboardComments from './WhiteboardComments';
import { hasPermission } from '../ui/permissions';
import isEqual from 'fast-deep-equal';
import { compareScenes } from '../../utils/compareScenes';

const WhiteboardPage = ({ project_id }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (window.loggedInUser) {
            dispatch(setLoggedInUser(window.loggedInUser));
        }
    }, [dispatch]);

    const { isLoading, projectWhiteboard, projectWhiteboardComments, loggedInUser } = useSelector((state) => state.whiteboard.whiteboard);

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

    const [resetModalOpen, setResetModalOpen] = useState(false);
    const lastSavedSceneRef = useRef(null);
    const currentSceneRef = useRef(null);

    function isSceneEqual(sceneA, sceneB) {
        return (
            isEqual(sceneA?.elements || [], sceneB?.elements || []) &&
            isEqual(normalizeFiles(sceneA?.files), normalizeFiles(sceneB?.files))
        );
    }

    function isSceneEmpty(scene) {
        if (!scene) return true;
        const hasElements = Array.isArray(scene.elements) && scene.elements.length > 0;
        const hasFiles = scene.files && Object.keys(scene.files).length > 0;
        return !hasElements && !hasFiles;
    }

    function normalizeFiles(files) {
        if (!files) return {};
        if (Array.isArray(files)) {
            // If files is an array, convert to an empty object (or a mapped object if needed)
            return {};
        }
        if (typeof files === "object" && Object.keys(files).length === 0) {
            return {};
        }
        return files;
    }

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

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const initialData = projectWhiteboard && projectWhiteboard.elements ? projectWhiteboard : null;

    useEffect(() => {
        // Set lastSavedScene when initial data loads
        if (initialData) {
            setLastSavedScene(initialData);
            lastSavedSceneRef.current = initialData;
            currentSceneRef.current = initialData;
        }
    }, [initialData]);

    const handleChange = (elements, appState) => {
        // setHasUnsavedChanges(true);
        const scene = {
            elements,
            appState: {
                ...appState,
                collaborators: undefined,
            },
            files: excalidrawRef.current?.getFiles(),
        };

        currentSceneRef.current = scene;

        setHasUnsavedChanges(!isSceneEqual(scene, lastSavedSceneRef.current));

        // Save to copy data

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
                lastSavedSceneRef.current = scene;
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
            created_by: loggedInUser ? loggedInUser.loggedUserId : '',
        };

        dispatch(saveWhiteboardComment({ id: project_id, data: newComment })).then((response) => {

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

    const handleReset = () => {
        if (excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                elements: [],
                appState: {
                    ...excalidrawRef.current.getAppState(),
                    // Optionally reset more appState fields if needed
                },
                files: {},
            });

            const scene = {
                elements: [],
                appState: {
                    ...excalidrawRef.current.getAppState(),
                },
                files: {},
            };

            dispatch(deleteWhiteboardAllComments({
                id: project_id,
                data: {
                    'deleted_by': loggedInUser ? loggedInUser.loggedUserId : '',
                }
            })).then((response) => {
                if (response.payload.status === 200) {
                    dispatch(saveProjectWhiteboard({ id: project_id, data: scene })).then((response) => {
                        if (response.payload.status === 200) {
                            setHasUnsavedChanges(false);
                            setLastSavedScene(scene);
                            lastSavedSceneRef.current = scene;
                            setSubmitting(false);
                            showNotification({
                                id: 'load-data',
                                loading: true,
                                title: translate('Project Whiteboard'),
                                message: translate('Whiteboard Reset successfully'),
                                disallowClose: true,
                                color: 'green',
                            });
                            setResetModalOpen(false);
                        } else {
                            setSubmitting(false);
                            console.error('Failed to save whiteboard:', response.payload.message);
                        }
                    });
                } else {
                    console.error('Failed to delete comment:', response.payload.message);
                }
            });


        }
    };

    const { zoom, scrollX, scrollY } = excalidrawAppState;

    const getTransformedCoords = (coords) => ({
        x: (coords.x + scrollX) * zoom,
        y: (coords.y + scrollY) * zoom,
    });

    const viewModeEnabled = !hasPermission(
        loggedInUser && loggedInUser.llc_permissions,
        ['whiteboard-manage']
    );

    const isFullscreen = window.location.href.includes('/fullscreen');
    const fullscreenUrl = `#/project/whiteboard/fullscreen/${project_id}`;

    useEffect(() => {

        return () => {
            const result = compareScenes(lastSavedSceneRef.current, currentSceneRef.current, { tolerance: 0.5 });

            if (result.equal) {
                console.log("No unsaved changes");
            } else {
                console.log("Unsaved changes detected:");
                handleSave();
            }
        };
    }, []);

    return (
        <>

            <Box style={{ width: '100%', height: isFullscreen ? '100vh' : '73vh', position: 'relative' }}>
                <LoadingOverlay visible={isLoading} />

                <Excalidraw
                    key={initialData ? JSON.stringify(initialData.elements) : 'empty'}
                    ref={excalidrawRef}
                    onChange={handleChange}
                    initialData={initialData}
                    viewModeEnabled={viewModeEnabled}
                    zenModeEnabled={viewModeEnabled}
                >
                    <WelcomeScreen>
                        <WelcomeScreen.Center>
                            <WelcomeScreen.Center.Heading>
                                Welcome LazyTasks Whiteboard
                            </WelcomeScreen.Center.Heading>
                            <WelcomeScreen.Hints.ToolbarHint />
                            <WelcomeScreen.Hints.HelpHint />
                        </WelcomeScreen.Center>
                    </WelcomeScreen>

                    {(
                        !initialData ||
                        (
                            initialData.elements?.length === 0 &&
                            (!initialData.files || Object.keys(initialData.files).length === 0)
                        )
                    ) && (
                            <Box
                                style={{
                                    position: 'absolute',
                                    left: 600,
                                    bottom: 85,
                                    pointerEvents: 'none',
                                    zIndex: 12,
                                }}
                            >
                                {/* Arrow SVG (pointing down to the footer) */}
                                <svg width="110" height="70" style={{ position: 'absolute', left: 90, top: 40, transform: 'scaleY(-1)' }}>
                                    <path
                                        d="M10,60 Q60,10 100,10"
                                        stroke="#bbb"
                                        strokeWidth="2.5"
                                        fill="none"
                                        markerEnd="url(#arrowhead)"
                                    />
                                    <defs>
                                        <marker
                                            id="arrowhead"
                                            markerWidth="8"
                                            markerHeight="8"
                                            refX="8"
                                            refY="4"
                                            orient="auto"
                                        >
                                            <polygon points="0 0, 8 4, 0 8" fill="#bbb" />
                                        </marker>
                                    </defs>
                                </svg>
                                {/* Hint Text */}
                                <Text
                                    style={{
                                        fontFamily: "'Virgil','Excalidraw','Architects Daughter', 'Shadows Into Light', cursive, sans-serif",
                                        fontSize: 16,
                                        color: "#bbb",
                                        whiteSpace: "pre-line",
                                        userSelect: "none",
                                        marginLeft: 0,
                                        marginBottom: 10,
                                    }}
                                >
                                    Use these tools!
                                    <br />
                                    Comments, Save, Reset, and more
                                </Text>
                            </Box>
                        )}

                    <Footer>
                        <Group justify='center' style={{ flex: 1 }}>
                            <Card withBorder radius="md" p={'7px'} shadow='sm'
                                bg="#F1F3F5"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                            >
                                <Group spacing={4}>
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-comments']) && (
                                        <Tooltip label={translate('Add Comment')} position="top" withArrow>
                                            <ActionIcon
                                                onClick={() => setCommentMode(!commentMode)}
                                                variant="subtle" color='#202020' size="sm"
                                                aria-label="Settings"
                                            >
                                                <IconMessage2 stroke={1.25} size={22} color={"#202020"} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-manage']) && (
                                        <Tooltip label={translate('Reset Whiteboard')} position="top" withArrow>
                                            <ActionIcon
                                                onClick={() => setResetModalOpen(true)}
                                                variant="subtle" color='#202020' size="sm"
                                                aria-label="Settings"
                                                loaderProps={{ type: 'dots' }}
                                            >
                                                <IconRestore stroke={1.25} size={22} color={"#202020"} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    <Tooltip label={translate('Go to fullscreen')} position="top" withArrow>
                                        <ActionIcon
                                            variant="subtle" color='#202020' size="sm"
                                            aria-label="Settings"
                                            component="a"
                                            href={fullscreenUrl}
                                            target='_blank'
                                        >
                                            <IconExternalLink stroke={1.25} size={22} color={"#202020"} />
                                        </ActionIcon>
                                    </Tooltip>
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-manage']) && (
                                        <>
                                            <Divider orientation="vertical" color='#c2c2c2' />
                                            <Tooltip label={translate('Save Whiteboard')} position="top" withArrow>
                                                <ActionIcon
                                                    onClick={handleSave}
                                                    variant="filled" color='orange' size="sm"
                                                    aria-label="Settings"
                                                    loaderProps={{ type: 'dots' }}
                                                    loading={submitting}
                                                    disabled={submitting}
                                                >
                                                    <IconDeviceFloppy stroke={1.25} size={22} color={"white"} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </>
                                    )}
                                </Group>
                            </Card>
                        </Group>
                        <Box ml="auto">
                            <Text size="sm" c="dimmed" ta="right" fw={500} mt={8} mr={10}>
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
                        </Box>
                    </Footer>

                </Excalidraw>
                {/* Custom Footer absolutely positioned */}
                {viewModeEnabled && (
                    <Box
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 20,
                            pointerEvents: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Group justify='center' style={{ flex: 1 }}>
                            <Card withBorder radius="md" p={'7px'} shadow='sm'
                                bg="#F1F3F5"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    marginLeft: 175,
                                }}
                            >
                                <Group spacing={4}>
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-comments']) && (
                                        <Tooltip label={translate('Add Comment')} position="top" withArrow>
                                            <ActionIcon
                                                onClick={() => setCommentMode(!commentMode)}
                                                variant="subtle" color='#202020' size="sm"
                                                aria-label="Settings"
                                            >
                                                <IconMessage2 stroke={1.25} size={22} color={"#202020"} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-manage']) && (
                                        <Tooltip label={translate('Reset Whiteboard')} position="top" withArrow>
                                            <ActionIcon
                                                onClick={() => setResetModalOpen(true)}
                                                variant="subtle" color='#202020' size="sm"
                                                aria-label="Settings"
                                                loaderProps={{ type: 'dots' }}
                                            >
                                                <IconRestore stroke={1.25} size={22} color={"#202020"} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                    <Tooltip label={translate('Go to fullscreen')} position="top" withArrow>
                                        <ActionIcon
                                            variant="subtle" color='#202020' size="sm"
                                            aria-label="Settings"
                                            component="a"
                                            href={fullscreenUrl}
                                            target='_blank'
                                        >
                                            <IconExternalLink stroke={1.25} size={22} color={"#202020"} />
                                        </ActionIcon>
                                    </Tooltip>
                                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-manage']) && (
                                        <>
                                            <Divider orientation="vertical" color='#c2c2c2' />
                                            <Tooltip label={translate('Save Whiteboard')} position="top" withArrow>
                                                <ActionIcon
                                                    onClick={handleSave}
                                                    variant="filled" color='orange' size="sm"
                                                    aria-label="Settings"
                                                    loaderProps={{ type: 'dots' }}
                                                    loading={submitting}
                                                    disabled={submitting}
                                                >
                                                    <IconDeviceFloppy stroke={1.25} size={22} color={"white"} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </>
                                    )}
                                </Group>
                            </Card>
                        </Group>
                        <Box ml="auto">
                            <Text size="sm" c="dimmed" ta="right" fw={500} mt={8} mr={10}>
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
                        </Box>
                    </Box>
                )}

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
                    shadow="md"
                    withinPortal={false}
                    closeOnClickOutside
                    closeOnEscape
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
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            padding: 0,
                        }}
                    >
                        <Card withBorder radius="md" padding="xs"
                            bg="#F1F3F5">
                            <Group justify='flex-end' mb={4}>
                                <CloseButton
                                    size="sm"
                                    onClick={() => {
                                        setPopoverOpened(false);
                                        setCommentText('');
                                        setCommentPoint(null);
                                    }}
                                />
                            </Group>
                            <Textarea
                                variant="filled"
                                ref={textareaRef}
                                value={commentText}
                                onChange={e => setCommentText(e.currentTarget.value)}
                                placeholder={translate('Type your comment...')}
                                minRows={1}
                                autosize
                                styles={{
                                    input: { paddingRight: 30 }
                                }}
                            />
                            <Divider />
                            <Group justify='flex-end' mt={2}>
                                <ActionIcon
                                    variant="transparent" color="orange" size="sm"
                                    aria-label="Settings"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    loading={addLoading}
                                    loaderProps={{ type: 'dots' }}
                                >
                                    <IconCircleArrowUpFilled stroke={1.25} size={22} />
                                </ActionIcon>
                            </Group>
                        </Card>
                    </Popover.Dropdown>
                </Popover>

                <Modal
                    opened={resetModalOpen}
                    onClose={() => setResetModalOpen(false)}
                    title={
                        <>
                            <Group spacing="xs">
                                <ThemeIcon color="orange" radius="xl" size="lg" variant="filled">
                                    <IconRestore size={24} />
                                </ThemeIcon>
                                <Text size="md" weight={500}>
                                    {translate('Reset Whiteboard?')}
                                </Text>
                            </Group>
                        </>
                    }
                    size="md"
                    centered
                >
                    <Divider size="xs" my={0} className='!-ml-4 w-[calc(100%+2rem)]' />
                    <Stack spacing="md" pt="md">
                        <Text size="sm" ta="center" pt={5} c="#4D4D4D">
                            Are you want to reset the whiteboard? This action cannot be undone.
                        </Text>
                        <Group mt="xs" justify="flex-end">
                            <Button variant="default" onClick={() => setResetModalOpen(false)}>
                                {translate('Cancel')}
                            </Button>
                            <Button color="orange" onClick={handleReset} loading={submitting} disabled={submitting} loaderProps={{ type: 'dots' }}>
                                {translate('Yes')}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

            </Box>
        </>
    );
};

export default WhiteboardPage;