import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Dropzone from 'react-dropzone'
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Icon from '@material-ui/core/Icon';
import TextField from '@material-ui/core/TextField';
import {inject, observer} from "mobx-react";


const styles = theme => ({
    icon: {
        margin: theme.spacing.unit * 2,
    },
    iconHover: {
        margin: theme.spacing.unit * 2,
        '&:hover': {
            color: red[800],
        },
    },
});

@inject('IntegrationStore')
@observer
class Step2 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
        this.integrationStore.fetchPrograms();

        if (!this.integrationStore.isTracker) {
            this.integrationStore.toggleCanCreateEvents();
        }
    }

    render() {
        let progress = '';
        if (this.integrationStore.uploaded !== null) {
            progress = <LinearProgress variant="determinate" value={this.integrationStore.uploaded}/>;
        }
        const {classes} = this.props;

        return <table width="100%">
            <tbody>
            <tr>
                <td valign="top">
                    <ol>
                        <li>
                            {progress}
                            <table width="100%">
                                <tbody>
                                <tr>
                                    <td>Upload file to import</td>
                                    <td>OR &nbsp;&nbsp;&nbsp;Enter URL and pull</td>
                                </tr>
                                <tr>
                                    <td valign="top">
                                        <section>
                                            <div className="dropzone">
                                                <Dropzone onDrop={this.integrationStore.onDrop}>
                                                    <p align="center">Drop files here</p>
                                                    <p align="center"><Icon className={classes.icon} color="primary"
                                                                            style={{fontSize: 36}}>
                                                        add_circle
                                                    </Icon></p>
                                                </Dropzone>
                                            </div>
                                        </section>
                                    </td>
                                    <td valign="top">
                                        <TextField
                                            label="URL"
                                            type="text"
                                            fullWidth
                                            value={this.integrationStore.url}
                                            onChange={this.integrationStore.handelURLChange}
                                        />
                                        <br/>
                                        <br/>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={this.integrationStore.pullData}>
                                            Pull
                                        </Button>

                                        {/*<pre>{JSON.stringify(this.integrationStore.data, null, 2)}</pre>*/}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                    </ol>

                </td>
                <td valign="top" colSpan="2">
                    <ol start="2">
                        <li>
                            File Options
                            <table width="100%">
                                <tbody>
                                <tr>
                                    <td>
                                        <TextField
                                            label="Header row"
                                            type="number"
                                            fullWidth
                                            value={this.integrationStore.headerRow}
                                            onChange={this.integrationStore.handelHeaderRowChange}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <TextField
                                            label="Data start row"
                                            type="number"
                                            fullWidth
                                            value={this.integrationStore.dataStartRow}
                                            onChange={this.integrationStore.handelDataRowStartChange}
                                        />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                    </ol>

                    <ol start="3">
                        <li>
                            Organisation unit options
                            <table width="100%">
                                <tbody>
                                <tr>
                                    <td>
                                        <Select
                                            placeholder="Organisation unit column"
                                            value={this.integrationStore.orgUnitColumn}
                                            options={this.integrationStore.columns}
                                            onChange={this.integrationStore.handleOrgUnitSelectChange}
                                        />
                                        <FormHelperText>For new tracked entities and events, this column will be
                                            used as organisation unit</FormHelperText>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Select
                                            placeholder="Identifier scheme"
                                            value={this.integrationStore.orgUnitStrategy}
                                            options={this.integrationStore.items}
                                            onChange={this.integrationStore.handleOrgUnitStrategySelectChange}
                                        />
                                        <FormHelperText>Organisation units will searched using uid by default
                                            please change if your organisation unit column is not
                                            uid</FormHelperText>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <td valign="top" colSpan="3">
                    <ol start="4">
                        <li>
                            Advanced Options
                        </li>
                    </ol>
                </td>
            </tr>

            <tr>
                <td valign="top" className={classes.space}>
                    Events
                </td>
                <td valign="top" colSpan="2">
                    Enrollments
                </td>
            </tr>

            <tr>
                <td valign="top">
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={!this.integrationStore.isTracker}
                                checked={this.integrationStore.createNewEvents}
                                onChange={this.integrationStore.handleCreateNewEventsCheck}
                            />}
                        label="Create new event if not found"
                    />
                </td>
                <td valign="top" colSpan="2">
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={!this.integrationStore.isTracker}
                                checked={this.integrationStore.createNewEnrollments}
                                onChange={this.integrationStore.handleCreateNewEnrollmentsCheck}
                            />}
                        label="Create new enrollment if not found"
                    />
                </td>
            </tr>
            <tr>
                <td valign="top" width="50%">
                    <Select
                        placeholder="Event date column"
                        value={this.integrationStore.eventDateColumn}
                        options={this.integrationStore.columns}
                        // disabled={!createNewEvents}
                        onChange={this.integrationStore.handleEventDateColumnSelectChange}
                    />
                    <FormHelperText>Program stage events will updated or created based on this column. Non
                        repeatable with latest values while repeatable with updates if same or new otherwise.
                        Should be a valid date</FormHelperText>
                </td>
                <td valign="top" width="25%">
                    <Select
                        placeholder="Enrollment date column"
                        value={this.integrationStore.enrollmentDateColumn}
                        disabled={!this.integrationStore.createNewEnrollments}
                        options={this.integrationStore.columns}
                        onChange={this.integrationStore.handleEnrollmentDateColumnSelectChange}
                    />
                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                </td>
                <td width="25%">
                    <Select
                        placeholder="Incident date column"
                        value={this.integrationStore.incidentDateColumn}
                        disabled={!this.integrationStore.createNewEnrollments}
                        options={this.integrationStore.columns}
                        onChange={this.integrationStore.handleIncidentDateColumnSelectChange}
                    />
                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                </td>
            </tr>
            </tbody>
        </table>
    }
}

export default withStyles(styles)(Step2);