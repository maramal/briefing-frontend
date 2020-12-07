export class Input {
    id?: string;
    name: string;
    icon: string;
    description: string;
    value: string;
    premium?: boolean;

    constructor() {
        this.name = '';
        this.icon = '';
        this.description = '';
        this.value = '';
    }
}