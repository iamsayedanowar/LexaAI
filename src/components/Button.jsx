// Modules
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
    Plus,
    Check,
    Copy,
    X,
    Menu,
    MoreVertical,
    Pencil,
    Trash2
} from "lucide-react";

const ICON_MAP = {
    check: Check,
    copy: Copy,
    content_copy: Copy,
    close: X,
    x: X,
    menu: Menu,
    more_vert: MoreVertical,
    more_vertical: MoreVertical,
    edit: Pencil,
    pencil: Pencil,
    delete: Trash2,
    trash: Trash2,
    add: Plus,
    plus: Plus
};

const Button = ({ children, classes = '', variant = 'filled', color = 'primary', ...rest }) => {
    return (
        <button className={`btn ${variant} ${color} ${classes}`} {...rest}>
            {children}
        </button>
    );
};

Button.propTypes = {
    classes: PropTypes.string,
    variant: PropTypes.string,
    color: PropTypes.string,
    children: PropTypes.any
};

const IconBtn = ({ classes = '', icon, size = '', children, ...rest }) => {
    const iconSizeClass = size === 'small' ? 'w-3.5 h-3.5' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

    const renderContent = () => {
        if (children) return children;
        if (!icon) return null;
        if (typeof icon === 'string') {
            const IconComponent = ICON_MAP[icon.toLowerCase()];
            if (IconComponent) {
                return <IconComponent className={`${iconSizeClass} shrink-0`} />;
            }
            return <span className="text-[12px] font-medium">{icon}</span>;
        }
        if (typeof icon === 'function') {
            const IconComponent = icon;
            return <IconComponent className={`${iconSizeClass} shrink-0`} />;
        }
        return icon;
    };

    return (
        <button className={`icon-btn ${size} ${classes}`} {...rest}>
            {renderContent()}
        </button>
    );
};

IconBtn.propTypes = {
    classes: PropTypes.string,
    icon: PropTypes.any,
    size: PropTypes.string,
    children: PropTypes.any
};

const ExtendedFab = ({ href, text, classes = '', onClick, disabled, ...rest }) => {
    if (disabled) {
        return (
            <div className={`extended-fab opacity-50 cursor-not-allowed ${classes}`}>
                <Plus className="w-5 h-5 shrink-0" />
                <span className="truncate">{text}</span>
            </div>
        );
    }
    return (
        <Link to={href} className={`extended-fab ${classes}`} onClick={onClick} {...rest}>
            <Plus className="w-5 h-5 shrink-0" />
            <span className="truncate">{text}</span>
        </Link>
    );
};

ExtendedFab.propTypes = {
    href: PropTypes.string,
    text: PropTypes.string,
    classes: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool
};

export { Button, IconBtn, ExtendedFab };
