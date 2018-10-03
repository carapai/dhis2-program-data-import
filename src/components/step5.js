import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {Tab, Tabs} from '@dhis2/d2-ui-core';
import Badge from '@material-ui/core/Badge';
import {withStyles} from "@material-ui/core/styles";


import {inject, observer} from "mobx-react";


const styles = theme => ({
    margin: {
        margin: theme.spacing.unit * 2,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
});

@inject('IntegrationStore')
@observer
class Step5 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {classes} = this.props;
        const {program} = this.integrationStore;
        const {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate,
            conflicts,
            duplicates,
            errors
        } = program.processed;
        return (
            <div>
                <Tabs>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newTrackedEntityInstances.length}>New Entities</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {newTrackedEntityInstances.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {JSON.stringify(s, null, 2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newEnrollments.length}>New Enrollments</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {newEnrollments.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {JSON.stringify(s, null, 2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={newEvents.length}>New Events</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {newEvents.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {JSON.stringify(s, null, 2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={trackedEntityInstancesUpdate.length}>Entity
                        Updates</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {trackedEntityInstancesUpdate.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {JSON.stringify(s, null, 2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>

                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={eventsUpdate.length}>Event Updates</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eventsUpdate.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {JSON.stringify(s, null, 2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>

                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={conflicts.length}>Conflicts</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                    <TableCell>Column</TableCell>
                                    <TableCell>Conflict</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {conflicts.map((s, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {s.row}
                                            </TableCell>
                                            <TableCell>
                                                {s.column}
                                            </TableCell>
                                            <TableCell>
                                                {s.error}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={errors.length}>Errors</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                    <TableCell>Column</TableCell>
                                    <TableCell>Error</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((s, i) => {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell>
                                                {s.row}
                                            </TableCell>
                                            <TableCell>
                                                {s.column}
                                            </TableCell>
                                            <TableCell>
                                                {s.error}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                    <Tab label={<Badge className={classes.padding} color="secondary"
                                       badgeContent={duplicates.length}>Duplicates</Badge>}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Duplicated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {duplicates.map((s, k) => {
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>
                                                {s}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

export default withStyles(styles)(Step5);
