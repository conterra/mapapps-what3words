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

import type { InjectedReference } from "apprt-core/InjectedReference";
import type { ActionService } from "map-actions/api";

export class What3WordsOpenPopupMapAction {
    private id: string;
    private immediate: boolean;
    private _actionService: InjectedReference<ActionService>;

    constructor() {
        this.id = "what3words-open-popup";
        this.immediate = false;
    }

    async trigger(event: any): Promise<void> {
        const actionService = this._actionService;

        if (!event.source) { return; }
        if (event.source.id !== "what3wordsstore" || !event.items || event.items.length === 0) { return; }

        const item = event.items[0];
        actionService!.trigger(["zoomto", "openpopup"], {
            "items": [item],
            "zoomto-point-scale": 1000,
            "source": event.source
        });
    }
}
