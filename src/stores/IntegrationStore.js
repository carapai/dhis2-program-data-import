import {action, computed, configure, observable, toJS} from 'mobx';
import _ from "lodash";
import OptionSet from "./OptionSet";
import DataElement from "./DataElement";
import ProgramStageDataElement from "./ProgramStageDataElement";
import ProgramStage from "./ProgramStage";
import TrackedEntityAttribute from "./TrackedEntityAttribute";
import ProgramTrackedEntityAttribute from "./ProgramTrackedEntityAttribute";
import Program from "./Program";
import TrackedEntityType from "./TrackedEntityType";
import Option from './Option';

configure({enforceActions: true});

class IntegrationStore {

    @observable programs = [];
    @observable program;
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
    @observable tracker;

    @observable programsFilter = '';
    @observable expanded;
    @observable hasMappingsNameSpace;

    @observable scheduleTypes = [{
        value: 'Second',
        label: 'Second',
    }, {
        value: 'Minute',
        label: 'Minute',
    }, {
        value: 'Hour',
        label: 'Hour',
    }];


    @observable jump = false;
    @observable loading = false;

    @observable tableActions = {
        logs(...args) {
            console.log(...args);
        },
        delete(...args) {
            console.log(args);
        }
    };

    @action setD2 = (d2) => {
        this.d2 = d2;
    };

    @action
    handleNext = () => {
        if (this.activeStep === 2 && !this.program.isTracker) {
            this.activeStep = this.activeStep + 2;
        } else {
            this.activeStep = this.activeStep + 1;
        }
    };

    @action
    handleBack = () => {
        if (this.activeStep === 4 && !this.program.isTracker) {
            this.activeStep = this.activeStep - 2;
        } else if (this.activeStep === 2 && this.jump) {
            this.activeStep = 0;
        } else {
            this.activeStep = this.activeStep - 1
        }
    };

    @action
    saveMapping = () => {
        this.program.saveMapping(this.mappings);
    };

    @action runAll = () => {
        this.mappings = this.mappings.map(mapping => {
            mapping.scheduleProgram();
            return mapping;
        })
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

        model.organisationUnits = model.organisationUnits.toArray();
        model.createNewEvents = true;
        model.createNewEnrollments = true;
        model.dataStartRow = 2;
        model.headerRow = 1;
        model.orgUnitStrategy = {value: 'auto', label: 'auto'};
        model.schedule = 30;
        model.scheduleType = {value: 'Minute', label: 'Minute'};


        this.program = this.convert(model);

        const maxMapping = _.maxBy(this.mappings, 'mappingId');

        if (maxMapping) {
            this.program.setMappingId(maxMapping.mappingId + 1);
        } else {
            this.program.setMappingId(1);
        }

        this.handleNext()
    };

    @action
    useSaved = model => {
        this.program = model;
        this.jump = true;
        this.activeStep = this.activeStep + 2;
    };

    @action
    fetchPrograms = () => {
        this.d2.models.programs.list({
            paging: false,
            fields: 'id,name,displayName,lastUpdated,programType,trackedEntityType,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSet[options[name,code]]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSet[options[name,code]]]]],organisationUnits[id,code,name]'
        }).then(this.fetchProgramsSuccess, this.fetchProgramsError)
    };

    @action checkDataStore = () => {
        this.d2.dataStore.has('bridge').then(this.checkDataStoreSuccess, this.fetchProgramsError)
    };

    @action fetchSavedMappings = () => {
        this.d2.dataStore.get('bridge').then(this.fetchSavedMappingSuccess, this.fetchProgramsError);
    };

    @action createDataStore = () => {
        this.d2.dataStore.create('bridge').then(this.createDataStoreSuccess, this.fetchProgramsError);
    };

    @action
    toggleLoading = (val) => {
        this.loading = val;
    };

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
        this.mappings = mappings.map(m => {
            return this.convert(m);
        });
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
    fetchProgramsError(error) {
        this.error = "error"
    }

    @action
    filterPrograms = (programsFilter) => {
        programsFilter = programsFilter.toLowerCase();
        this.programsFilter = programsFilter;
    };


    @action setExpanded = expanded => {
        this.expanded = expanded;
    };


    @action
    handlePanelChange = panel => (event, expanded) => {
        this.setExpanded(expanded ? panel : false);
    };


    @action toggleCanCreateEvents() {
        this.createNewEvents = true;
    }

    @computed get disableNext() {
        if (this.activeStep === 2) {
            return !this.program.data
                || !this.program.orgUnitColumn
                || (!this.program.eventDateColumn && this.program.createNewEvents)
                || ((!this.program.enrollmentDateColumn || !this.program.incidentDateColumn) && this.program.createNewEnrollments);
                // || (!this.program.createNewEnrollments && !this.program.createNewEvents);
        } else if (this.activeStep === 3 && this.program.createNewEnrollments) {
            return !this.program.mandatoryAttributesMapped;
        } else if (this.activeStep === 4) {
            return !this.program.compulsoryDataElements;
        } else if (this.activeStep === 5) {
            const {
                newTrackedEntityInstances,
                newEnrollments,
                newEvents,
                trackedEntityInstancesUpdate,
                eventsUpdate
            } = this.program.processed;
            return (newTrackedEntityInstances.length + newEnrollments.length + newEvents.length + eventsUpdate.length +
                trackedEntityInstancesUpdate.length) === 0;
        }
        return false;

    }

    @computed get nextLabel() {
        if (this.activeStep === 0) {
            return 'New Mapping';
        } else if (this.activeStep === 5) {
            const {
                conflicts,
                errors
            } = this.program.processed;
            if (errors.length > 0 || conflicts.length > 0) {
                return 'Submit Rejecting Errors & Conflicts'
            }
            return 'Submit'
        } else {
            return 'Next';
        }
    }

    @computed get finishLabel() {
        if (this.activeStep === 5) {
            return 'Cancel'
        } else {
            return 'Finish';
        }
    }

    convert = program => {
        let programStages = [];
        let programTrackedEntityAttributes = [];
        program.programStages.forEach(ps => {
            let programStageDataElements = [];
            ps.programStageDataElements.forEach(psd => {
                let optionSet = '';
                if (psd.dataElement.optionSet) {
                    let options = [];

                    psd.dataElement.optionSet.options.forEach(o => {
                        const option = new Option(o.code, o.name);
                        // option.setValue(o.value || '');
                        options = [...options, option];
                    });
                    optionSet = new OptionSet(options)
                }

                const dataElement = new DataElement(psd.dataElement.id,
                    psd.dataElement.code,
                    psd.dataElement.name,
                    psd.dataElement.displayName,
                    psd.dataElement.valueType,
                    optionSet
                );
                const programStageDataElement = new ProgramStageDataElement(psd.compulsory, dataElement);
                if (psd.column) {
                    programStageDataElement.setColumn(psd.column);
                }
                programStageDataElements = [...programStageDataElements, programStageDataElement];
            });
            const programsStage = new ProgramStage(
                ps.id,
                ps.name,
                ps.displayName,
                ps.repeatable,
                programStageDataElements
            );
            programStages = [...programStages, programsStage]
        });

        program.programTrackedEntityAttributes.forEach(pa => {
            let optionSet = null;
            if (pa.trackedEntityAttribute.optionSet) {
                let options = [];

                pa.trackedEntityAttribute.optionSet.options.forEach(o => {
                    const option = new Option(o.code, o.name);
                    options = [...options, option];
                });
                optionSet = new OptionSet(options)
            }

            const trackedEntityAttribute = new TrackedEntityAttribute(
                pa.trackedEntityAttribute.id,
                pa.trackedEntityAttribute.code,
                pa.trackedEntityAttribute.name,
                pa.trackedEntityAttribute.displayName,
                pa.trackedEntityAttribute.unique,
                optionSet
            );

            const programTrackedEntityAttribute = new ProgramTrackedEntityAttribute(
                pa.valueType,
                pa.mandatory,
                trackedEntityAttribute
            );
            if (pa.column) {
                programTrackedEntityAttribute.setColumn(pa.column);
            }
            programTrackedEntityAttributes = [...programTrackedEntityAttributes, programTrackedEntityAttribute]

        });

        const p = new Program(
            program.lastUpdated,
            program.name,
            program.id,
            program.programType,
            program.displayName,
            programStages,
            programTrackedEntityAttributes
        );

        p.setOrganisationUnits(program.organisationUnits.map(o => {
            return {id: o.id, name: o.name, code: o.code}
        }));

        if (program.trackedEntityType) {
            p.setTrackedEntityType(new TrackedEntityType(program.trackedEntityType.id))
        }

        if (program.columns) {
            p.setColumns(program.columns);
        }

        p.setD2(this.d2);
        p.setOrder(program.order);
        p.setOrderBy(program.orderBy);
        p.setOrganisationUnits(program.organisationUnits);
        p.setOrgUnitStrategy(program.orgUnitStrategy);
        p.setHeaderRow(program.headerRow || 1);
        p.setDataStartRow(program.dataStartRow || 2);
        p.setCreateNewEvents(program.createNewEvents);
        p.setCreateNewEnrollments(program.createNewEnrollments);
        p.setEventDateColumn(program.eventDateColumn);
        p.setEnrollmentDateColumn(program.enrollmentDateColumn);
        p.setIncidentDateColumn(program.incidentDateColumn);
        p.setUrl(program.url || '');
        p.setDateFilter(program.dateFilter || '');
        p.setLastRun(program.lastRun);
        p.setUploaded(program.uploaded);
        p.setUploadMessage(program.uploadMessage);
        p.setOrgUnitColumn(program.orgUnitColumn);
        p.setMappingId(program.mappingId);

        return p;
    }
}

const store = new IntegrationStore();
export default store;
