// Modules

import PropTypes from "prop-types";
import Avatar from "./Avatar";
import { useLoaderData } from "react-router-dom";
import { useToggle } from "../hooks/useToggle";
import { IconBtn } from "./Button";
import { useRef, useEffect, useState, useCallback } from "react";
import { useSnackbar } from "../hooks/useSnackbar";

const UserPrompt = ({ text }) => {
    const { user } = useLoaderData();
    const [isExpended, toggleExpended] = useToggle();
    const textBoxRef = useRef();
    const [hasMoreContent, setMoreContent] = useState(false);
    const { showSnackbar, hideSnackbar } = useSnackbar();
    useEffect(() => {
        setMoreContent(
            textBoxRef.current.scrollHeight > textBoxRef.current.clientHeight
        );
    }, [textBoxRef]);
    const handleCopy = useCallback(async (text) => {
        hideSnackbar();
        try {
            await navigator.clipboard.writeText(text);
            showSnackbar({ message: 'Copied to clipboard', timeOut: 2500 });
        } catch (err) {
            showSnackbar({ message: err.message, timeOut: 2500 });
            console.log(err.message);
        }
    }, [showSnackbar, hideSnackbar]);
    return (
        <>
            <div className='grid grid-cols-1 items-start gap-1 py-4 md:grid-cols-[max-content,minmax(0,1fr),max-content] md:gap-5'>
                <Avatar name={user?.name} />
                <p className={`text-bodyLarge pt-1 whitespace-pre-wrap break-words ${!isExpended ? 'line-clamp-4' : ''}`} ref={textBoxRef}>
                    {text}
                </p>
                {hasMoreContent && (
                    <IconBtn icon={isExpended ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} onClick={toggleExpended} />
                )}
            </div>
            <div className='flex justify-end items-center font-sans text-bodyMedium'>
                <IconBtn icon='content_copy' size='small' onClick={handleCopy.bind(null, text)} />
            </div>
        </>
    );
};

UserPrompt.propTypes = {
    text: PropTypes.string
};

export default UserPrompt;