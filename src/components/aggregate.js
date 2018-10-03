import React from 'react';
import '@dhis2/d2-ui-core/build/css/Table.css';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {inject, observer} from "mobx-react";


const styles = theme => ({
    card: {
        margin: '5px'
    },
    button: {
        marginRight: theme.spacing.unit,
    },
    instructions: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    },
    space: {
        marginLeft: '5px;'
    },
    table: {
        width: '100%',
    },
    hidden: {
        display: 'none'
    },
    block: {
        display: 'block'
    }
});

@inject('IntegrationStore')
@observer
class Aggregate extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {d2, IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.setD2(d2);
    }

    render() {
        return (
            <div>
                Coming soon
            </div>
        );
    }
}

Aggregate.propTypes = {
    d2: PropTypes.object.isRequired,
    classes: PropTypes.object,
};

export default withStyles(styles)(Aggregate);
