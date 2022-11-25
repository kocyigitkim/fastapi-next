export type Entity<T> = {
    [P in keyof T]: T[P];
}
export function CreateEntity<T>(definition: T) : Entity<T>{
    var entity = {};

    return entity as any;
}

