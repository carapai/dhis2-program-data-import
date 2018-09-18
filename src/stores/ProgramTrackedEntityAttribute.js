import {action, observable} from "mobx";

class ProgramTrackedEntityAttribute {
    @observable valueType;
    @observable mandatory;
    @observable trackedEntityAttribute;
    @observable column;
    @observable open = false;

    constructor(valueType, mandatory, trackedEntityAttribute) {
        this.valueType = valueType;
        this.mandatory = mandatory;
        this.trackedEntityAttribute = trackedEntityAttribute;
    }

    @action
    setColumn = value => this.column = value;

    @action
    setOpen = value => this.open = value;

    @action
    handleClickOpen = () => {
        this.open = true;
    };

    handleClose = () => {
        this.setOpen(false);
    };
}

export default ProgramTrackedEntityAttribute;
