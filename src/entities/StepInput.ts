import { InputCondition } from './InputCondition';

export class StepInput {
    id?: string;
    inputId: string;
    label: string;
    helper: string;
    classes?: string;
    conditions?: InputCondition[];

    constructor() {
        this.inputId = '';
        this.label = '';
        this.helper = '';
    }
}