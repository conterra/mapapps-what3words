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

import { Mutable, properties, type Mutable as MutableType } from "apprt-core/Mutable";

function defineProperties<Impl, P>(mutableDefinition: any, mutableProperties: {
    apiKey: "",
    what3wordsUrl: "",
    suggestUrl: "",
    coordsUrl: ""
}): Impl & MutableType<P> {
    properties(mutableDefinition, mutableProperties);
    return mutableDefinition;
}

class What3WordsModel extends Mutable {
}

interface What3WordsModelProps {
    apiKey: string,
    what3wordsUrl: string,
    suggestUrl: string,
    coordsUrl: string
}

export default defineProperties<What3WordsModel, What3WordsModelProps>(What3WordsModel,
    {
        apiKey: "",
        what3wordsUrl: "",
        suggestUrl: "",
        coordsUrl: ""
    });
