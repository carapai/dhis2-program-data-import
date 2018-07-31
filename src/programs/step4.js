import React from "react";
import {withStyles} from "@material-ui/core/styles";
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormHelperText from "@material-ui/core/FormHelperText";
import {InputField} from '@dhis2/d2-ui-core';
import {inject, observer} from "mobx-react";

const styles = theme => ({
    block: {
        display: 'block'
    }
});

@inject('IntegrationStore')
@observer
class Step4 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        if (!this.integrationStore.dataPulled) {
            this.integrationStore.searchTrackedEntities();
        }
    }

    render() {
        const {classes} = this.props;
        return <div>
            {!this.integrationStore.dataPulled ? <LinearProgress/> : ''}
            {this.integrationStore.program.programStages.map(n => {
                let stageDataElements = n['programStageDataElements'];
                const v = this.integrationStore.dataElementsFilter[n.id];
                stageDataElements = stageDataElements.filter(item => {
                    const displayName = item.dataElement.displayName.toLowerCase();
                    return displayName.includes(v ? v : '')
                });
                return (
                    <ExpansionPanel key={n.id} expanded={this.integrationStore.expanded === n.id}
                                    onChange={this.integrationStore.handlePanelChange(n.id)}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>{n.displayName}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.block}>
                            <InputField
                                id={n.id}
                                label="Filter"
                                type="text"
                                fullWidth
                                value={this.integrationStore.dataElementsFilter[n.id]}
                                onChange={(value) => this.integrationStore.filterDataElements(n.id, value)}
                            />
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date Element Name</TableCell>
                                        <TableCell>Compulsory</TableCell>
                                        <TableCell>Data Element Mapping</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stageDataElements.slice(
                                        this.integrationStore.programPagingInfo[n.id]['page'] *
                                        this.integrationStore.programPagingInfo[n.id]['rowsPerPage'],
                                        this.integrationStore.programPagingInfo[n.id]['page'] *
                                        this.integrationStore.programPagingInfo[n.id]['rowsPerPage'] +
                                        this.integrationStore.programPagingInfo[n.id]['rowsPerPage']).map(s => {
                                        return (
                                            <TableRow key={s.dataElement.id} hover>
                                                <TableCell>
                                                    {s.dataElement.displayName}
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox disabled checked={s['compulsory']}/>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        placeholder="Select one"
                                                        value={this.integrationStore.dataElements[n.id][s.dataElement.id]}
                                                        options={this.integrationStore.columns}
                                                        onChange={this.integrationStore.dataElementChange(n.id, s.dataElement.id, {
                                                            valueType: s.dataElement.valueType,
                                                            options: s.dataElement.optionSet ? s.dataElement.optionSet.options : null
                                                        })}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {/*<pre>{JSON.stringify(this.integrationStore.dataElements, null, 2)}</pre>*/}
                            <TablePagination
                                component="div"
                                count={stageDataElements.length}
                                rowsPerPage={this.integrationStore.programPagingInfo[n.id]['rowsPerPage']}
                                page={this.integrationStore.programPagingInfo[n.id]['page']}
                                backIconButtonProps={{
                                    'aria-label': 'Previous Page',
                                }}
                                nextIconButtonProps={{
                                    'aria-label': 'Next Page',
                                }}
                                onChangePage={this.integrationStore.handleChangeElementPage(n.id)}
                                onChangeRowsPerPage={this.integrationStore.handleChangeElementRowsPerPage(n.id)}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                );
            })}

            <FormHelperText>
                Make sure that all compulsory data elements for a program stage are mapped, otherwise next button will
                be disabled
            </FormHelperText>
        </div>
    }
}

export default withStyles(styles)(Step4);