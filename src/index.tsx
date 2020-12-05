import * as React from "react";
import { useState, useEffect } from "react";
import Constants from "expo-constants";
import { Dimensions, Platform } from "react-native";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PEOPLE_OPERATION,
  PeopleData,
  MixpanelContextType,
  Config,
  Event,
} from "./constants";
// Note: this is all based on https://github.com/benawad/expo-mixpanel-analytics/blob/master/src/index.ts
type MixpanelContextProps = {
  token: string;
};

const { width, height } = Dimensions.get("window");

export const MixpanelContext = React.createContext<
  Partial<MixpanelContextType>
>({});

const useMixpanelContext = () => React.useContext(MixpanelContext);

const MixpanelProvider: React.FC<MixpanelContextProps> = ({
  children,
  token,
  ...rest
}) => {
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState<Event[] | []>([]);

  // superProps (data sent with every request)
  const ASYNC_STORAGE_KEY = "mixpanel:super:props";
  const [superProps, setSuperProps] = useState({});

  async function getLocalStorageItem(ASYNC_STORAGE_KEY: string) {
    const item = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    if (!!item) {
      let parsedItem = JSON.parse(item);
      setSuperProps(parsedItem);
    }
  }

  useEffect(() => {
    if (ASYNC_STORAGE_KEY) {
      // get superProps from localStorage
      getLocalStorageItem(ASYNC_STORAGE_KEY);
    }
  }, []);

  const [config, setConfig] = useState<Config>({
    token,
    userId: "userId",
    clientId: Constants.deviceId,
    userAgent: null,
    appName: Constants.manifest.name,
    appId: Constants.manifest.slug,
    appVersion: Constants.manifest.version,
    screenSize: `${width}x${height}`,
    deviceName: Constants.deviceName,
    platform: Platform.OS,
    model: Constants.platform?.android
      ? "unknown"
      : Constants.platform?.ios?.model,
    osVersion: Platform.Version,
  });

  // set userAgent and set ready to true
  useEffect(() => {
    async function getUserAgent() {
      const userAgent = await Constants.getWebViewUserAgentAsync();
      setConfig({ ...config, userAgent });
      setReady(true);
    }
    if (token) {
      getUserAgent();
    }
  }, [token]);

  // when new items added to the queue, call flush
  useEffect(() => {
    if (queue.length > 0 && ready) {
      flush();
    }
  }, [queue.length, ready]);

  // -------- Functions -------------- //

  // loop to send queue of mixpanel events
  const flush = async () => {
    if (ready) {
      let newQueue = queue;
      while (queue.length) {
        const event = newQueue.pop();
        if (!!event) {
          await pushEvent(event);
        }
      }
      setQueue(newQueue);
    }
  };

  // send event to mixpanel
  const pushEvent = async (event: Event) => {
    let data = {
      event: event.name,
      properties: {
        ...(event.props || {}),
        ...superProps,
      },
    };
    if (config.userId) {
      data.properties.distinct_id = config.userId;
    }
    data.properties.token = config.token;
    data.properties.user_agent = config.userAgent;
    data.properties.app_name = config.appName;
    data.properties.app_id = config.appId;
    data.properties.app_version = config.appVersion;
    data.properties.screen_size = config.screenSize;
    data.properties.client_id = config.clientId;
    data.properties.device_name = config.deviceName;
    if (config.platform) {
      data.properties.platform = config.platform;
    }
    if (config.model) {
      data.properties.model = config.model;
    }
    if (config.osVersion) {
      data.properties.os_version = config.osVersion;
    }

    const buffer = base64.encode(JSON.stringify(data));

    return await fetch(`https://api.mixpanel.com/track/?data=${buffer}`);
  };

  // identify user
  const identify = (userId: string) => {
    setConfig({ ...config, userId });
  };

  // register props to be sent with every event
  const register = (props: any) => {
    try {
      AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(props));
    } catch {}
  };

  // reset superProps
  const reset = () => {
    if (Constants.deviceId) {
      identify(Constants.deviceId);
    }
    try {
      AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({}));
    } catch {}
  };

  // add a tracking event to the queue to be sent
  const track = (name: string, props?: any) => {
    setQueue([...queue, { name, props }]);
  };

  const people = (operation: PEOPLE_OPERATION, props: any) => {
    if (config.userId) {
      const data: PeopleData = {
        $token: token,
        $distinct_id: config.userId,
      };
      data[`$${operation}`] = props;

      pushProfile(data);
    }
  };

  const people_set = (props: any) => {
    people(PEOPLE_OPERATION.set, props);
  };

  const people_set_once = (props: any) => {
    people(PEOPLE_OPERATION.set_once, props);
  };

  const people_unset = (props: any) => {
    people(PEOPLE_OPERATION.unset, props);
  };

  const people_increment = (props: any) => {
    people(PEOPLE_OPERATION.add, props);
  };

  const people_append = (props: any) => {
    people(PEOPLE_OPERATION.append, props);
  };

  const people_union = (props: any) => {
    people(PEOPLE_OPERATION.union, props);
  };

  const people_delete_user = () => {
    people(PEOPLE_OPERATION.delete, "");
  };

  const pushProfile = (data: PeopleData) => {
    const buffer = base64.encode(JSON.stringify(data));
    return fetch(`https://api.mixpanel.com/engage/?data=${buffer}`);
  };

  return (
    <MixpanelContext.Provider
      value={{
        identify,
        track,
        register,
        reset,
        people_set,
        people_set_once,
        people_unset,
        people_increment,
        people_append,
        people_union,
        people_delete_user,
      }}
    >
      {children}
    </MixpanelContext.Provider>
  );
};

export { MixpanelProvider, useMixpanelContext };
