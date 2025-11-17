///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

import { apprtFetchJson } from "apprt-fetch";
import Locale from "apprt-core/Locale";
import Graphic from "@arcgis/core/Graphic";

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { Messages } from "./nls/bundle";
import type { I18N } from "apprt/api";

export class MapClickPopupHandler {
    private _i18n: InjectedReference<I18N<Messages>>;
    private _clickHandle?: IHandle;
    private _mapWidgetModel: InjectedReference<any>;
    private _what3WordsModel: InjectedReference<any>;
    private _coordinateTransformer: InjectedReference<any>;

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

        this._clickHandle = view.on("click", async (event: { mapPoint: __esri.Point }) => {
            if (key === "") {
                console.warn(i18n.missingApiKeyWarning);
                return;
            }

            const currentLang = Locale.getCurrent().getLocaleString();
            const point = await this._coordinateTransformer.transform(event.mapPoint, 3857);

            const latitude = point.latitude;
            const longitude = point.longitude;
            const queryParams = { key, coordinates: `${latitude},${longitude}`, language: currentLang };

            apprtFetchJson(coordsUrl, { query: queryParams }).then(
                (response) => {
                    view.popup.open({
                        features: [
                            new Graphic({
                                geometry: event.mapPoint,
                                attributes: {
                                    words: response.words,
                                    roundedLatitude: Math.round(latitude * 1000) / 1000,
                                    roundedLongitude: Math.round(longitude * 1000) / 1000
                                },
                                popupTemplate: {
                                    title: "///{words}",
                                    customActions: ["popup-action-copy-what3words"],
                                    content: `${i18n.popup.coordinatePrefix}: [{roundedLatitude}, {roundedLongitude}]`
                                } as __esri.PopupTemplate & { customActions: string[] }
                            })
                        ]
                    });
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
