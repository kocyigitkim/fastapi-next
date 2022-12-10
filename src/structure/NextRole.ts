export class NextRole {
    public id: string;
    public name: string;
    public description?: string;
    public permissions?: string[];
}

export enum UserRoleStrategy{
    // role id is stored in the user table
    RoleId = 0,
    // role is assigned to the user via a join table
    RoleJoin = 1,
    // custom strategy
    Custom = 2
}