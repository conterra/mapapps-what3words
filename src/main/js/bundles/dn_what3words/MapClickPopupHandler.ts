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

import apprt_request from "apprt-request";
import Locale from "apprt-core/Locale";

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { Messages } from "./nls/bundle";
import type { I18N } from "apprt/api";

export class MapClickPopupHandler {
    private _i18n: InjectedReference<I18N<Messages>>;
    private _clickHandle?: IHandle;
    private _mapWidgetModel: InjectedReference<any>;
    private _what3WordsModel: InjectedReference<any>;

    public activateTool(): void {
        const i18n = this._i18n!.get().ui;
        this.getView().then((view) => {
            this.addClickHandler(view, i18n);
        });
    }

    public deactivateTool(): void {
        if (this._clickHandle) {
            this._clickHandle.remove();
            this._clickHandle = undefined;
        }

        this.getView().then((view) => {
            view.popup.close();
        });
    }

    private addClickHandler(view: __esri.View, i18n: Messages["ui"]) {
        const w3wModel = this._what3WordsModel;
        const key = w3wModel.apiKey;
        const coordsUrl = w3wModel.what3wordsUrl;

        this._clickHandle = view.on("click", (event: {mapPoint: __esri.Point}) => {
            if (key === "") {
                console.warn(i18n.missingApiKeyWarning);
                return;
            }

            const currentLang = Locale.getCurrent().getLocaleString();
            const latitude = event.mapPoint.latitude;
            const longitude = event.mapPoint.longitude;
            const queryParams = { key, coordinates: `${latitude},${longitude}`, language: currentLang };

            apprt_request(coordsUrl, { query: queryParams }).then(
                (response) => {
                    view.popup.title = `///${response.words}`;
                    const lat = Math.round(latitude * 1000) / 1000;
                    const lon = Math.round(longitude * 1000) / 1000;

                    view.popup.open({
                        location: event.mapPoint,
                        content: `${i18n.popup.coordinatePrefix}: [${lon}, ${lat}]`
                    });
                    // TODO: Add action to popup
                }
            ).catch((e) => {
                console.warn(`${i18n.popup.geocodingErrorPrefix}: ${e?.response?.data?.error?.message}`);
            });

        });
    }

    private getView(): Promise<__esri.MapView | __esri.SceneView> {
        const mapWidgetModel = this._mapWidgetModel;
        return new Promise((resolve) => {
            if (mapWidgetModel.view) {
                resolve(mapWidgetModel.view);
            } else {
                const watcher = mapWidgetModel.watch("view", ({ value: view }: { value: __esri.MapView | __esri.SceneView }) => {
                    watcher.remove();
                    resolve(view);
                });
            }
        });
    }
}
