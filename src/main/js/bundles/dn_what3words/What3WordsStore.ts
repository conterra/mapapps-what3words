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

import QueryResults from "store-api/QueryResults";
import apprt_request from "apprt-request";
import when from "apprt-core/when";
import ComplexQuery, { ComplexQueryOptions } from "store-api/ComplexQuery";
import Point from "esri/geometry/Point";
import { What3WordsQueryResult, What3WordsQueryReturnObject } from "./api";
import { QueryOptions, QueryResult } from "store-api/api/Store";
import What3WordsModel from "./What3WordsModel";
import { SyncInMemoryStore, ConstructorOptions } from "store-api/InMemoryStore";

import type { InjectedReference } from "apprt-core/InjectedReference";

// eslint-disable-next-line max-len
const regex = /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i;

export class What3WordsStore extends SyncInMemoryStore<ConstructorOptions<any>, string> {
    private _i18n: InjectedReference<MessagesReference>;
    private _model: InjectedReference<typeof What3WordsModel>;

    public activate(): void {
        this.initComponent();
    }

    public initComponent(): void {
        const i18n = this._i18n.get().ui;

        this.popupTemplate = {
            title: "///{words}",
            customActions: ["popup-action-copy-what3words"],
            content: `${i18n.popup.coordinatePrefix}: [{roundedLatitude}, {roundedLongitude}]`
        };
    }

    public get(id: string): Promise<What3WordsQueryReturnObject> {
        return when(this.query({ $eq: id }, { isGet: true }), features => features[0]);
    }

    public query(query: any, queryopts: QueryOptions): QueryResult<What3WordsQueryReturnObject> {
        const model = this._model!;
        const key = model.apiKey;

        if (key === "") {
            console.warn("API key for what3words is empty");
            return [];
        }

        const inputWords = this.handleInputs(query, queryopts);
        if (inputWords?.length === 0) {
            return [];
        }

        let promise;
        if (queryopts.isGet === true) {
            promise = when(
                apprt_request(model.coordsUrl, { query: { key, words: inputWords } }).then(
                    (response) => this.getCallback(response)
                ).catch((e) => {
                    console.warn(`"Geocoding failed: ${e.response.data.error.message}`);
                    return [];
                })
            );
        } else {
            promise = when(
                apprt_request(model.suggestUrl, { query: { key, input: inputWords } }).then(
                    (response) => this.suggestCallback(response)
                ).catch((e) => {
                    console.warn(`"Geocoding failed: ${e.response.data.error.message}`);
                    return [];
                })
            );
        }

        return QueryResults(promise);
    }

    private handleInputs(query: any, queryopts: QueryOptions): string | [] {
        const ast = ComplexQuery.parse(query, queryopts).ast;
        let value = ast.root().v;

        if (value.indexOf("///") === 0) {
            value = value.slice(3);
        }

        if (!regex.test(value)) {
            return [];
        }

        return value;
    }
    private suggestCallback(response) {
        const results = [];
        response.suggestions.forEach((suggest) => {
            results.push({
                id: suggest.words,
                title: `///${suggest.words} ${suggest.nearestPlace}`,
                words: suggest.words
            });
        });

        results.total = results.length;
        return results;
    }

    private getCallback(response: What3WordsQueryResult) {
        const results = [];

        results.push({
            words: response.words,
            roundedLatitude: Math.round(response.coordinates.lng * 1000) / 1000,
            roundedLongitude: Math.round(response.coordinates.lat * 1000) / 1000,
            geometry: new Point({
                longitude: response.coordinates.lng,
                latitude: response.coordinates.lat,
                wkid: 4326
            })
        });

        results.total = results.length;
        return results;
    }
}
