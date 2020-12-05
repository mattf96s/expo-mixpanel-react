export declare enum PEOPLE_OPERATION {
    "set" = 0,
    "set_once" = 1,
    "unset" = 2,
    "add" = 3,
    "append" = 4,
    "union" = 5,
    "delete" = 6
}
export declare type PeopleData = {
    [key: string]: string;
};
export declare type MixpanelContextType = {
    identify: (userId: string) => void;
    track: (name: string, props?: any) => void;
    register: (props: any) => void;
    reset: () => void;
    people_set: (props: any) => void;
    people_set_once: (props: any) => void;
    people_unset: (props: any) => void;
    people_increment: (props: any) => void;
    people_append: (props: any) => void;
    people_union: (props: any) => void;
    people_delete_user: () => void;
};
export declare type Config = {
    token: string | undefined;
    userId?: string | null;
    clientId?: string;
    userAgent?: string | null;
    appName?: string;
    appId?: string;
    appVersion?: string;
    screenSize?: string;
    deviceName?: string;
    platform?: string;
    model?: string;
    osVersion: string | number;
};
export declare type Event = {
    name: string;
    props: any;
};
