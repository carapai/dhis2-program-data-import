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
        return <div>
            <InputField
                label="Filter"
                type="text"
                fullWidth
                value={this.integrationStore.attributesFilter}
                onChange={(value) => this.integrationStore.filterAttributes(value)}
            />
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sortDirection={this.integrationStore.orderBy === 'displayName' ? this.integrationStore.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={this.integrationStore.orderBy === 'displayName'}
                                    direction={this.integrationStore.order}
                                    onClick={this.integrationStore.createSortHandler('displayName')}
                                >
                                    Attribute name
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell
                            sortDirection={this.integrationStore.orderBy === 'unique' ? this.integrationStore.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={this.integrationStore.orderBy === 'unique'}
                                    direction={this.integrationStore.order}
                                    onClick={this.integrationStore.createSortHandler('unique')}
                                >
                                    Unique
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell
                            sortDirection={this.integrationStore.orderBy === 'mandatory' ? this.integrationStore.order : false}>
                            <Tooltip
                                title="Sort"
                                placement="bottom-start"
                                enterDelay={300}>
                                <TableSortLabel
                                    active={this.integrationStore.orderBy === 'mandatory'}
                                    direction={this.integrationStore.order}
                                    onClick={this.integrationStore.createSortHandler('mandatory')}
                                >
                                    Mandatory
                                </TableSortLabel>
                            </Tooltip>
                        </TableCell>
                        <TableCell>Attribute mapping</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.integrationStore.programAttributes.slice(this.integrationStore.page * this.integrationStore.rowsPerPage,
                        this.integrationStore.page * this.integrationStore.rowsPerPage +
                        this.integrationStore.rowsPerPage).map(n => {
                        return (
                            <TableRow key={n.id} hover>
                                <TableCell>
                                    {n.displayName}
                                    {/*<pre>{JSON.stringify(n, null, 2)}</pre>*/}
                                </TableCell>
                                <TableCell>
                                    <Checkbox disabled checked={n.unique}/>
                                </TableCell>
                                <TableCell>
                                    <Checkbox disabled checked={n.mandatory}/>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        placeholder="Select one"
                                        value={this.integrationStore.attributes[n.id]}
                                        options={this.integrationStore.columns}
                                        onChange={this.integrationStore.attributeChange(n.id, n.unique, {
                                            valueType: n.valueType,
                                            options: n.optionSet ? n.optionSet.options : null
                                        })}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {/*<pre>{JSON.stringify(this.integrationStore.attributes, null, 2)}</pre>*/}

            <TablePagination
                component="div"
                count={this.integrationStore.programAttributes.length}
                rowsPerPage={this.integrationStore.rowsPerPage}
                page={this.integrationStore.page}
                backIconButtonProps={{
                    'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page',
                }}
                onChangePage={this.integrationStore.handleChangePage}
                onChangeRowsPerPage={this.integrationStore.handleChangeRowsPerPage}
            />

            <FormHelperText>
                When create new enrollments is checked all mandatory attributes must be mapped
            </FormHelperText>
        </div>
    }
}

export default withStyles(styles)(Step3);