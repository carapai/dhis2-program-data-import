import React from "react";
import Table from '@dhis2/d2-ui-table';
import {withStyles} from "@material-ui/core/styles/index";
import {inject, observer} from "mobx-react";

const styles = theme => ({});

@inject('IntegrationStore')
@observer
class Step0 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;

        this.integrationStore.checkDataStore();
    }

    render() {
        return <div>
            <Table
                columns={['id', 'programName']}
                rows={this.integrationStore.mappings}
                contextMenuActions={this.integrationStore.multipleCma}
                primaryAction={this.integrationStore.useSaved}
            />
        </div>
    }
}

export default withStyles(styles)(Step0);