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

const ResetLink = () => {
    const navigation = useNavigation();
    const actionData = useActionData();
    const { showSnackbar } = useSnackbar();
    useEffect(() => {
        if (actionData) {
            showSnackbar({ message: actionData.message, type: actionData.ok ? 'info' : 'error', timeOut: 5000 });
        }
    }, [actionData, showSnackbar]);
    return (
        <>
            <PageTitle title="Forgot Password • LexaAI" />
            <div className='relative w-full h-dvh p-2 grid grid-cols-1 lg:grid-cols-[1fr, 1.2fr] lg:gap-2'>
                <div className='flex flex-col p-4'>
                    <div className="flex flex-1 items-center justify-center">
                        <div className='flex flex-col gap-2 max-w-[480px] w-full mx-auto'>
                            <h2 className='text-displaySmall font-semibold text-light-onBackground dark:text-dark-onBackground text-center'>
                                Forgot password
                            </h2>
                            <p className='text-bodyLarge text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2'>
                                Enter your email to reset your password
                            </p>
                            <Form method='POST' className='grid grid-cols-1 gap-4'>
                                <TextField type="email" name="email" label="Email Address" placeholder="johndoe@example.com" required={true} autoFocus={true} />
                                <Button type="submit" disabled={navigation.state === 'submitting'}>
                                    {navigation.state === 'submitting' ? <CircularProgress size='small' /> : 'Send reset link'}
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

export default ResetLink;