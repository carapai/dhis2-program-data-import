import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from '@material-ui/core/TableSortLabel';
import FormHelperText from "@material-ui/core/FormHelperText";
import Tooltip from '@material-ui/core/Tooltip';
import {InputField} from '@dhis2/d2-ui-core';

import {inject, observer} from "mobx-react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const styles = theme => ({});

@inject('IntegrationStore')
@observer
class Step3 extends React.Component {

    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    render() {
        const {classes} = this.props;
        const {program} = this.integrationStore;
        return <div>
            <InputField
                label="Filter"
                type="text"
                fullWidth
                value={program.attributesFilter}
                onChange={(value) => program.filterAttributes(value)}
            />
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sortDirection={program.orderBy === 'displayName' ? program.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={program.orderBy === 'displayName'}
                                    direction={program.order}
                                    onClick={program.createSortHandler('displayName')}
                                >
                                    Attribute name
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell
                            sortDirection={program.orderBy === 'unique' ? program.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={program.orderBy === 'unique'}
                                    direction={program.order}
                                    onClick={program.createSortHandler('unique')}
                                >
                                    Unique
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell
                            sortDirection={program.orderBy === 'mandatory' ? program.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={program.orderBy === 'mandatory'}
                                    direction={program.order}
                                    onClick={program.createSortHandler('mandatory')}
                                >
                                    Mandatory
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell>Attribute mapping</TableCell>
                        <TableCell>Options Mapping</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {program.programAttributes.map(n => {
                        let de = '';
                        if (n.trackedEntityAttribute.optionSet) {
                            de = <div>
                                <Button onClick={n.handleClickOpen}>Map Options</Button>

                                <Dialog onClose={n.handleClose} open={n.open}
                                        aria-labelledby="simple-dialog-title">
                                    <DialogTitle id="simple-dialog-title">Mapping options</DialogTitle>
                                    <div>
                                        <Table className={classes.table}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Option
                                                    </TableCell>
                                                    <TableCell>
                                                        Value
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {n.trackedEntityAttribute.optionSet.options.map(o => {
                                                    return (
                                                        <TableRow key={o.code} hover>
                                                            <TableCell>
                                                                {o.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <InputField
                                                                    label="Value"
                                                                    type="text"
                                                                    value={o.value}
                                                                    onChange={(value) => o.setValue(value)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                        <List>
                                            <ListItem button onClick={() => n.handleClose()}>
                                                {/*<ListItemAvatar>
                                                    <Avatar>
                                                        <AddIcon/>
                                                    </Avatar>
                                                </ListItemAvatar>*/}
                                                <ListItemText primary="Close"/>
                                            </ListItem>
                                        </List>
                                    </div>
                                </Dialog>
                            </div>;
                        }
                        return (
                            <TableRow key={n.trackedEntityAttribute.id} hover>
                                <TableCell>
                                    {n.trackedEntityAttribute.displayName}
                                    {/*<pre>{JSON.stringify(n, null, 2)}</pre>*/}
                                </TableCell>
                                <TableCell>
                                    <Checkbox disabled checked={n.trackedEntityAttribute.unique}/>
                                </TableCell>
                                <TableCell>
                                    <Checkbox disabled checked={n.mandatory}/>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        placeholder="Select one"
                                        value={n.column}
                                        options={program.columns}
                                        onChange={n.setColumn}
                                    />
                                </TableCell>

                                <TableCell>
                                    {de}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {/*<pre>{JSON.stringify(this.integrationStore.attributes, null, 2)}</pre>*/}

            <TablePagination
                component="div"
                count={program.allAttributes}
                rowsPerPage={program.rowsPerPage}
                page={program.page}
                backIconButtonProps={{
                    'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page',
                }}
                onChangePage={program.handleChangePage}
                onChangeRowsPerPage={program.handleChangeRowsPerPage}
            />

            <FormHelperText>
                When create new enrollments is checked all mandatory attributes must be mapped
            </FormHelperText>
        </div>
    }
}

export default withStyles(styles)(Step3);
