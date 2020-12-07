export class Condition {
    id?: string;
    name: string;
    logicalOperator: string;

    constructor() {
        this.name = '';
        this.logicalOperator = '';
    }
}