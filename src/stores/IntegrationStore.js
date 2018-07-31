import * as mobx from 'mobx';
import {action, computed, observable, toJS} from 'mobx';
import _ from "lodash";
import moment from 'moment';
import {generateUid} from 'd2/lib/uid';


mobx.configure({enforceActions: true});

class IntegrationStore {

    @observable programs = [];
    @observable program = {};
    @observable dataElements = {};
    @observable attributes = {};
    @observable d2 = {};
    @observable trackedEntityInstances = [];
    @observable error = '';
    @observable activeStep = 0;
    @observable skipped = new Set();
    @observable completed = new Set();
    @observable steps = ['MAPPINGS', 'PROGRAMS', 'DATA', 'ATTRIBUTES', 'PROGRAM STAGES', 'PRE-IMPORT SUMMARY', 'DATA IMPORT'];
    @observable totalSteps = 7;
    @observable multipleCma = {};
    @observable mappings = [];
    @observable page = 0;
    @observable rowsPerPage = 5;
    @observable ePage = 0;
    @observable eRowsPerPage = 5;
    @observable headerRow = 1;
    @observable dataStartRow = 2;
    @observable uploaded = null;
    @observable tracker;
    @observable columns = [];
    @observable orgUnitColumn = '';
    @observable orgUnitStrategy = {value: 'auto', label: 'auto'};
    @observable createNewEvents = false;
    @observable createNewEnrollments = false;
    @observable eventDateColumn = '';
    @observable enrollmentDateColumn = '';
    @observable incidentDateColumn = '';
    @observable attributesFilter = '';
    @observable programTrackedEntityAttributes = [];
    @observable programsFilter = '';
    @observable dataElementsFilter = {};
    @observable data = null;
    @observable programStages = [];
    @observable dataPulled = false;
    @observable programPagingInfo = {};
    @observable expanded;
    @observable hasMappingsNameSpace;
    @observable percentageInserted = 0;
    @observable increment = 0;
    @observable responses = [];
    @observable currentMapping = {
        id: null,
        attributes: null,
        columns: null,
        dataElements: null,
        program: null,
        dataElementsFilter: null,
        programPagingInfo: null,
        tracker: null,
        createNewEnrollments: null,
        createNewEvents: null,
        orgUnitColumn: null,
        orgUnitStrategy: null,
        headerRow: null,
        dataStartRow: null,
        programName: null,
        programStages: null,
        incidentDateColumn: null,
        enrollmentDateColumn: null,
        organisationUnits: null
    };
    @observable items = [{
        value: 'auto',
        label: 'auto',
    }, {
        value: 'name',
        label: 'name',
    }, {
        value: 'uid',
        label: 'uid',
    }, {
        value: 'code',
        label: 'code',
    }];

    @observable jump = false;
    @observable url = '';

    @observable orderBy = 'mandatory';
    @observable order = 'desc';
    @observable loading = false;

    @action setD2 = (d2) => {
        this.d2 = d2;
    };

    @action setAttribute = (name, unique, valueType, value) => {
        if (value) {
            _.set(this.attributes, name, {...value, unique, ...valueType})
        } else {
            this.attributes = _.omit(this.attributes, name);
        }
    };

    @action setDataElements = (stage, dataElement, valueType, value) => {
        if (value) {
            _.set(this.dataElements, stage + '.' + dataElement, {...value, ...valueType});
        } else {
            this.dataElements = _.omit(this.dataElements, stage + '.' + dataElement);
        }
    };

    @action setPagePagingInfo = (stage, page) => {
        _.set(this.programPagingInfo, stage + '.page', page);
    };

    @action setRowsPerPagePagingInfo = (stage, rowsPerPage) => {
        _.set(this.programPagingInfo, stage + '.rowsPerPage', rowsPerPage);
    };

    @action attributeChange = (name, unique, valueType) => value => {
        this.setAttribute(name, unique, valueType, value);
    };

    @action dataElementChange = (stage, dataElement, valueType) => value => {
        this.setDataElements(stage, dataElement, valueType, value);
    };

    @action
    handleNext = () => {
        if (this.activeStep === 2 && !this.isTracker) {
            this.activeStep = this.activeStep + 2;
        } else {
            this.activeStep = this.activeStep + 1;
        }
    };

    @action
    handleBack = () => {
        if (this.activeStep === 4 && !this.isTracker) {
            this.activeStep = this.activeStep - 2;
        } else if (this.activeStep === 2 && this.jump) {
            this.activeStep = 0;
        } else {
            this.activeStep = this.activeStep - 1
        }
    };

    @action
    saveMapping = () => {
        this.currentMapping.columns = this.columns;
        this.currentMapping.tracker = this.isTracker;
        this.currentMapping.attributes = this.attributes;
        this.currentMapping.dataElements = this.dataElements;
        this.currentMapping.eventDateColumn = this.eventDateColumn;
        this.currentMapping.orgUnitStrategy = this.orgUnitStrategy;
        this.currentMapping.createNewEvents = this.createNewEvents;
        this.currentMapping.createNewEnrollments = this.createNewEnrollments;
        this.currentMapping.orgUnitColumn = this.orgUnitColumn;
        this.currentMapping.enrollmentDateColumn = this.enrollmentDateColumn;
        this.currentMapping.incidentDateColumn = this.incidentDateColumn;
        this.currentMapping.programName = this.program.displayName;

        const mapping = _.findIndex(this.mappings, {id: this.currentMapping.id});

        if (mapping !== -1) {
            this.mappings.splice(mapping, 1, this.currentMapping);
        } else {
            this.mappings = [...this.mappings, this.currentMapping]
        }
        this.saveMappings()
    };

    @action changeSet = (step) => {
        this.activeStep = step;
    };

    @action
    handleStep = step => () => {
        this.changeSet(step);
    };

    @action
    handleComplete = () => {
        const completed = new Set(this.completed);
        completed.add(this.activeStep);
        this.completed = completed;
        if (completed.size !== this.totalSteps() - this.skippedSteps()) {
            this.handleNext();
        }
    };

    @action
    handleReset = () => {
        this.activeStep = 0;
        this.completed = new Set();
        this.skipped = new Set();
    };

    skippedSteps() {
        return this.skipped.size;
    }

    isStepComplete(step) {
        return this.completed.has(step);
    }


    allStepsCompleted() {
        return this.completed === this.totalSteps - this.skippedSteps();
    }


    @action
    executeEditIfAllowed = model => {
        this.jump = false;
        this.createNewEnrollments = false;
        this.createNewEvents = false;
        let program = model;
        program.programTrackedEntityAttributes = model.programTrackedEntityAttributes.map(pta => {
            return {...pta.trackedEntityAttribute, mandatory: pta.mandatory, valueType: pta.valueType}
        });
        program.programStages = model.programStages.toArray();
        program.organisationUnits = model.organisationUnits.toArray();

        let dataElements = {};
        let dataElementsFilter = {};
        let programPagingInfo = {};

        program.programStages.forEach(stage => {
            dataElements = {
                ...dataElements, ..._.fromPairs([[stage.id, {}]])
            };
            dataElementsFilter = {
                ...dataElementsFilter, ..._.fromPairs([[stage.id, '']])
            };
            programPagingInfo = {
                ...programPagingInfo, ..._.fromPairs([[stage.id, {page: 0, rowsPerPage: 5}]])
            };
        });

        this.dataElements = dataElements;
        this.dataElementsFilter = dataElementsFilter;
        this.programPagingInfo = programPagingInfo;


        this.program = program;
        this.tracker = program['programType'] === 'WITH_REGISTRATION';

        const maxMapping = _.maxBy(this.mappings, 'id');

        let nextKey = 1;

        if (maxMapping) {
            nextKey = maxMapping.id + 1;
        }

        this.currentMapping.id = nextKey;
        this.currentMapping.program = this.program;
        this.currentMapping.programStages = program.programStages;
        this.currentMapping.organisationUnits = program.organisationUnits;
        this.currentMapping.dataElementsFilter = this.dataElementsFilter;
        this.currentMapping.attributesFilter = this.attributesFilter;
        this.currentMapping.programPagingInfo = this.programPagingInfo;

        this.attributes = {};
        this.orgUnitStrategy = {value: 'auto', label: 'auto'};
        this.orgUnitColumn = null;
        this.eventDateColumn = null;
        this.enrollmentDateColumn = '';
        this.incidentDateColumn = '';
        this.attributesFilter = '';

        this.handleNext()
    };

    @action
    useSaved = model => {
        this.columns = model['columns'];
        this.program = model['program'];
        this.program.programStages = model['programStages'];
        this.program.organisationUnits = model['organisationUnits'];
        this.programPagingInfo = model['programPagingInfo'];
        this.attributes = model['attributes'];
        this.dataElements = model['dataElements'];
        this.orgUnitStrategy = model['orgUnitStrategy'];
        this.createNewEvents = model['createNewEvents'];
        this.createNewEnrollments = model['createNewEnrollments'];
        this.orgUnitColumn = model['orgUnitColumn'];
        this.eventDateColumn = model['eventDateColumn'];
        this.enrollmentDateColumn = model['enrollmentDateColumn'];
        this.incidentDateColumn = model['incidentDateColumn'];
        this.dataElementsFilter = model['dataElementsFilter'];
        this.attributesFilter = '';
        this.currentMapping = model;
        this.jump = true;
        this.activeStep = this.activeStep + 2;
    };

    @action
    fetchPrograms = () => {
        this.d2.models.programs.list({
            paging: false,
            fields: 'id,name,displayName,lastUpdated,programType,trackedEntityType,programTrackedEntityAttributes' +
            '[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSet[options[name,code]]]],' +
            'programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,' +
            'dataElement[id,code,valueType,name,displayName,optionSet[options[name,code]]]]],organisationUnits[id,code,name]'
        }).then(this.fetchProgramsSuccess, this.fetchProgramsError)
    };

    @action checkDataStore = () => {
        this.d2.dataStore.has('bridge').then(this.checkDataStoreSuccess, this.fetchProgramsError)
    };

    @action fetchSavedMappings = () => {
        this.d2.dataStore.get('bridge').then(this.fetchSavedMappingSuccess, this.fetchProgramsError);
    };

    @action saveMappings = () => {
        this.d2.dataStore.get('bridge').then(this.savedMappingSuccess, this.fetchProgramsError);
    };

    @action createDataStore = () => {
        this.d2.dataStore.create('bridge').then(this.createDataStoreSuccess, this.fetchProgramsError);
    };

    @action
    searchTrackedEntities = () => {
        const api = this.d2.Api.getApi();
        if (this.uniqueIds) {
            this.uniqueIds.forEach(uniqueId => {
                return api.get('trackedEntityInstances', {
                    // program: this.program.id,
                    paging: false,
                    ouMode: 'ALL',
                    filter: this.uniqueAttribute + ':IN:' + uniqueId,
                    fields: 'trackedEntityInstance,orgUnit,attributes[attribute,value],enrollments[enrollment,program,' +
                    'trackedEntityInstance,trackedEntityType,enrollmentDate,incidentDate,orgUnit,events[program,trackedEntityInstance,event,' +
                    'eventDate,programStage,orgUnit,dataValues[dataElement,value]]]'
                }).then(this.searchTrackedEntitiesSuccess, this.fetchProgramsError);
            });
            this.toggleDataPull();
        }
    };

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

    @action
    toggleLoading = (val) => {
        this.loading = val;
    };

    @action pullData = () => {
        window.fetch(this.url).then(res => res.json()).then(action(data => {
            let columns = _.keys(data[0]);
            columns = columns.map(v => {
                return {label: v, value: v};
            });
            this.setColumns(columns);
            this.setData(data);
        }))
    };

    @action.bound
    insertSuccess(response) {
        this.percentageInserted = this.percentageInserted + this.increment;
        this.responses.push(response);
    }

    @action.bound
    insertError(response) {
        this.percentageInserted = this.percentageInserted + this.increment;
        this.responses.push(response);
    }

    @action.bound
    fetchProgramsSuccess(foundPrograms) {
        this.programs = foundPrograms.toArray();
        this.toggleLoading(false);

    }

    @action.bound
    createDataStoreSuccess(namespace) {
        namespace.set('mappings', this.mappings);
    }

    @action.bound
    fetchSavedMappingSuccess(namespace) {
        namespace.get('mappings').then(this.fetchMappings, this.fetchProgramsError);
    }

    @action.bound
    savedMappingSuccess(namespace) {
        namespace.set('mappings', toJS(this.mappings));
    }

    @action.bound
    fetchMappings(mappings) {
        this.mappings = mappings;
    }

    @action.bound
    checkDataStoreSuccess(val) {
        if (!val) {
            this.createDataStore()
        } else {
            this.fetchSavedMappings();
        }
    }

    @action.bound
    searchTrackedEntitiesSuccess(foundInstances) {
        const {trackedEntityInstances} = foundInstances;
        this.trackedEntityInstances = [...this.trackedEntityInstances, ...trackedEntityInstances];
    }

    @action.bound
    fetchProgramsError(error) {
        this.error = "error"
    }

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
    setColumns = data => {
        this.columns = data;
    };

    @action
    setData = data => {
        this.data = data;
    };

    @action
    onDrop = (accepted, rejected) => {
        const fileReader = new FileReader();
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

    };

    processJsonData = (json) => {
        return JSON.parse(json);
    };


    @action
    handleOrgUnitSelectChange = value => {
        this.orgUnitColumn = value;
    };

    @action
    handleOrgUnitStrategySelectChange = value => this.orgUnitStrategy = value;

    @action
    handleEventDateColumnSelectChange = value => this.eventDateColumn = value;

    @action
    handleEnrollmentDateColumnSelectChange = value => this.enrollmentDateColumn = value;

    @action
    handleIncidentDateColumnSelectChange = value => this.incidentDateColumn = value;

    @action
    handelHeaderRowChange = (value) => this.headerRow = value;

    @action
    handelURLChange = (value) => this.url = value;

    @action
    handelDataRowStartChange = (value) => this.dataStartRow = value;

    @action
    handleCreateNewEventsCheck = event => this.createNewEvents = event.target.checked;

    @action
    handleCreateNewEnrollmentsCheck = event => this.createNewEnrollments = event.target.checked;

    @action
    filterAttributes = (attributesFilter) => {
        attributesFilter = attributesFilter.toLowerCase();
        this.attributesFilter = attributesFilter;
    };

    @action
    filterPrograms = (programsFilter) => {
        programsFilter = programsFilter.toLowerCase();
        this.programsFilter = programsFilter;
    };

    @action
    filterDataElements = (stage, val) => {
        val = val.toLowerCase();
        this.dataElementsFilter[stage] = val;
    };

    @action
    handleChangePage = (event, page) => {
        this.page = page;
    };
    @action
    handleChangeRowsPerPage = event => {
        this.rowsPerPage = event.target.value;
    };
    @action
    handleChangeElementPage = stage => (event, page) => {
        this.setPagePagingInfo(stage, page)
    };
    @action
    handleChangeElementRowsPerPage = stage => event => {
        this.setRowsPerPagePagingInfo(stage, event.target.value)
    };

    @action setExpanded = expanded => {
        this.expanded = expanded;
    };


    @action
    handlePanelChange = panel => (event, expanded) => {
        this.setExpanded(expanded ? panel : false);
    };

    @action toggleDataPull() {
        this.dataPulled = !this.dataPulled;
    }

    @action toggleCanCreateEvents() {
        this.createNewEvents = true;
    }

    @action create() {
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
    }

    @action setOrder(order) {
        this.order = order;
    }

    @action setOrderBy(orderBy) {
        this.orderBy = orderBy;
    }

    @action createSortHandler = property => event => {
        const orderBy = property;
        let order = 'desc';

        if (this.orderBy === property && this.order === 'desc') {
            order = 'asc';
        }
        this.setOrderBy(orderBy);
        this.setOrder(order);

    };


    @computed get uniqueAttribute() {
        return _.findKey(this.attributes, {'unique': true});
    }

    @computed get uniqueColumn() {
        if (this.uniqueAttribute) {
            return this.attributes[this.uniqueAttribute].value;
        }
        return null;
    }

    @computed get isTracker() {
        return this.program['programType'] === 'WITH_REGISTRATION';
    }

    @computed get uniqueIds() {

        if (this.isTracker && this.uniqueColumn !== null) {
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
            const val = uniqueAttribute !== null ? uniqueAttribute['value'] : null;
            return {
                ...e,
                ..._.fromPairs([[this.uniqueAttribute, val]])
            }
        });
        return _.groupBy(entities, this.uniqueAttribute);
    }

    @computed get organisationUnits() {
        return this.program['organisationUnits'];
    }

    @computed get programAttributes() {

        const sorter = this.order === 'desc'
            ? (a, b) => (b[this.orderBy] < a[this.orderBy] ? -1 : 1)
            : (a, b) => (a[this.orderBy] < b[this.orderBy] ? -1 : 1);
        return this.program.programTrackedEntityAttributes.filter(item => {
            const displayName = item.displayName.toLowerCase();
            return displayName.includes(this.attributesFilter)
        }).sort(sorter);
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
            let allDataElements = {};
            let allAttributes = [];
            let currentData = client.data;
            let enrollmentDates = [];
            let orgUnits = [];
            currentData.forEach(d => {
                let currentAttributes = [];
                _.forOwn(this.dataElements, (v, stage) => {
                    let currentDataElements = [];
                    _.forOwn(v, (column, dataElement) => {
                        const value = d[column.value];
                        const type = column.valueType;
                        const options = column.options;

                        if (value !== '' && this.validateValue(type, value, options)) {
                            currentDataElements = [...currentDataElements, {
                                dataElement,
                                value
                            }];
                        } else if (value === '') {
                            // console.log('Ignoring');
                        } else {
                            conflicts = [...conflicts, {
                                error: options === null ? 'Invalid value ' + value + ' for value type ' + type :
                                    'Invalid value: ' + value + ', expected: ' + _.map(options, 'code').join(','),
                                row: client.client,
                                column: column.value
                            }]
                        }
                    });
                    let currentStageDataElements = allDataElements[stage];
                    const date = moment(d[this.eventDateColumn.value], ['YYYY-MM-DD', "DD/MM/YYYY", "MM/DD/YYYY"]);

                    if (date.isValid()) {
                        const eventDate = date.format('YYYY-MM-DD');
                        if (currentStageDataElements) {
                            currentStageDataElements = [...currentStageDataElements, {
                                dataValues: currentDataElements,
                                eventDate
                            }];
                        } else {
                            currentStageDataElements = [{
                                dataValues: currentDataElements,
                                eventDate
                            }]
                        }
                        allDataElements[stage] = currentStageDataElements;
                    } else {
                        errors = [...errors, {
                            error: 'Invalid event date',
                            row: client.client
                        }]
                    }
                });
                _.forOwn(this.attributes, (v, attribute) => {
                    const value = d[v.value];
                    const type = v.valueType;
                    const options = v.options;

                    if (value !== '' && this.validateValue(type, value, options)) {
                        currentAttributes = [...currentAttributes, {attribute, value}]
                    } else if (value === '') {
                        // console.log('Ignoring');
                    } else {
                        conflicts = [...conflicts, {
                            error: options === null ? 'Invalid value ' + value + ' for value type ' + type :
                                'Invalid value ' + value + ' choose from options: ' + _.map(options, 'code').join(','),
                            row: client.client,
                            column: v.value
                        }]
                    }
                });
                allAttributes = [...allAttributes, currentAttributes];

                if (this.enrollmentDateColumn !== '' && this.incidentDateColumn !== '') {
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
                    const enrollmentIndex = _.findIndex(enrollments, {program: this.program.id});
                    if (enrollmentIndex === -1 && enrollmentDates.length > 0) {
                        let enroll = {
                            program: this.program.id,
                            orgUnit: p['orgUnit'],
                            trackedEntityInstance: p['trackedEntityInstance'],
                            ...enrollmentDates[0]
                        };
                        newEnrollments = [...newEnrollments, enroll];

                        if (this.createNewEvents) {
                            _.forOwn(allDataElements, (es, stage) => {
                                const stageInfo = _.find(this.program.programStages, {id: stage});
                                const {repeatable} = stageInfo;
                                es = es.map(e => {
                                    return {
                                        ...e,
                                        program: this.program.id,
                                        trackedEntityInstance: p['trackedEntityInstance'],
                                        programStage: stage,
                                        orgUnit: p['orgUnit']
                                    }
                                });

                                if (!repeatable) {
                                    const ev = _.maxBy(es, 'eventDate');
                                    if (ev.dataValues.length > 0) {
                                        newEvents = [...newEvents, ev];
                                    }
                                } else {
                                    const grouped = _.groupBy(es, 'eventDate');
                                    _.forOwn(grouped, (esr, eventDate) => {
                                        if (esr.dataValues.length > 0) {
                                            newEvents = [...newEvents, _.last(esr)];
                                        }
                                    });
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
                        let events = enrollment['events'];
                        events = events.map(e => {
                            return {...e, eventDate: moment(e.eventDate).format('YYYY-MM-DD')}
                        });
                        _.forOwn(allDataElements, (es, stage) => {
                            const stageInfo = _.find(this.program.programStages, {id: stage});
                            const {repeatable} = stageInfo;
                            if (repeatable) {
                                es.forEach(e => {
                                    const eventIndex = _.findIndex(events, {
                                        programStage: stage,
                                        eventDate: e['eventDate']
                                    });

                                    if (eventIndex !== -1) {
                                        const stageEvent = events[eventIndex];
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
                                            program: this.program.id,
                                            programStage: stage,
                                            trackedEntityInstance: p['trackedEntityInstance'],
                                            orgUnit: enrollment['orgUnit'],
                                        };
                                        newEvents = [...newEvents, e];
                                    }
                                })

                            } else {
                                let foundEvent = _.find(events, {programStage: stage});
                                let max = _.maxBy(es, 'eventDate');
                                if (foundEvent) {
                                    const merged = _.unionBy(max['dataValues'], foundEvent['dataValues'], 'dataElement');
                                    const differingElements = _.differenceWith(max['dataValues'], foundEvent['dataValues'], _.isEqual);
                                    if (merged.length > 0 && differingElements.length > 0) {
                                        const mergedEvent = {...foundEvent, dataValues: merged};
                                        eventsUpdate = [...eventsUpdate, mergedEvent];
                                    }
                                } else if (max.dataValues.length > 0) {
                                    max = {
                                        ...max,
                                        program: this.program.id,
                                        trackedEntityInstance: p['trackedEntityInstance'],
                                        programStage: stage,
                                        orgUnit: enrollment['orgUnit']
                                    };
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
                                trackedEntityType: this.program.trackedEntityType.id,
                            };
                            newTrackedEntityInstances = [...newTrackedEntityInstances, tei];

                            let enrollment = {
                                orgUnit: orgUnit.id,
                                program: this.program.id,
                                trackedEntityInstance,
                                ...enrollmentDates[0],
                                enrollment: generateUid()
                            };

                            if (this.createNewEvents) {
                                let iEvents = [];
                                _.forOwn(allDataElements, (es, stage) => {
                                    const stageInfo = _.find(this.program.programStages, {id: stage});
                                    const {repeatable} = stageInfo;
                                    es = es.map(e => {
                                        return {
                                            ...e,
                                            program: this.program.id,
                                            programStage: stage,
                                            orgUnit: orgUnit.id,
                                            event: generateUid(),
                                            trackedEntityInstance
                                        }
                                    });

                                    if (!repeatable) {
                                        newEvents = [...newEvents, _.maxBy(es, 'eventDate')];
                                        iEvents = [...iEvents, _.maxBy(es, 'eventDate')]
                                    } else {
                                        const grouped = _.groupBy(es, 'eventDate');
                                        _.forOwn(grouped, (esr, eventDate) => {
                                            newEvents = [...newEvents, _.last(esr)];
                                        });
                                    }
                                });
                                enrollment = {...enrollment, events: iEvents}
                            }
                            newEnrollments = [...newEnrollments, enrollment];
                        } else if (!this.isTracker && this.createNewEvents) {
                            let event = _.values(allDataElements)[0][0];
                            event = {...event, program: this.program.id, orgUnit: orgUnit.id};
                            newEvents = [...newEvents, event];
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

    @computed get mandatoryAttributesMapped() {
        const allMandatory = this.program.programTrackedEntityAttributes.filter(item => {
            return item.mandatory;
        }).map(ea => {
            return ea.id;
        });
        const allMapped = _.keys(this.attributes);

        return _.difference(allMandatory, allMapped).length === 0;
    }

    @computed get disableNext() {
        if (this.activeStep === 2) {
            return this.data === null || this.eventDateColumn === null || this.orgUnitColumn === null;
        } else if (this.activeStep === 3 && this.createNewEnrollments) {
            return !this.mandatoryAttributesMapped;
        } else if (this.activeStep === 4) {
            return !this.compulsoryDataElements;
        } else if (this.activeStep === 5) {
            const {
                newTrackedEntityInstances,
                newEnrollments,
                newEvents,
                trackedEntityInstancesUpdate,
                eventsUpdate
            } = this.processed;
            return (newTrackedEntityInstances.length + newEnrollments.length + newEvents.length + eventsUpdate.length +
                trackedEntityInstancesUpdate.length) === 0;
        }
        return false;

    }

    @computed get compulsoryDataElements() {
        let programStages = [...this.program.programStages];
        let compulsory = [];
        programStages.forEach(ps => {
            const pse = ps['programStageDataElements'].filter(item => {
                return item['compulsory'];
            }).map(el => {
                return el.dataElement.id;
            });
            const mappedElements = _.keys(this.dataElements[ps.id]);
            let mapped = true;
            if (this.createNewEvents && pse.length > 0 && mappedElements.length > 0 && _.difference(pse, mappedElements).length === 0) {
                mapped = true;
            } else if (this.createNewEvents && pse.length > 0 && mappedElements.length > 0 && _.difference(pse, mappedElements).length > 0) {
                mapped = false;
            }

            compulsory = [...compulsory, {
                stage: ps.id,
                mapped
            }]
        });
        return _.every(compulsory, 'mapped');

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

    @computed get nextLabel() {
        if (this.activeStep === 0) {
            return 'New Mapping';
        } else if (this.activeStep === 5) {
            const {
                conflicts,
                errors
            } = this.processed;
            if (errors.length > 0 || conflicts.length > 0) {
                return 'Submit Rejecting Errors & Conflicts'
            }
            return 'Submit'
        } else {
            return 'Next';
        }
    }

    @computed get finishLabel() {
        if (this.activeStep === 5 && this.disableNext) {
            return 'Cancel'
        } else {
            return 'Finish';
        }
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
                    return undefined
                }
        }
    }

    getLocation(href) {
        const match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
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

    validateValue(dataType, value, options) {
        if (options !== null) {
            const coded = _.find(options, {code: value});
            return coded !== undefined && coded !== null;
        } else {
            /*const numeric = /^(-?0|-?[1-9]\d*)(\.\d+)?$/;
            const int = /^(0|-?[1-9]\d*)$/;
            const posInt = /^[1-9]\d*$/;
            const posOrZero = /(^0$)|(^[1-9]\d*$)/;
            const neg = /^-[1-9]\d*$/;*/
            switch (dataType) {
                case 'TEXT':
                case 'LONG_TEXT':
                    return value;
                case 'NUMBER':
                    return !isNaN(value);
                case 'EMAIL':
                    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
        while (arrMatches = objPattern.exec(strData)) {
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
}

const store = new IntegrationStore();
export default store;