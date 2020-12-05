export enum PEOPLE_OPERATION {
  "set",
  "set_once",
  "unset",
  "add",
  "append",
  "union",
  "delete",
}

export type PeopleData = {
  [key: string]: string;
};

export type MixpanelContextType = {
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

export type Config = {
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

export type Event = {
  name: string;
  props: any;
};
