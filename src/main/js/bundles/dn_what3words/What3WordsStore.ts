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

/*
 * Copyright (C) 2023 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import QueryResults from "store-api/QueryResults";
import apprt_request from "apprt-request";
import when from "apprt-core/when";
import ComplexQuery from "store-api/ComplexQuery";
import Point from "esri/geometry/Point";

const coordsUrl = "https://api.what3words.com/v3/convert-to-coordinates";
const suggestUrl = "https://api.what3words.com/v3/autosuggest";
// eslint-disable-next-line max-len
const regex = /^\/{0,}[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.。][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i;

export class What3WordsStore {

    constructor(properties) {
        this.key = properties.apiKey;
        this.id = "what3wordsStore";
    }

    get(id, options) {
        const query = {};
        query["id"] = { $eq: id };
        options.isGet = true;
        return when(this.query(query, options), function (features) {
            return features[0];
        });
    }

    getIdentity(item) {
        return item["id"];
    }

    getMetadata() {
        return {
            supportsGeometry: true
        };
    }

    query(query, queryopts) {

        const ast = ComplexQuery.parse(query, queryopts).ast;
        let value = ast.root().v;

        if (value.indexOf("///") === 0) {
            value = value.slice(3);
        }

        //no 3 word address
        if (!regex.test(value)) {
            return this.emptyResult();
        }

        const key = this.key;

        if (key === "") {
            console.warn("API key for what3words is empty");
            return this.emptyResult();
        }

        const queryParams = { key };
        let targetUrl = suggestUrl;
        let callback = this.suggestCallback;

        //if this.query() was called from this.get(), otherwise it is a suggest query
        if (queryopts.isGet === true) {
            queryParams.words = value;
            targetUrl = coordsUrl;
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
                title: `///${suggest.words} (${suggest.nearestPlace}`
            });
        });

        results.total = results.length;
        return results;
    }

    private getCallback(response) {
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
