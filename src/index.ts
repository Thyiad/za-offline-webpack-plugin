class PtTsLib {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    sayHi() {
        console.log(`hi, ${this.name}-${this.age}`);
    }
}

export { PtTsLib };
