"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixpanelProvider = exports.useMixpanelContext = exports.MixpanelContext = void 0;
const React = __importStar(require("react"));
const react_1 = require("react");
const expo_constants_1 = __importDefault(require("expo-constants"));
const react_native_1 = require("react-native");
const react_native_base64_1 = __importDefault(require("react-native-base64"));
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const constants_1 = require("./constants");
const { width, height } = react_native_1.Dimensions.get("window");
exports.MixpanelContext = React.createContext({});
const useMixpanelContext = () => React.useContext(exports.MixpanelContext);
exports.useMixpanelContext = useMixpanelContext;
const MixpanelProvider = (_a) => {
    var _b, _c, _d;
    var { children, token } = _a, rest = __rest(_a, ["children", "token"]);
    const [ready, setReady] = react_1.useState(false);
    const [queue, setQueue] = react_1.useState([]);
    // superProps (data sent with every request)
    const ASYNC_STORAGE_KEY = "mixpanel:super:props";
    const [superProps, setSuperProps] = react_1.useState({});
    function getLocalStorageItem(ASYNC_STORAGE_KEY) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield async_storage_1.default.getItem(ASYNC_STORAGE_KEY);
            if (!!item) {
                let parsedItem = JSON.parse(item);
                setSuperProps(parsedItem);
            }
        });
    }
    react_1.useEffect(() => {
        if (ASYNC_STORAGE_KEY) {
            // get superProps from localStorage
            getLocalStorageItem(ASYNC_STORAGE_KEY);
        }
    }, []);
    const [config, setConfig] = react_1.useState({
        token,
        userId: "userId",
        clientId: expo_constants_1.default.deviceId,
        userAgent: null,
        appName: expo_constants_1.default.manifest.name,
        appId: expo_constants_1.default.manifest.slug,
        appVersion: expo_constants_1.default.manifest.version,
        screenSize: `${width}x${height}`,
        deviceName: expo_constants_1.default.deviceName,
        platform: react_native_1.Platform.OS,
        model: ((_b = expo_constants_1.default.platform) === null || _b === void 0 ? void 0 : _b.android) ? "unknown"
            : (_d = (_c = expo_constants_1.default.platform) === null || _c === void 0 ? void 0 : _c.ios) === null || _d === void 0 ? void 0 : _d.model,
        osVersion: react_native_1.Platform.Version,
    });
    // set userAgent and set ready to true
    react_1.useEffect(() => {
        function getUserAgent() {
            return __awaiter(this, void 0, void 0, function* () {
                const userAgent = yield expo_constants_1.default.getWebViewUserAgentAsync();
                setConfig(Object.assign(Object.assign({}, config), { userAgent }));
                setReady(true);
            });
        }
        if (token) {
            getUserAgent();
        }
    }, [token]);
    // when new items added to the queue, call flush
    react_1.useEffect(() => {
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
        const buffer = react_native_base64_1.default.encode(JSON.stringify(data));
        return yield fetch(`https://api.mixpanel.com/track/?data=${buffer}`);
    });
    // identify user
    const identify = (userId) => {
        setConfig(Object.assign(Object.assign({}, config), { userId }));
    };
    // register props to be sent with every event
    const register = (props) => {
        try {
            async_storage_1.default.setItem(ASYNC_STORAGE_KEY, JSON.stringify(props));
        }
        catch (_a) { }
    };
    // reset superProps
    const reset = () => {
        if (expo_constants_1.default.deviceId) {
            identify(expo_constants_1.default.deviceId);
        }
        try {
            async_storage_1.default.setItem(ASYNC_STORAGE_KEY, JSON.stringify({}));
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
        people(constants_1.PEOPLE_OPERATION.set, props);
    };
    const people_set_once = (props) => {
        people(constants_1.PEOPLE_OPERATION.set_once, props);
    };
    const people_unset = (props) => {
        people(constants_1.PEOPLE_OPERATION.unset, props);
    };
    const people_increment = (props) => {
        people(constants_1.PEOPLE_OPERATION.add, props);
    };
    const people_append = (props) => {
        people(constants_1.PEOPLE_OPERATION.append, props);
    };
    const people_union = (props) => {
        people(constants_1.PEOPLE_OPERATION.union, props);
    };
    const people_delete_user = () => {
        people(constants_1.PEOPLE_OPERATION.delete, "");
    };
    const pushProfile = (data) => {
        const buffer = react_native_base64_1.default.encode(JSON.stringify(data));
        return fetch(`https://api.mixpanel.com/engage/?data=${buffer}`);
    };
    return (React.createElement(exports.MixpanelContext.Provider, { value: {
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
exports.MixpanelProvider = MixpanelProvider;
//# sourceMappingURL=index.js.map