import * as React from "react";
import { MixpanelContextType } from "./constants";
declare type MixpanelContextProps = {
    token: string;
};
export declare const MixpanelContext: React.Context<Partial<MixpanelContextType>>;
declare const useMixpanelContext: () => Partial<MixpanelContextType>;
declare const MixpanelProvider: React.FC<MixpanelContextProps>;
export { MixpanelProvider, useMixpanelContext };
