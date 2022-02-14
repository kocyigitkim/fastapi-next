export function precisionRound(number: number, precision: number) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

export async function waitCallback<T>(_this: T, action, ...args): Promise<T> {
    return (new Promise((resolve, reject) => {
        action.call(_this, ...args, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    }).catch(console.error)) as Promise<T>;
}
