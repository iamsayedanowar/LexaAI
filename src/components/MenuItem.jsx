// Modules

import PropTypes from "prop-types";

const MenuItem = ({ classes = '', labelText, ...rest }) => {
    return (
        <button className={`menu-item ${classes}`} {...rest}>
            {labelText}
            <div className="state-layer"></div>
        </button>
    );
};

MenuItem.propTypes = {
    classes: PropTypes.string,
    labelText: PropTypes.string,
};

export default MenuItem;