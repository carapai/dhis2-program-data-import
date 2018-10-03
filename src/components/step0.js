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

    componentDidMount() {
        if (this.integrationStore.schedulerEnabled) {
            this.interval = setInterval(() => this.integrationStore.runAll(), 30 * 1000);
        }
    }

    componentWillUnmount() {
        if (this.integrationStore.schedulerEnabled) {
            clearInterval(this.interval);
        }
    }

    render() {
        return <div>
            <Table
                columns={['mappingId', 'displayName', 'lastRun']}
                rows={this.integrationStore.mappings}
                contextMenuActions={this.integrationStore.tableActions}
                primaryAction={this.integrationStore.useSaved}
            />
        </div>
    }
}

export default withStyles(styles)(Step0);
