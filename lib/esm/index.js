var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { useState, useEffect } from "react";
import Constants from "expo-constants";
import { Dimensions, Platform } from "react-native";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PEOPLE_OPERATION, } from "./constants";
const { width, height } = Dimensions.get("window");
export const MixpanelContext = React.createContext({});
export const useMixpanelContext = () => React.useContext(MixpanelContext);
const MixpanelProvider = (_a) => {
    var _b, _c, _d;
    var { children, token } = _a, rest = __rest(_a, ["children", "token"]);
    const [ready, setReady] = useState(false);
    const [queue, setQueue] = useState([]);
    // superProps (data sent with every request)
    const ASYNC_STORAGE_KEY = "mixpanel:super:props";
    const [superProps, setSuperProps] = useState({});
    function getLocalStorageItem(ASYNC_STORAGE_KEY) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield AsyncStorage.getItem(ASYNC_STORAGE_KEY);
            if (!!item) {
                let parsedItem = JSON.parse(item);
                setSuperProps(parsedItem);
            }
        });
    }
    useEffect(() => {
        if (ASYNC_STORAGE_KEY) {
            // get superProps from localStorage
            getLocalStorageItem(ASYNC_STORAGE_KEY);
        }
    }, []);
    const [config, setConfig] = useState({
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
        model: ((_b = Constants.platform) === null || _b === void 0 ? void 0 : _b.android) ? "unknown"
            : (_d = (_c = Constants.platform) === null || _c === void 0 ? void 0 : _c.ios) === null || _d === void 0 ? void 0 : _d.model,
        osVersion: Platform.Version,
    });
    // set userAgent and set ready to true
    useEffect(() => {
        function getUserAgent() {
            return __awaiter(this, void 0, void 0, function* () {
                const userAgent = yield Constants.getWebViewUserAgentAsync();
                setConfig(Object.assign(Object.assign({}, config), { userAgent }));
                setReady(true);
            });
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
    const flush = () => __awaiter(void 0, void 0, void 0, function* () {
        if (ready) {
            let newQueue = queue;
            while (queue.length) {
                const event = newQueue.pop();
                if (!!event) {
                    yield pushEvent(event);
                }
            }
            setQueue(newQueue);
        }
    });
    // send event to mixpanel
    const pushEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
        let data = {
            event: event.name,
            properties: Object.assign(Object.assign({}, (event.props || {})), superProps),
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
        return yield fetch(`https://api.mixpanel.com/track/?data=${buffer}`);
    });
    // identify user
    const identify = (userId) => {
        setConfig(Object.assign(Object.assign({}, config), { userId }));
    };
    // register props to be sent with every event
    const register = (props) => {
        try {
            AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(props));
        }
        catch (_a) { }
    };
    // reset superProps
    const reset = () => {
        if (Constants.deviceId) {
            identify(Constants.deviceId);
        }
        try {
            AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({}));
        }
        catch (_a) { }
    };
    // add a tracking event to the queue to be sent
    const track = (name, props) => {
        setQueue([...queue, { name, props }]);
    };
    const people = (operation, props) => {
        if (config.userId) {
            const data = {
                $token: token,
                $distinct_id: config.userId,
            };
            data[`$${operation}`] = props;
            pushProfile(data);
        }
    };
    const people_set = (props) => {
        people(PEOPLE_OPERATION.set, props);
    };
    const people_set_once = (props) => {
        people(PEOPLE_OPERATION.set_once, props);
    };
    const people_unset = (props) => {
        people(PEOPLE_OPERATION.unset, props);
    };
    const people_increment = (props) => {
        people(PEOPLE_OPERATION.add, props);
    };
    const people_append = (props) => {
        people(PEOPLE_OPERATION.append, props);
    };
    const people_union = (props) => {
        people(PEOPLE_OPERATION.union, props);
    };
    const people_delete_user = () => {
        people(PEOPLE_OPERATION.delete, "");
    };
    const pushProfile = (data) => {
        const buffer = base64.encode(JSON.stringify(data));
        return fetch(`https://api.mixpanel.com/engage/?data=${buffer}`);
    };
    return (React.createElement(MixpanelContext.Provider, { value: {
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
        } }, children));
};
export { MixpanelProvider };
//# sourceMappingURL=index.js.map