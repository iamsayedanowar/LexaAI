// Modules

import { Form, useNavigation, useActionData } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";
import { CircularProgress, LinearProgress } from "../components/Progress";
import { useEffect } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import { AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const ResetPassword = () => {
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
            <PageTitle title="Reset Password • LexaAI" />
            <div className='relative w-full h-dvh p-2 grid grid-cols-1 lg:grid-cols-[1fr, 1.2fr] lg:gap-2'>
                <div className='flex flex-col p-4'>
                    <div className="flex flex-1 items-center justify-center">
                        <div className='flex flex-col gap-2 max-w-[480px] w-full mx-auto'>
                            <h2 className='text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground text-center'>
                                Set new password
                            </h2>
                            <p className='text-bodyLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2'>
                                Enter your new password below to reset your account password
                            </p>
                            <Form method='POST' className='grid grid-cols-1 gap-4'>
                                <TextField type="password" name="password" label="Password" placeholder="Set new password" required={true} autoFocus={true} />
                                <Button type="submit" disabled={navigation.state === 'submitting'}>
                                    {navigation.state === 'submitting' ? <CircularProgress size='small' /> : 'Reset password'}
                                </Button>
                            </Form>
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

export default ResetPassword;