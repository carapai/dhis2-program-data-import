import {observable} from "mobx";

class DataElement {
    @observable id;
    @observable code;
    @observable name;
    @observable displayName;
    @observable valueType;
    @observable optionSet;

    constructor(id, code, name, displayName, valueType, optionSet) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.displayName = displayName;
        this.valueType = valueType;
        this.optionSet = optionSet;
    }
}

export default DataElement;
