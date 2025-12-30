// Modules

import { Link, Form, useNavigation, useActionData } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";
import { CircularProgress, LinearProgress } from "../components/Progress";
import { useEffect } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import { AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const Login = () => {
    const navigation = useNavigation();
    const error = useActionData();
    const { showSnackbar } = useSnackbar();
    useEffect(() => {
        if (error?.message) {
            showSnackbar({ message: error.message, type: 'error' });
        }
    }, [error, showSnackbar]);
    return (
        <>
            <PageTitle title="Login • LexaAI" />
            <div className='relative w-full h-dvh p-2 grid grid-cols-1 lg:grid-cols-[1fr, 1.2fr] lg:gap-2'>
                <div className='flex flex-col p-4'>
                    <div className="flex flex-1 items-center justify-center">
                        <div className='flex flex-col gap-2 max-w-[480px] w-full mx-auto'>
                            <h2 className='text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground text-center'>
                                Welcome back
                            </h2>
                            <p className='text-bodyLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2'>
                                Sign in to your account
                            </p>
                            <Form method='POST' className='grid grid-cols-1 gap-4'>
                                <TextField type="email" name="email" label="Email Address" placeholder="johndoe@example.com" required={true} autoFocus={true} />
                                <TextField type="password" name="password" label="Password" placeholder="Enter your password" required={true} />
                                <div className='text-right'>
                                    <Link to='/reset-link' className='link text-labelLarge inline-block'>
                                        Forgot password ?
                                    </Link>
                                </div>
                                <Button type="submit" disabled={navigation.state === 'submitting'}>
                                    {navigation.state === 'submitting' ? <CircularProgress size='small' /> : 'Log in'}
                                </Button>
                            </Form>
                            <p className='text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-center mt-2'>
                                Don't have an account ? <Link to="/register" className='link text-labelLarge inline-block ms-1 text-light-onSurface dark:text-dark-onSurface'>Create an account</Link>
                            </p>
                        </div>
                    </div>
                    <p className='mt-auto mx-auto text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant text-bodyMedium'>
                        © 2025 LexaAI Inc. All rights reserved.
                    </p>
                </div>
            </div>
            <AnimatePresence>
                {navigation.state === 'loading' && (
                    <LinearProgress classes='absolute top-0 left-0 right-0' />
                )}
            </AnimatePresence>
        </>
    );
};

export default Login;