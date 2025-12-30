// Modules

import PropTypes from "prop-types";
import { iconLogo } from "../assets/assets";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { hopscotch, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { IconBtn } from "./Button";
import { useState, useEffect, useCallback } from "react";
import toTitleCase from "../utils/toTitleCase";
import { useSnackbar } from "../hooks/useSnackbar";

const AiResponse = ({ aiResponse, children }) => {
    const [codeTheme, setCodeTheme] = useState('');
    const { showSnackbar, hideSnackbar } = useSnackbar();
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setCodeTheme(mediaQuery.matches ? hopscotch : oneDark);
        const themeListener = mediaQuery.addEventListener('change', (event) => {
            setCodeTheme(event.matches ? hopscotch : oneDark);
        });
        return () => mediaQuery.removeEventListener('change', themeListener);
    }, []);
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
    const code = ({ children, className, ...rest }) => {
        const match = className?.match(/language-(\w+)/);
        return match ? (
            <>
                <div className="code-block">
                    <div className='p-4 pb-0 font-sans'>
                        {toTitleCase(match[1])}
                    </div>
                    <SyntaxHighlighter {...rest} PreTag='div' language={match[1]} style={codeTheme} customStyle={{ marginBlock: '0', padding: '2px' }} codeTagProps={{ style: { padding: '14px' } }}>
                        {children}
                    </SyntaxHighlighter>
                </div>
                <div className='bg-light-surfaceContainer dark:bg-dark-surfaceContainer rounded-t-extraSmall rounded-b-medium flex justify-end items-center h-11 font-sans text-bodyMedium ps-4 pe-2'>
                    <IconBtn icon='content_copy' size='small' onClick={handleCopy.bind(null, children)} />
                </div>
            </>
        ) : (
            <code className={className}>{children}</code>
        );
    };
    return (
        <div className='grid grid-cols-1 items-start gap-1 py-4 md:grid-cols-[max-content,minmax(0,1fr)] md:gap-5'>
            <figure className='w-8 h-8 grid place-items-center'>
                <img src={iconLogo} width={32} height={32} alt="" />
            </figure>
            {children}
            <div className="markdown-content">
                <Markdown remarkPlugins={[remarkGfm]} components={{ code }}>
                    {aiResponse}
                </Markdown>
            </div>
        </div>
    );
};

AiResponse.propTypes = {
    aiResponse: PropTypes.string,
    children: PropTypes.any
};

export default AiResponse;