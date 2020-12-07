export const objectToArray = <T>(obj: object) => {
    const out: T[] = [];
    if (!Object.keys(obj).length) {
        return out;
    }
    Object.keys(obj).forEach(key => {
        out[key] = obj[key];
    });
    return out;
}

export const extract = (obj: object, key: string): object => {
    const newObj = Object.assign({});
    const keys = Object.keys(obj);
    if (keys.includes(key)) {
        newObj[key] = obj[key];
        delete obj[key];
    }
    return newObj;
} 