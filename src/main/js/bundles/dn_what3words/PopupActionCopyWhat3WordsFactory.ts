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

export class PopupActionCopyWhat3WordsFactory {

    public createAction(type: string): any {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const i18n = that._i18n.get().ui;

        return {
            id: type,
            type: "button",
            title: i18n.popup.button,
            className: "icon-editor-copy",

            trigger(context: any): void {
                that.copyText(context.features[0]);
            },

            isVisibleForFeature(feature: __esri.Feature): boolean {
                return (feature?.attributes?.words) ? true : false;
            }
        };
    }

    public getTypes(): Array<string> {
        return ["popup-action-copy-what3words"];
    }

    public copyText(feature: __esri.Feature): void {
        navigator.clipboard.writeText(`///${feature?.attributes?.words}`);
    }
}
