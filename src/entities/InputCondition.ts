export class InputCondition {
    id?: string;
    conditionId: string;
    stepInputId: string;
    value: any;
    goToStep: number;

    constructor() {
        this.conditionId = '';
        this.stepInputId = '';
        this.value = '';
        this.goToStep = 0;
    }
}