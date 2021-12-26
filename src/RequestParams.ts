export interface IdRequest {
    id: string;
}
export interface SetNameRequest{
    id: string;
    name: string;
}
export interface SetStatusRequest{
    id: string;
    status: string;
}
export interface SetDescriptionRequest{
    id: string;
    description: string;
}
export interface SetDateRequest{
    id: string;
    date: string;
}
export interface SetTimeRequest{
    id: string;
    time: string;
}
export interface SetParameterRequest {
    id: string,
    key: string;
    value: any;
}