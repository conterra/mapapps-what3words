///
/// Copyright (C) 2023 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { InjectedReference } from "apprt-core/InjectedReference";

export class PopupActionCopyWhat3WordsFactory {
    private _properties: InjectedReference<any>;

    public createAction(type: string): any {
        const properties = this._properties;

        return {
            id: type,
            type: "button",
            title: "test",
            className: "icon-star",

            trigger(context: any): void {
                console.info("Triggered");

            },

            isVisibleForFeature(feature: __esri.Feature): boolean {
                return true;
            }
        };
    }

    public getTypes(): Array<string> {
        return ["popup-action-copy-what3words"];
    }


    private copyText(): void {
        const copyText = document.getElementsByClassName("popupTitle")[0];
        navigator.clipboard.writeText(copyText.textContent);
        const tooltip = document.getElementsByClassName("tooltiptext")[0];
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        setTimeout(() => {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        }, 5000);
    }
}
