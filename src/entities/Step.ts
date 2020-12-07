import { StepCondition } from './StepCondition';
import { StepInput } from './StepInput';

export class Step {
    id?: string;
    position: number;
    title: string;
    subtitle: string;
    conditions: StepCondition[];
    inputs: StepInput[];

    constructor() {
        this.position = 1;
        this.title = '';
        this.subtitle = '';
        this.conditions = [];
        this.inputs = [];
    }

}