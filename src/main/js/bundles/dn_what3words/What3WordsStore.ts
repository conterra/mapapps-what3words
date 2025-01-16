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

import type { InjectedReference } from "apprt-core/InjectedReference";

// eslint-disable-next-line max-len
const regex = /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i;

export class What3WordsStore {
    private key: string;
    private id: string;
    private _model: InjectedReference<typeof What3WordsModel>;

    constructor(properties: Record<string, any>, _model: typeof What3WordsModel) {
        this.key = properties.apiKey;
        this.id = "what3wordsStore";
        this._model = _model;
    }

    public get(id: string, options: any): Promise<What3WordsQueryReturnObject> {
        const query = {} as { id: ComplexQueryOptions };
        query["id"] = { $eq: id };
        options.isGet = true;
        return when(this.query(query, options), function (features) {
            return features[0];
        });
    }

    public getIdentity(item: What3WordsQueryReturnObject): string {
        return item["id"];
    }

    public getMetadata(): { supportsGeometry: boolean } {
        return {
            supportsGeometry: true
        };
    }

    public query(query: any, queryopts: QueryOptions): QueryResult<What3WordsQueryReturnObject> {
        const model = this._model;

        const ast = ComplexQuery.parse(query, queryopts).ast;
        let value = ast.root().v;

        if (value.indexOf("///") === 0) {
            value = value.slice(3);
        }

        if (!regex.test(value)) {
            return this.emptyResult();
        }

        const key = this.key;

        if (key === "") {
            console.warn("API key for what3words is empty");
            return this.emptyResult();
        }

        const queryParams = { key };
        let targetUrl = model.suggestUrl;
        let callback = this.suggestCallback;

        if (queryopts.isGet === true) {
            queryParams.words = value;
            targetUrl = model.coordsUrl;
            callback = this.getCallback;
        } else {
            queryParams.input = value;
        }

        const promise = when(
            apprt_request(targetUrl, { query: queryParams }).then(callback).catch((e) => {
                console.warn(`"Geocoding failed: ${e.response.data.error.message}`);
                return this.emptyResult();
            })
        );

        return QueryResults(promise);
    }

    private suggestCallback(response) {
        const results = [];
        response.suggestions.forEach((suggest) => {
            results.push({
                id: suggest.words,
                title: `///${suggest.words} ${suggest.nearestPlace}`
            });
        });

        results.total = results.length;
        return results;
    }

    private getCallback(response: What3WordsQueryResult) {
        const results = [];

        const coordinate = new Point({
            longitude: response.coordinates.lng,
            latitude: response.coordinates.lat,
            wkid: 4326
        });

        results.push({
            id: response.words,
            title: response.words,
            geometry: coordinate
        });

        results.total = results.length;
        return results;
    }

    private emptyResult() {
        const results = [];
        results.total = results.length;
        return QueryResults(results);
    }
}
