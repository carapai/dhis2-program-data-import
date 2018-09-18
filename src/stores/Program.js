import {action, computed, observable, toJS} from 'mobx';
import _ from 'lodash';
import moment from 'moment';
import {generateUid} from 'd2/lib/uid';

import axios from 'axios';

class Program {
    @observable lastUpdated;
    @observable name;
    @observable id;
    @observable programType;
    @observable displayName;
    @observable programStages = [];
    @observable programTrackedEntityAttributes = [];
    @observable trackedEntityType;
    @observable mappingId = 1;

    @observable columns = [];
    @observable orgUnitColumn = '';
    @observable orgUnitStrategy = {value: 'auto', label: 'auto'};
    @observable organisationUnits = [];

    @observable headerRow = 1;
    @observable dataStartRow = 2;

    @observable createNewEvents = false;
    @observable createNewEnrollments = false;
    @observable eventDateColumn = '';
    @observable enrollmentDateColumn = '';
    @observable incidentDateColumn = '';

    @observable url = '';
    @observable dateFilter = '';
    @observable lastRun = '';

    @observable uploaded = 0;
    @observable uploadMessage = '';

    @observable page = 0;
    @observable rowsPerPage = 5;

    @observable orderBy = 'mandatory';
    @observable order = 'desc';
    @observable attributesFilter = '';

    @observable data;

    @observable trackedEntityInstances = [];
    @observable d2;
    @observable dataPulled = false;

    @observable responses = [];

    @observable increment = 0;
    @observable percentageInserted = 0;

    constructor(lastUpdated, name, id, programType, displayName, programStages, programTrackedEntityAttributes) {
        this.lastUpdated = lastUpdated;
        this.name = name;
        this.id = id;
        this.programType = programType;
        this.displayName = displayName;
        this.programStages = programStages;
        this.programTrackedEntityAttributes = programTrackedEntityAttributes;
    }

    @action
    setD2 = (d2) => {
        this.d2 = d2;
    };

    @action toggleDataPull() {
        this.dataPulled = !this.dataPulled;
    }


    @action
    handelHeaderRowChange = value => this.headerRow = value;

    @action
    handelDataRowStartChange = value => this.dataStartRow = value;

    @action
    handleOrgUnitSelectChange = value => this.orgUnitColumn = value;

    @action
    handleOrgUnitStrategySelectChange = value => this.orgUnitStrategy = value;

    @action
    handleCreateNewEventsCheck = event => {
        this.createNewEvents = event.target.checked;

        if (!this.createNewEvents) {
            this.eventDateColumn = null;
        }
    };

    @action
    handleCreateNewEnrollmentsCheck = event => {
        this.createNewEnrollments = event.target.checked;

        if (!this.createNewEnrollments) {
            this.enrollmentDateColumn = null;
            this.incidentDateColumn = null;
        }
    };

    @action
    handleEventDateColumnSelectChange = value => this.eventDateColumn = value;

    @action
    handleEnrollmentDateColumnSelectChange = value => this.enrollmentDateColumn = value;

    @action
    handleIncidentDateColumnSelectChange = value => this.incidentDateColumn = value;

    @action
    handelURLChange = value => this.url = value;

    @action
    handelDateFilterChange = value => this.dateFilter = value;

    @action
    handelScheduleChange = value => this.schedule = value.target.value;

    @action
    scheduleTypeChange = () => action(value => {
        this.scheduleType = value.value;
    });

    @action
    onDrop = (accepted, rejected) => {
        const fileReader = new FileReader();
        if (accepted.length > 0) {
            this.uploadMessage = '';
            const f = accepted[0];
            const fileName = f.name.split('.');
            const extension = fileName.pop();

            fileReader.onloadstart = (this.onLoadStart);

            fileReader.onprogress = (this.onProgress);

            fileReader.onload = (ex) => {
                const data = extension === 'csv' ? this.CSVToArray(fileReader.result, ',') :
                    this.processJsonData(fileReader.result);
                let columns = _.keys(data[0]);
                columns = columns.map(v => {
                    return {label: v, value: v};
                });
                this.setColumns(columns);
                this.setData(data);
            };

            fileReader.onloadend = (this.onLoadEnd);
            fileReader.readAsText(f);
        } else if (rejected.length > 0) {
            this.uploadMessage = 'Only CSV supported'
        }

    };

    @action
    pullData = () => {
        if (this.url) {
            axios.get(this.url).then(action(response => {
                const {data} = response;
                if (response.status === 200) {
                    let columns = _.keys(data[0]);
                    columns = columns.map(v => {
                        return {label: v, value: v};
                    });
                    this.setColumns(columns);
                    this.setData(data);
                }

            }))
        }
    };

    @action
    onProgress = ev => {
        this.uploaded = (ev.loaded * 100) / ev.total
    };

    @action
    onLoadStart = ev => {
        this.uploaded = 0
    };

    @action
    onLoadEnd = ev => {
        this.uploaded = null
    };

    @action
    handleChangePage = (event, page) => this.page = page;

    @action
    handleChangeRowsPerPage = event => this.rowsPerPage = event.target.value;

    @action
    setTrackedEntityType = trackedEntityType => {
        this.trackedEntityType = trackedEntityType;
    };

    @action createSortHandler = property => event => {
        const orderBy = property;
        let order = 'desc';

        if (this.orderBy === property && this.order === 'desc') {
            order = 'asc';
        }
        this.setOrderBy(orderBy);
        this.setOrder(order);

    };

    @action setOrder = val => this.order = val;
    @action setOrderBy = val => this.orderBy = val;
    @action setOrganisationUnits = val => this.organisationUnits = val;
    @action setOrgUnitStrategy = val => this.orgUnitStrategy = val;
    @action setHeaderRow = val => this.headerRow = val;
    @action setDataStartRow = val => this.dataStartRow = val;
    @action setCreateNewEvents = val => this.createNewEvents = val;
    @action setCreateNewEnrollments = val => this.createNewEnrollments = val;
    @action setEventDateColumn = val => this.eventDateColumn = val;
    @action setEnrollmentDateColumn = val => this.enrollmentDateColumn = val;
    @action setIncidentDateColumn = val => this.incidentDateColumn = val;
    @action setUrl = val => this.url = val;
    @action setDateFilter = val => this.dateFilter = val;
    @action setLastRun = val => this.lastRun = val;
    @action setUploaded = val => this.uploaded = val;
    @action setUploadMessage = val => this.uploadMessage = val;
    @action setOrgUnitColumn = val => this.orgUnitColumn = val;
    @action setMappingId = val => this.mappingId = val;
    @action setColumns = data => this.columns = data;
    @action setData = data => this.data = data;

    @action
    filterAttributes = attributesFilter => {
        attributesFilter = attributesFilter.toLowerCase();
        this.attributesFilter = attributesFilter;
    };

    @action
    searchTrackedEntities = () => {
        const api = this.d2.Api.getApi();
        if (this.uniqueIds) {
            this.uniqueIds.forEach(uniqueId => {
                return api.get('trackedEntityInstances', {
                    paging: false,
                    ouMode: 'ALL',
                    filter: this.uniqueAttribute + ':IN:' + uniqueId,
                    fields: 'trackedEntityInstance,orgUnit,attributes[attribute,value],enrollments[enrollment,program,' +
                        'trackedEntityInstance,trackedEntityType,enrollmentDate,incidentDate,orgUnit,events[program,trackedEntityInstance,event,' +
                        'eventDate,programStage,orgUnit,dataValues[dataElement,value]]]'
                }).then(action(instances => {
                    const {trackedEntityInstances} = instances;
                    this.trackedEntityInstances = [...this.trackedEntityInstances, ...trackedEntityInstances];
                }), action(e => {
                    console.log(e)
                }));
            });
            this.toggleDataPull();
        }
    };

    @action.bound
    insertSuccess(response) {
        this.percentageInserted = this.percentageInserted + this.increment;
        this.responses = [...this.responses, response];
    }

    @action.bound
    insertError(response) {
        this.percentageInserted = this.percentageInserted + this.increment;
        this.responses = [...this.responses, response];
    }

    @action
    insertTrackedEntityInstance = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('trackedEntityInstances', data, {}).then(this.insertSuccess, this.insertError);
    };

    @action
    insertEnrollment = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('enrollments', data, {}).then(this.insertSuccess, this.insertError);
    };

    @action
    insertEvent = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('events', data, {}).then(this.insertSuccess, this.insertError);
    };

    @action create = () => {
        const {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate
        } = this.processed;

        const totalInserts = newTrackedEntityInstances.length + newEnrollments.length +
            trackedEntityInstancesUpdate.length + newEvents.length + eventsUpdate.length;

        if (totalInserts !== 0) {
            this.increment = 100 / totalInserts;

            if (this.isTracker) {
                const pEvents = _.groupBy(newEvents, 'trackedEntityInstance');
                const pEnrollments = _.groupBy(newEnrollments, 'trackedEntityInstance');

                if (newTrackedEntityInstances.length > 0) {
                    newTrackedEntityInstances.forEach(trackedEntityInstance => {
                        let foundEnrollments = pEnrollments[trackedEntityInstance.trackedEntityInstance];
                        let foundEvents = pEvents[trackedEntityInstance.trackedEntityInstance];
                        let enrollment = null;

                        if (foundEvents) {
                            enrollment = {...foundEnrollments[0], events: foundEvents};
                        } else {
                            enrollment = {...foundEnrollments[0]}
                        }


                        if (foundEnrollments) {
                            trackedEntityInstance.enrollments = [enrollment];
                            this.insertTrackedEntityInstance(trackedEntityInstance);
                            this.percentageInserted = this.percentageInserted + (this.increment * (foundEvents.length + 1));
                        } else {
                            this.insertEnrollment(enrollment);
                        }

                    });
                } else if (newEnrollments.length > 0) {
                    const pEvents = _.groupBy(newEvents, 'trackedEntityInstance');
                    newEnrollments.forEach(enrollment => {
                        const foundEvents = pEvents[enrollment.trackedEntityInstance];
                        if (foundEvents) {
                            enrollment.events = foundEvents;
                            this.insertEnrollment(enrollment);
                        } else {
                            newEvents.forEach(event => {
                                this.insertEvent(event);
                            })
                        }
                    });
                } else if (newEvents.length > 0) {
                    newEvents.forEach(event => {
                        this.insertEvent(event);
                    });
                }

                trackedEntityInstancesUpdate.forEach(trackedEntityInstance => {
                    this.insertTrackedEntityInstance(trackedEntityInstance);
                });

                eventsUpdate.forEach(event => {
                    this.insertEvent(event);
                });
            } else {
                newEvents.forEach(event => {
                    this.insertEvent(event);
                });

                eventsUpdate.forEach(event => {
                    this.insertEvent(event);
                });
            }
        }
    };

    @action saveMapping = mappings => {
        const mapping = _.findIndex(mappings, {mappingId: this.mappingId});

        mappings = mappings.map(p => {
            return p.canBeSaved;
        });

        if (mapping !== -1) {
            mappings.splice(mappings, 1, toJS(this.canBeSaved));
        } else {
            mappings = [...mappings, toJS(this.canBeSaved)]
        }

        this.d2.dataStore.get('bridge').then(action(namespace => {
            namespace.set('mappings', mappings);
        }), this.fetchProgramsError);
    };

    @action.bound
    fetchProgramsError(error) {
        this.error = "error"
    }

    @action scheduleProgram = () => {
        this.pullData();
        this.lastRun = new Date();
        console.log(this.processed);
    };

    processJsonData = (json) => {
        return JSON.parse(json);
    };

    @computed get canBeSaved() {
        return _.pick(this,
            [
                'lastUpdated',
                'name',
                'id',
                'programType',
                'displayName',
                'programStages',
                'programTrackedEntityAttributes',
                'trackedEntityType',
                'mappingId',
                'columns',
                'orgUnitColumn',
                'orgUnitStrategy',
                'organisationUnits',
                'headerRow ',
                'dataStartRow',
                'createNewEvents',
                'createNewEnrollments',
                'eventDateColumn',
                'enrollmentDateColumn',
                'incidentDateColumn',
                'url',
                'dateFilter',
                'lastRun',
                'uploaded',
                'uploadMessage'
            ])
    }

    @computed get processedResponses() {
        let errors = [];
        let conflicts = [];
        let successes = [];

        this.responses.forEach(response => {
            if (response['httpStatusCode'] === 200) {
                const {importSummaries} = response['response'];
                importSummaries.forEach(importSummary => {
                    const {importCount, reference, enrollments, href} = importSummary;
                    const url = this.getLocation(href);
                    const pathNames = url.pathname.split('/');
                    const type = pathNames.slice(-2, -1)[0];
                    successes = [...successes, {...importCount, type, reference}];
                    if (enrollments) {
                        const {importSummaries} = enrollments;
                        if (enrollments.length > 0) {
                            importSummaries.forEach(importSummary => {
                                const {status, importCount, reference, events} = importSummary;
                                if (status === 'SUCCESS') {
                                    successes = [...successes, {...importCount, type: 'enrollments', reference}];
                                    if (events) {
                                        const {importSummaries} = events;
                                        importSummaries.forEach(importSummary => {
                                            const {status, importCount, reference} = importSummary;
                                            if (status === 'SUCCESS') {
                                                successes = [...successes, {...importCount, type: 'events', reference}];
                                            } else {
                                                console.log(toJS(importSummary));
                                            }
                                        });
                                    }
                                } else {
                                    console.log(toJS(importSummary));
                                }
                            })
                        }
                    }
                });
            } else if (response['httpStatusCode'] === 409) {
                _.forEach(response['response']['importSummaries'], (s) => {
                    _.forEach(s['conflicts'], (conflict) => {
                        conflicts = [...conflicts, {...conflict}];
                    });
                    if (s['href']) {
                        successes = [...successes, {href: s['href']}];
                    }
                });
            } else if (response['httpStatusCode'] === 500) {
                errors = [...errors, {...response['error']}];
            }
        });
        return {errors, successes, conflicts}
    }


    @computed get isTracker() {
        return this.programType === 'WITH_REGISTRATION';
    }


    @computed get programAttributes() {
        const sorter = this.order === 'desc'
            ? (a, b) => (b[this.orderBy] < a[this.orderBy] ? -1 : 1)
            : (a, b) => (a[this.orderBy] < b[this.orderBy] ? -1 : 1);

        return this.programTrackedEntityAttributes.filter(item => {
            const displayName = item.trackedEntityAttribute.displayName.toLowerCase();
            return displayName.includes(this.attributesFilter)
        }).sort(sorter).slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage);
    }

    @computed get allAttributes() {
        return this.programTrackedEntityAttributes.length;
    }


    @computed get uniqueAttribute() {
        const unique = this.programTrackedEntityAttributes.filter(a => {
            return a.trackedEntityAttribute.unique;
        });

        if (unique.length > 0) {
            return unique[0]['trackedEntityAttribute']['id']
        }

        return null;

    }


    @computed get uniqueColumn() {
        const unique = this.programTrackedEntityAttributes.filter(a => {
            return a.trackedEntityAttribute.unique && a.column;
        });

        if (unique.length > 0) {
            return unique[0]['column']['value'];
        }

        return null;
    }

    @computed get uniqueIds() {
        if (this.uniqueColumn !== null) {
            const foundIds = this.data.map(d => {
                return d[this.uniqueColumn];
            });
            return _.chunk(foundIds, 50).map(ids => ids.join(';'));
        }
        return [];
    }

    @computed get searchedInstances() {
        const entities = this.trackedEntityInstances.map(e => {
            const uniqueAttribute = _.find(e.attributes, {attribute: this.uniqueAttribute});
            const val = uniqueAttribute ? uniqueAttribute['value'] : null;
            return {
                ...e,
                ..._.fromPairs([[this.uniqueAttribute, val]])
            }
        });
        return _.groupBy(entities, this.uniqueAttribute);
    }

    @computed get mandatoryAttributesMapped() {
        const allMandatory = this.programTrackedEntityAttributes.filter(item => {
            return item.mandatory && !item.column;
        });

        return allMandatory.length === 0;
    }

    @computed get compulsoryDataElements() {
        let compulsory = [];
        this.programStages.forEach(ps => {

            const pse = ps.programStageDataElements.filter(item => {
                return item.compulsory;
            }).map(e => {
                return e.dataElement.id
            });

            const me = ps.programStageDataElements.filter(item => {
                return item.compulsory && item.column && item.column.value;
            }).map(e => {
                return e.dataElement.id
            });

            let mapped = false;

            if (me.length === 0) {
                mapped = true;
            } else if (this.createNewEvents && pse.length > 0 && me.length > 0 && _.difference(pse, me).length === 0) {
                mapped = true;
            } else if (this.createNewEvents && pse.length > 0 && me.length > 0 && _.difference(pse, me).length > 0) {
                mapped = false;
            }
            compulsory = [...compulsory, {
                mapped
            }]
        });
        return _.every(compulsory, 'mapped');
    }


    @computed get processed() {
        let data = this.data;

        let eventsUpdate = [];
        let trackedEntityInstancesUpdate = [];

        let newEvents = [];
        let newEnrollments = [];
        let newTrackedEntityInstances = [];

        let duplicates = [];
        let conflicts = [];
        let errors = [];

        if (this.uniqueColumn) {
            let clients = _.groupBy(data, this.uniqueColumn);
            let newClients = [];
            _.forOwn(clients, (data, client) => {
                const previous = this.searchedInstances[client] || [];
                newClients = [...newClients, {client, data, previous}];
            });
            data = newClients;
        } else {
            data = data.map((data, i) => {
                return {data: [data], client: i + 1, previous: []};
            });
        }

        data.forEach(client => {
            let events = [];
            let allAttributes = [];
            let currentData = client.data;
            let enrollmentDates = [];
            let orgUnits = [];
            currentData.forEach(d => {
                this.programStages.forEach(stage => {
                    let dataValues = [];
                    const date = moment(d[this.eventDateColumn.value], ['YYYY-MM-DD', "DD/MM/YYYY", "MM/DD/YYYY"]);
                    const mapped = stage.programStageDataElements.filter(e => {
                        return e.column && e.column.value
                    });
                    if (date.isValid() && mapped.length) {
                        const eventDate = date.format('YYYY-MM-DD');
                        mapped.forEach(e => {
                            const value = d[e.column.value];
                            const type = e.dataElement.valueType;
                            const optionsSet = e.dataElement.optionSet;
                            const validatedValue = this.validateValue(type, value, optionsSet);
                            if (value !== '' && validatedValue !== null) {
                                dataValues = [...dataValues, {
                                    dataElement: e.dataElement.id,
                                    value: validatedValue
                                }];
                            } else if (value === '') {
                            } else {
                                conflicts = [...conflicts, {
                                    error: optionsSet === null ? 'Invalid value ' + value + ' for value type ' + type :
                                        'Invalid value: ' + value + ', expected: ' + _.map(optionsSet.options, o => {
                                            return o.code
                                        }).join(','),
                                    row: client.client,
                                    column: e.column.value
                                }]
                            }
                        });

                        const event = {
                            dataValues,
                            eventDate,
                            programStage: stage.id,
                            program: this.id,
                        };

                        events = [...events, event];
                    }
                });

                const mappedAttributes = this.programTrackedEntityAttributes.filter(a => {
                    return a.column && a.column.value
                });

                let attributes = [];

                mappedAttributes.forEach(a => {
                    const value = d[a.column.value];
                    const type = a.valueType;
                    const optionsSet = a.trackedEntityAttribute.optionSet;
                    const validatedValue = this.validateValue(type, value, optionsSet);
                    if (value !== '' && validatedValue !== null) {
                        attributes = [...attributes, {attribute: a.trackedEntityAttribute.id, value: validatedValue}]
                    } else if (value === '') {
                        // console.log('Ignoring');
                    } else {
                        conflicts = [...conflicts, {
                            error: !optionsSet ? 'Invalid value ' + value + ' for value type ' + type :
                                'Invalid value ' + value + ' choose from options: ' +
                                _.map(optionsSet.options, o => o.code).join(','),
                            row: client.client,
                            column: a.column.value
                        }]
                    }

                });

                if (attributes.length > 0) {
                    allAttributes = [...allAttributes, attributes];
                }

                if (this.isTracker && this.enrollmentDateColumn && this.incidentDateColumn) {
                    const enrollmentDate = moment(d[this.enrollmentDateColumn.value], ['YYYY-MM-DD', "DD/MM/YYYY", "MM/DD/YYYY"]);
                    const incidentDate = moment(d[this.incidentDateColumn.value], ['YYYY-MM-DD', "DD/MM/YYYY", "MM/DD/YYYY"]);

                    if (enrollmentDate.isValid() && incidentDate.isValid()) {
                        enrollmentDates = [...enrollmentDates, {
                            enrollmentDate: enrollmentDate.format('YYYY-MM-DD'),
                            incidentDate: incidentDate.format('YYYY-MM-DD')
                        }]
                    }
                }

                if (this.orgUnitColumn !== '') {
                    orgUnits = [...orgUnits, d[this.orgUnitColumn.value]]
                }
            });

            const groupedEvents = _.groupBy(events, 'programStage');

            if (client.previous.length > 1) {
                duplicates = [...duplicates, client.previous]
            } else if (client.previous.length === 1) {

                client.previous.forEach(p => {
                    const nAttributes = _.differenceWith(allAttributes[0], p['attributes'], _.isEqual);
                    let enrollments = p['enrollments'];
                    if (nAttributes.length > 0) {
                        const mergedAttributes = _.unionBy(allAttributes[0], p['attributes'], 'attribute');
                        let tei = {
                            ..._.pick(p, ['orgUnit', 'trackedEntityInstance', 'trackedEntityType']),
                            attributes: mergedAttributes
                        };
                        trackedEntityInstancesUpdate = [...trackedEntityInstancesUpdate, tei];
                    }

                    events = events.map(e => {
                        return {
                            ...e,
                            trackedEntityInstance: p['trackedEntityInstance'],
                            orgUnit: p['orgUnit']
                        }
                    });
                    const enrollmentIndex = _.findIndex(enrollments, {program: this.id});
                    if (enrollmentIndex === -1 && enrollmentDates.length > 0) {
                        let enroll = {
                            program: this.id,
                            orgUnit: p['orgUnit'],
                            trackedEntityInstance: p['trackedEntityInstance'],
                            ...enrollmentDates[0]
                        };
                        newEnrollments = [...newEnrollments, enroll];
                        if (this.createNewEvents) {
                            _.forOwn(groupedEvents, (evs, stage) => {
                                const stageInfo = _.find(this.programStages, {id: stage});
                                const {repeatable} = stageInfo;

                                if (!repeatable) {
                                    const ev = _.maxBy(evs, 'eventDate');
                                    if (ev.dataValues.length > 0) {
                                        newEvents = [...newEvents, ev];
                                    }
                                } else {

                                    newEvents = [...newEvents, ...evs];
                                }
                            });
                        } else {
                            console.log('Ignoring not creating new events');
                        }
                        enrollments = [...enrollments, enroll];
                        p = {...p, enrollments}
                    } else if (enrollmentIndex === -1 && enrollmentDates.length === 0) {
                        console.log('Ignoring new enrollments');
                    } else if (enrollmentIndex !== -1) {
                        let enrollment = enrollments[enrollmentIndex];
                        let enrollmentEvents = enrollment['events'];

                        _.forOwn(groupedEvents, (evs, stage) => {
                            const stageInfo = _.find(this.programStages, {id: stage});
                            const {repeatable} = stageInfo;
                            if (repeatable) {
                                /*evs.forEach(e => {
                                    const eventIndex = _.findIndex(enrollmentEvents, {
                                        programStage: stage,
                                        eventDate: e['eventDate']
                                    });

                                    if (eventIndex !== -1) {
                                        const stageEvent = enrollmentEvents[eventIndex];
                                        const merged = _.unionBy(e['dataValues'], stageEvent['dataValues'], 'dataElement');

                                        const differingElements = _.differenceWith(e['dataValues'], stageEvent['dataValues'], _.isEqual);

                                        if (merged.length > 0 && differingElements.length > 0) {
                                            const mergedEvent = {...stageEvent, dataValues: merged};
                                            eventsUpdate = [...eventsUpdate, mergedEvent];
                                            events[eventIndex] = mergedEvent;
                                        }
                                    } else if (e.dataValues.length > 0) {
                                        e = {
                                            ...e,
                                            program: this.id,
                                            programStage: stage,
                                            trackedEntityInstance: p['trackedEntityInstance'],
                                            orgUnit: enrollment['orgUnit'],
                                        };
                                        newEvents = [...newEvents, e];
                                    }
                                })*/

                                newEvents = [...newEvents, ...evs];

                            } else {
                                let foundEvent = _.find(enrollmentEvents, {programStage: stage});
                                let max = _.maxBy(evs, 'eventDate');
                                if (foundEvent) {
                                    const merged = _.unionBy(max['dataValues'], foundEvent['dataValues'], 'dataElement');
                                    const differingElements = _.differenceWith(max['dataValues'], foundEvent['dataValues'], _.isEqual);
                                    if (merged.length > 0 && differingElements.length > 0) {
                                        const mergedEvent = {...foundEvent, dataValues: merged};
                                        eventsUpdate = [...eventsUpdate, mergedEvent];
                                    }
                                } else {
                                    newEvents = [...newEvents, max];
                                }
                            }
                        });
                    }
                });
            } else {
                orgUnits = _.uniq(orgUnits);
                let orgUnit;
                if (orgUnits.length > 1) {
                    errors = [...errors, {
                        error: 'Entity belongs to more than one organisation unit',
                        row: client.client
                    }]
                } else if (orgUnits.length === 1) {
                    orgUnit = this.searchOrgUnit(orgUnits[0]);
                    if (orgUnit) {
                        if (enrollmentDates.length > 0 && this.isTracker && this.createNewEnrollments) {
                            const trackedEntityInstance = generateUid();
                            let tei = {
                                orgUnit: orgUnit.id,
                                attributes: allAttributes[0],
                                trackedEntityInstance,
                                trackedEntityType: this.trackedEntityType.id,
                            };
                            newTrackedEntityInstances = [...newTrackedEntityInstances, tei];

                            let enrollment = {
                                orgUnit: orgUnit.id,
                                program: this.id,
                                trackedEntityInstance,
                                ...enrollmentDates[0],
                                enrollment: generateUid()
                            };

                            if (this.createNewEvents) {
                                _.forOwn(groupedEvents, (evs, stage) => {
                                    const stageInfo = _.find(this.programStages, {id: stage});
                                    const {repeatable} = stageInfo;
                                    evs = evs.map(e => {
                                        return {
                                            ...e,
                                            orgUnit: orgUnit.id,
                                            event: generateUid(),
                                            trackedEntityInstance
                                        }
                                    });

                                    if (!repeatable) {
                                        newEvents = [...newEvents, _.maxBy(evs, 'eventDate')];
                                    } else {
                                        /*const grouped = _.groupBy(evs, 'eventDate');
                                        _.forOwn(grouped, (esr, eventDate) => {
                                            newEvents = [...newEvents, _.last(esr)];
                                        });*/
                                        newEvents = [...newEvents, ...evs]
                                    }
                                });
                            }
                            newEnrollments = [...newEnrollments, enrollment];
                        } else if (!this.isTracker && this.createNewEvents) {
                            events = events.map(e => {
                                return {...e, orgUnit: orgUnit.id}
                            });
                            newEvents = [...newEvents, ...events];
                        }
                    } else {
                        errors = [...errors, {
                            error: 'Organisation unit ' + orgUnits[0] + ' not found using strategy '
                                + this.orgUnitStrategy.value,
                            row: client.client
                        }]
                    }
                } else if (orgUnits.length === 0) {
                    errors = [...errors, {
                        error: 'Organisation unit missing',
                        row: client.client
                    }]
                }
            }
        });

        return {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate,
            conflicts,
            duplicates,
            errors
        }
    }


    CSVToArray(strData, strDelimiter) {
        strDelimiter = (strDelimiter || ",");

        const objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|\\n|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n|\\n]*))"
            ),
            "gi"
        );
        let arrData = [];
        let headers = [];
        let headersFound = false;
        let headerIndex = 0;

        let arrMatches;
        while (objPattern.exec(strData)) {
            const strMatchedDelimiter = arrMatches[1];
            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                arrData.push({});
                headersFound = true;
                headerIndex = 0;
            }
            let strMatchedValue;

            if (arrMatches[2]) {

                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

            } else {
                strMatchedValue = arrMatches[3];
            }
            if (!headersFound) {
                headers.push(strMatchedValue);
            } else {
                arrData[arrData.length - 1][headers[headerIndex]] = strMatchedValue;
                headerIndex++;
            }
        }
        return (arrData);
    }

    validText(dataType, value) {
        switch (dataType) {
            case 'TEXT':
            case 'LONG_TEXT':
                return value;
            case 'NUMBER':
                return !isNaN(value);
            case 'EMAIL':
                const re = /\S+@\S+\.\S+/;
                return re.test(String(value).toLowerCase());
            case 'BOOLEAN':
                return value === false || value === true;
            case 'TRUE_ONLY':
                return value === true;
            case 'PERCENTAGE':
                return value >= 0 && value <= 100;
            case 'INTEGER':
                return Number.isInteger(value) && value > 0;
            case 'DATE':
                return moment(value, 'YYYY-MM-DD').isValid();
            case 'DATETIME':
                return moment(value, 'YYYY-MM-DD HH:mm').isValid();
            case 'TIME':
                return moment(value, 'HH:mm').isValid();
            case 'UNIT_INTERVAL':
                return value >= 0 && value <= 1;
            case 'INTEGER_NEGATIVE':
                return Number.isInteger(value) && value >= 0;
            case 'NEGATIVE_INTEGER':
                return Number.isInteger(value) && value < 0;
            case 'INTEGER_ZERO_OR_POSITIVE':
            case 'AGE':
                return Number.isInteger(value) && value >= 0;
            default:
                return true
        }
    }

    validateValue(dataType, value, optionSet) {
        if (optionSet) {
            const options = optionSet.options.map(o => {
                return {
                    code: o.code,
                    value: o.value
                }
            });
            const coded = _.find(options, o => {
                return value === o.code || value === o.value;
            });
            if (coded !== undefined && coded !== null) {
                return coded.code;
            }
        } else if (this.validText(dataType, value)) {
            return value;
            /*const numeric = /^(-?0|-?[1-9]\d*)(\.\d+)?$/;
            const int = /^(0|-?[1-9]\d*)$/;
            const posInt = /^[1-9]\d*$/;
            const posOrZero = /(^0$)|(^[1-9]\d*$)/;
            const neg = /^-[1-9]\d*$/;*/
        }
        return null;
    }

    searchOrgUnit(val) {
        switch (this.orgUnitStrategy.value) {
            case 'uid':
                return _.find(this.organisationUnits, {id: val});
            case 'code':
                return _.find(this.organisationUnits, {code: val});
            case 'name':
                return _.find(this.organisationUnits, {name: val});
            case 'auto':
                const s1 = _.find(this.organisationUnits, {id: val});
                const s2 = _.find(this.organisationUnits, {code: val});
                const s3 = _.find(this.organisationUnits, {name: val});
                if (s1 !== undefined) {
                    return s1;
                } else if (s2 !== undefined) {
                    return s2;
                } else if (s3 !== undefined) {
                    return s3;
                } else {
                    return undefined;
                }
            default:
                return undefined;
        }
    }

    getLocation(href) {
        const match = href.match(/^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]?[^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
    }

}

export default Program;
