import { Step } from './Step';

export class Briefing {
    id?: string;
    title: string;
    description: string;
    author: string;
    steps?: Step[];
    created?: Date;

    constructor() {
        this.title = '';
        this.description = '';
        this.author = '';
        this.steps = [];
    }
}