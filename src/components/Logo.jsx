// Modules
import { logoDark, logoLight } from "../assets/assets";
import PropTypes from "prop-types";

const Logo = ({ classes = '', size = 26 }) => {
    return (
        <span className={`inline-flex items-center justify-center shrink-0 ${classes}`} aria-hidden="true">
            <img
                src={logoLight}
                width={size}
                height={size}
                alt="LexaAI"
                className="block dark:hidden shrink-0 select-none"
                style={{ width: `${size}px`, height: `${size}px` }}
            />
            <img
                src={logoDark}
                width={size}
                height={size}
                alt="LexaAI"
                className="hidden dark:block shrink-0 select-none"
                style={{ width: `${size}px`, height: `${size}px` }}
            />
        </span>
    );
};

Logo.propTypes = {
    classes: PropTypes.string,
    size: PropTypes.number
};

export default Logo;
