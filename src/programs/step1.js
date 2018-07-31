import React from "react";
import Table from '@dhis2/d2-ui-table';
import LinearProgress from '@material-ui/core/LinearProgress';
import {withStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";

const styles = theme => ({});

@inject('IntegrationStore')
@observer
class Step1 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.toggleLoading(true);
        this.integrationStore.fetchPrograms();
    }

    render() {
        let progress = '';
        if (this.integrationStore.loading) {
            progress = <LinearProgress variant="indeterminate"/>;
        }
        return <div>
            {progress}
            <Table
                columns={['displayName', 'programType', 'lastUpdated']}
                rows={this.integrationStore.programs}
                contextMenuActions={this.integrationStore.multipleCma}
                primaryAction={this.integrationStore.executeEditIfAllowed}
            />
        </div>
    }
}

export default withStyles(styles)(Step1);