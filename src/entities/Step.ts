import { StepInput } from './StepInput';

export class Step {
    id?: string;
    position: number;
    title: string;
    description: string;
    inputs: StepInput[];

    constructor() {
        this.position = 1;
        this.title = '';
        this.description = '';
        this.inputs = [];
    }

}