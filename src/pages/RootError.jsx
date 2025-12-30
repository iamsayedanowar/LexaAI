// Modules

import { useRouteError, Link, useNavigation } from "react-router-dom";
import { LinearProgress } from "../components/Progress";

const RootError = () => {
    const error = useRouteError();
    const navigation = useNavigation();
    return (
        <>
            <div className='h-dvh grid grid-cols-1 justify-items-center content-center'>
                <p className='text-displayLarge'>{error.status}</p>
                <p className='text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1 mb-4'>
                    The page you're looking for doesn't exist.
                </p>
                <Link to='/' className='btn filled primary'>
                    Go back
                    <div className="state-layer"></div>
                </Link>
            </div>
            {navigation.state === 'loading' && (<LinearProgress classes="fixed top-0 left-0 right-0" />)}
        </>
    );
};

export default RootError;