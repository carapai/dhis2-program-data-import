import React from "react";
import {withStyles} from "@material-ui/core/styles/index";
import {inject, observer} from "mobx-react/index";
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Badge from '@material-ui/core/Badge';
import {Tab, Tabs} from '@dhis2/d2-ui-core';


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
class Step6 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        IntegrationStore.program.create();
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {classes} = this.props;
        const {errors, successes, conflicts} = this.integrationStore.program.processedResponses;
        return <div>
            <LinearProgress variant="determinate" value={this.integrationStore.program.percentageInserted}/>
            {/*<pre>{JSON.stringify(this.integrationStore.processedResponses, null, 2)}</pre>*/}

            <Tabs>
                <Tab label={<Badge className={classes.padding} color="secondary"
                                   badgeContent={successes.length}>Successes</Badge>}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell>Imported</TableCell>
                                <TableCell>Updated</TableCell>
                                <TableCell>Deleted</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {successes.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {s.type}
                                        </TableCell>
                                        <TableCell>
                                            {s.reference}
                                        </TableCell>
                                        <TableCell>
                                            {s.imported}
                                        </TableCell>
                                        <TableCell>
                                            {s.updated}
                                        </TableCell>
                                        <TableCell>
                                            {s.deleted}
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
                                <TableCell>Affected</TableCell>
                                <TableCell>Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {conflicts.map((s, k) => {
                                return (
                                    <TableRow key={k}>
                                        <TableCell>
                                            {s.object}
                                        </TableCell>
                                        <TableCell>
                                            {s.value}
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
                                <TableCell>Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {errors.map((s, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {s.message}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Tab>
            </Tabs>
        </div>

    }
}

export default withStyles(styles)(Step6);
