export class StepCondition {
    id?: string;
    conditionId: string;
    stepId: string;
    value: any;
    goToStep: number;
    
    constructor() {
        this.conditionId = '';
        this.stepId = '';
        this.value = null;
        this.goToStep = 0;
    }
}