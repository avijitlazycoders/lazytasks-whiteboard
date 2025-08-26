import React, { useState, useRef, useEffect } from "react";
import { Popover, Avatar, Group, Text, Card, Divider, CloseButton, Button, Textarea, Box, ScrollArea, ActionIcon, Menu, Modal, ThemeIcon, Stack } from "@mantine/core";
import { IconCircleArrowUp, IconCircleArrowUpFilled, IconDeviceFloppy, IconDotsVertical, IconPencil, IconSend, IconTrash, IconX } from '@tabler/icons-react';
import { translate } from "../../utils/i18n";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
import {
    fetchProjectWhiteboard,
    saveWhiteboardComment,
    fetchWhiteboardComments,
    deleteWhiteboardComments,
    updateWhiteboardComment,
} from "./store/whiteboardSlice";
import { showNotification, updateNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { hasPermission } from '../ui/permissions';

const WhiteboardComments = ({
    project_id,
    comments,
    excalidrawAppState,
}) => {
    // const { id } = useParams();
    const dispatch = useDispatch();

    const { loggedInUser } = useSelector((state) => state.whiteboard.whiteboard);

    const [hoveredCommentId, setHoveredCommentId] = useState(null);
    const [openCommentPopoverId, setOpenCommentPopoverId] = useState(null);
    const [replyPoint, setReplyPoint] = useState(null);

    const [replyText, setReplyText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const [addLoading, setAddLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [draggedPos, setDraggedPos] = useState(null);
    const [mouseDownPos, setMouseDownPos] = useState(null);
    const [wasDrag, setWasDrag] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ id: null, type: null });

    const avatarRef = useRef(null);

    const { zoom, scrollX, scrollY } = excalidrawAppState;
    const getTransformedCoords = (coords) => ({
        x: (coords.x + scrollX) * zoom,
        y: (coords.y + scrollY) * zoom,
    });
    const canvasToScreen = (coords) => ({
        x: (coords.x + scrollX) * zoom,
        y: (coords.y + scrollY) * zoom,
    });
    const screenToCanvas = (coords) => ({
        x: coords.x / zoom - scrollX,
        y: coords.y / zoom - scrollY,
    });

    const handleDeleteComment = () => {
        // Implement your delete comment logic here
        console.log(`Delete comment with ID: ${openCommentPopoverId}`);
        setDeleteTarget({ id: openCommentPopoverId, type: 'comment' });
        setOpenCommentPopoverId(null);
        setDeleteModalOpen(true);
    };

    const handleDeleteReply = (replyId) => {
        // Implement your delete reply logic here
        console.log(`Delete reply with ID: ${replyId}`);
        setDeleteTarget({ id: replyId, type: 'reply' });
        setOpenCommentPopoverId(null);
        setDeleteModalOpen(true);
    }

    const handleConfirmDelete = () => {
        if (!deleteTarget.id || !deleteTarget.type) return;
        showNotification({
            id: 'load-data',
            loading: true,
            title: translate('Project Whiteboard'),
            message: "Deleting The Comment...",
            disallowClose: true,
            color: 'green',
        });
        dispatch(deleteWhiteboardComments({
            id: project_id,
            data: {
                comment_id: deleteTarget.id,
                'deleted_by': loggedInUser ? loggedInUser.loggedUserId : '',
                'type': deleteTarget.type
            }
        })).then((response) => {
            if (response.payload.status === 200) {
                updateNotification({
                    id: 'load-data',
                    loading: true,
                    title: translate('Project Whiteboard'),
                    message: response.payload.message || translate('Whiteboard comment deleted successfully'),
                    disallowClose: true,
                    color: 'green',
                });
                if (deleteTarget.type === 'comment') setOpenCommentPopoverId(null);
            } else {
                console.error('Failed to delete comment:', response.payload.message);
            }
            setDeleteModalOpen(false);
            setDeleteTarget({ id: null, type: null });
        });
    };

    const handleAddReply = () => {
        if (!replyText.trim()) return;
        setAddLoading(true);
        // Implement your add reply logic here
        console.log(`Add reply: ${replyText} to comment ID: ${openCommentPopoverId}`);
        const newComment = {
            parent_id: openCommentPopoverId,
            comments_coordinates: replyPoint,
            comment: replyText,
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
                setReplyText('');
            } else {
                setAddLoading(false);
                console.error('Failed to save whiteboard:', response.payload.message);
            }
        });
    };

    const handleSaveEdit = (c_id, type) => {
        if (!editText.trim()) return;
        setEditLoading(true);
        dispatch(updateWhiteboardComment({
            id: project_id,
            data: {
                comment_id: c_id,
                comment: editText,
                type: type,
                updated_by: loggedInUser ? loggedInUser.loggedUserId : '',
            }
        })).then((response) => {
            setEditLoading(false);
            if (response.payload.status === 200) {
                showNotification({
                    title: translate('Project Whiteboard'),
                    message: translate('Comment updated successfully'),
                    color: 'green',
                });
                setEditingId(null);
                setEditText('');
                dispatch(fetchWhiteboardComments(project_id));
            } else {
                setEditLoading(false);
                console.error('Failed to update comment:', response.payload.message);
            }
        });
    };

    // Drag handlers
    const handleMouseDown = (e, commentId, coords) => {
        e.stopPropagation();
        if (openCommentPopoverId === commentId) {
            setOpenCommentPopoverId(null);
        }
        setMouseDownPos({ x: e.clientX, y: e.clientY });
        setDraggingId(commentId);
        setDragOffset({
            x: e.clientX - canvasToScreen(coords).x,
            y: e.clientY - canvasToScreen(coords).y,
        });
        setDraggedPos(canvasToScreen(coords));
        setWasDrag(false);
    };

    useEffect(() => {
        if (draggingId === null) {
            setDraggedPos(null);
            return;
        }

        const handleMouseMove = (e) => {
            if (
                mouseDownPos &&
                (Math.abs(e.clientX - mouseDownPos.x) > 5 ||
                    Math.abs(e.clientY - mouseDownPos.y) > 5)
            ) {
                setWasDrag(true);
            }
            // Move avatar visually
            setDraggedPos({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        };

        const handleMouseUp = (e) => {
            if (
                mouseDownPos &&
                (Math.abs(e.clientX - mouseDownPos.x) > 5 ||
                    Math.abs(e.clientY - mouseDownPos.y) > 5)
            ) {
                // Find the comment being dragged
                const comment = comments.find(c => (c.id || comments.indexOf(c)) === draggingId);
                if (!comment) {
                    setDraggingId(null);
                    setDraggedPos(null);
                    return;
                }
                // Convert to canvas coordinates
                const newCanvas = screenToCanvas({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });

                setDraggingId(null);
                setDraggedPos(null);

                // Save to backend
                dispatch(updateWhiteboardComment({
                    id: project_id,
                    data: {
                        comment_id: comment.id,
                        comments_coordinates: newCanvas,
                        type: 'comment',
                        updated_by: loggedInUser ? loggedInUser.loggedUserId : '',
                    }
                })).then(() => {
                    // dispatch(fetchWhiteboardComments(id));
                });
            } else {
                setDraggingId(null);
                setDraggedPos(null);
            }
            setMouseDownPos(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId, dragOffset, comments, project_id, dispatch, loggedInUser, screenToCanvas, mouseDownPos]);

    return (
        <>
            {comments && comments.length > 0 && comments.map((comment, idx) => {
                let coords = { x: 0, y: 0 };
                if (comment?.comments_coordinates) {
                    try {
                        coords = typeof comment.comments_coordinates === "string"
                            ? JSON.parse(comment.comments_coordinates)
                            : comment.comments_coordinates;
                        if (!coords || typeof coords.x !== "number" || typeof coords.y !== "number") {
                            coords = { x: 0, y: 0 };
                        }
                    } catch {
                        coords = { x: 0, y: 0 };
                    }
                }
                const userName = comment?.user_name || "U";
                const userImage = comment?.avatar || null;
                const commentId = comment?.id || idx;
                const commentText = comment?.comment || "";
                const transformed = (draggingId === commentId && draggedPos)
                    ? draggedPos
                    : canvasToScreen(coords);

                return (
                    <React.Fragment key={commentId}>
                        {/* Hover Popover */}
                        <Popover
                            width={250}
                            position="right"
                            withArrow
                            shadow="md"
                            opened={hoveredCommentId === commentId && openCommentPopoverId !== commentId}
                        >
                            <Popover.Target>
                                <Avatar
                                    ref={avatarRef}
                                    radius="xl"
                                    size={30}
                                    src={userImage}
                                    draggable={false}
                                    style={{
                                        position: 'absolute',
                                        left: transformed.x - 14,
                                        top: transformed.y - 14,
                                        zIndex: 11,
                                        border: '2px solid #fff',
                                        background: '#f5f5f5',
                                        cursor: 'pointer'
                                    }}
                                    color="violet"
                                    onMouseEnter={() => setHoveredCommentId(commentId)}
                                    onMouseLeave={() => setHoveredCommentId(null)}
                                    onClick={() => {
                                        if (!wasDrag) {
                                            setOpenCommentPopoverId(commentId);
                                            setReplyPoint(transformed);
                                        }
                                    }}
                                    onMouseDown={e => {
                                        if (hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-comments'])) {
                                            handleMouseDown(e, commentId, coords);
                                        }
                                    }}
                                    onDragStart={e => e.preventDefault()}
                                >
                                    {!userImage && userName.charAt(0).toUpperCase()}
                                </Avatar>
                            </Popover.Target>
                            <Popover.Dropdown
                                style={{
                                    pointerEvents: 'none',
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                                p="xs"
                            >
                                <Group justify='space-between' align='center' style={{ whiteSpace: 'nowrap' }} mb={2}>
                                    <Text size="xs" fw={700}>
                                        {userName}
                                    </Text>
                                    <Text size="xs" c="dimmed" ta="right">
                                        {comment?.time_duration ? comment.time_duration + ' ago' : ''}
                                    </Text>
                                </Group>
                                <Text size="sm">
                                    {commentText}
                                </Text>
                            </Popover.Dropdown>
                        </Popover>

                        {/* Click Popover */}
                        <Popover
                            key={`click-${commentId}`}
                            width={350}
                            position="right"
                            withArrow
                            shadow="md"
                            opened={openCommentPopoverId === commentId && hasPermission(loggedInUser && loggedInUser.llc_permissions, ['whiteboard-comments'])}
                            onClose={() => setOpenCommentPopoverId(null)}
                        >
                            <Popover.Target>
                                {/* Use a hidden anchor div at the avatar position */}
                                <Box
                                    ref={avatarRef}
                                    style={{
                                        position: 'absolute',
                                        left: transformed.x + 10,
                                        top: transformed.y + 10,
                                        right: 'auto',
                                        width: 1,
                                        height: 1,
                                        zIndex: 12,
                                        transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1), top 0.2s cubic-bezier(0.4,0,0.2,1)',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </Popover.Target>
                            <Popover.Dropdown
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    padding: 0,
                                }}
                            >
                                <Card padding="xs" withBorder radius="md" shadow='md'>
                                    <Card.Section withBorder inheritPadding p={5} className="bg-[#FDFDFD] mb-2">
                                        <Group justify='flex-end' gap={2} align='center' mr={4}>
                                            <ActionIcon variant="transparent" color="red" aria-label="Settings"
                                                onClick={handleDeleteComment}
                                            >
                                                <IconTrash size={18} stroke={1.25} />
                                            </ActionIcon>
                                            <CloseButton
                                                size="md"
                                                onClick={() => setOpenCommentPopoverId(null)}
                                            />
                                        </Group>
                                    </Card.Section>
                                    <ScrollArea.Autosize mah={138} scrollbarSize={2}>
                                        <Group justify="space-between" align="center" mb={4}>
                                            <Group align='center' gap={6}>
                                                <Avatar
                                                    radius="xl"
                                                    size={24}
                                                    src={userImage}
                                                    color="violet"
                                                >
                                                    {!userImage && userName.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Text size="sm" fw={700}>
                                                    {comment.user_name}
                                                </Text>
                                                <Text size="sm" c="dimmed" ta="right">
                                                    {comment.time_duration + ' ago'}
                                                </Text>
                                            </Group>
                                            {/* Right side: Three-dot menu */}
                                            <Menu shadow="md" width={100}>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDotsVertical size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconPencil size={18} stroke={1.25} />}
                                                        onClick={() => {
                                                            setEditingId(commentId);
                                                            setEditText(comment.comment);
                                                        }}
                                                    >
                                                        Edit
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                        {editingId === commentId ? (
                                            <>
                                                <Textarea
                                                    value={editText}
                                                    onChange={e => setEditText(e.currentTarget.value)}
                                                    minRows={2}
                                                    autosize
                                                    autoFocus
                                                />
                                                <Group mt={4}>
                                                    <Button size="xs" color="#39758D" disabled={!editText.trim()} loading={editLoading} loaderProps={{ type: 'dots' }} onClick={() => handleSaveEdit(commentId, 'comment')}>Save</Button>
                                                    <Button size="xs" variant="default" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </Group>
                                            </>
                                        ) : (
                                            <Text size="sm" mt={4} ml={2}>
                                                {comment.comment}
                                            </Text>
                                        )}
                                        <Divider my="xs" />

                                        {comment.children && comment.children.length > 0 && comment.children.map((reply, reply_idx) => (
                                            <Box key={reply.id || reply_idx} mb={8}>
                                                <Group justify="space-between" align="center" mb={4}>
                                                    {/* Left side: Avatar + Name + Time */}
                                                    <Group gap={6} align="center">
                                                        <Avatar
                                                            radius="xl"
                                                            size={24}
                                                            src={reply.avatar}
                                                            color="violet"
                                                        >
                                                            {!reply.avatar && reply.user_name?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Text size="sm" fw={700}>
                                                            {reply.user_name}
                                                        </Text>
                                                        <Text size="sm" c="dimmed">
                                                            {reply.time_duration + ' ago'}
                                                        </Text>
                                                    </Group>

                                                    {/* Right side: Three-dot menu */}
                                                    <Menu shadow="md" width={100}>
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <IconDotsVertical size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                leftSection={<IconPencil size={18} stroke={1.25} />}
                                                                onClick={() => {
                                                                    setEditingId(reply.id);
                                                                    setEditText(reply.comment);
                                                                }}
                                                            >
                                                                Edit
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                leftSection={<IconTrash color="red" size={18} stroke={1.25} />}
                                                                onClick={() => handleDeleteReply(reply.id)}
                                                            >
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>

                                                {/* Comment text */}
                                                {editingId === reply.id ? (
                                                    <>
                                                        <Textarea
                                                            value={editText}
                                                            onChange={e => setEditText(e.currentTarget.value)}
                                                            minRows={2}
                                                            autosize
                                                            autoFocus
                                                        />
                                                        <Group mt={4}>
                                                            <Button size="xs" color="#39758D" disabled={!editText.trim()} loading={editLoading} loaderProps={{ type: 'dots' }} onClick={() => handleSaveEdit(reply.id, 'reply')}>Save</Button>
                                                            <Button size="xs" variant="default" onClick={() => setEditingId(null)}>Cancel</Button>
                                                        </Group>
                                                    </>
                                                ) : (
                                                    <Text size="sm" mt={2}>
                                                        {reply.comment}
                                                    </Text>
                                                )}
                                                <Divider my="xs" />
                                            </Box>
                                        ))}
                                    </ScrollArea.Autosize>

                                    <Box style={{ position: 'relative', backgroundColor: '#F1F3F5', borderRadius: 8, overflow: 'hidden' }}>
                                        <Textarea
                                            variant="filled"
                                            value={replyText}
                                            onChange={e => setReplyText(e.currentTarget.value)}
                                            placeholder={translate('Type your comment...')}
                                            minRows={1}
                                            autoFocus
                                            autosize
                                            styles={{
                                                input: { paddingRight: 30 }
                                            }}
                                        />
                                        <Divider />
                                        <Group mt={1} justify="flex-end" align="center">
                                            <ActionIcon
                                                variant="transparent" color="orange" size="md"
                                                aria-label="Settings"
                                                onClick={handleAddReply}
                                                disabled={!replyText.trim()}
                                                loading={addLoading}
                                                loaderProps={{ type: 'dots' }}
                                                mb={1}
                                            >
                                                <IconCircleArrowUpFilled stroke={1.25} size={22}/>
                                            </ActionIcon>
                                        </Group>
                                    </Box>
                                </Card>
                            </Popover.Dropdown>
                        </Popover>
                    </React.Fragment>
                );
            })}

            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={
                    <>
                        <Group spacing="xs">
                            <ThemeIcon color="red" radius="xl" size="lg" variant="filled">
                                <IconTrash size={24} />
                            </ThemeIcon>
                            <Text size="md" weight={500}>
                                {translate('Delete Comments')}
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
                        {deleteTarget.type === 'comment'
                            ? translate('Are you sure you want to delete this comment and all its replies?')
                            : translate('Are you sure you want to delete this reply?')}
                    </Text>
                    <Group mt="sm" justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                            {translate('Cancel')}
                        </Button>
                        <Button color="red" onClick={handleConfirmDelete}>
                            {translate('Delete')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};

export default WhiteboardComments;