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
import { What3WordsStore } from "./What3WordsStore";
import { MessagesReference } from "./nls/bundle";

export class What3WordsStoreFactory {
    private _i18n: InjectedReference<MessagesReference>;
    private _model: any;
    private _properties: any;
    private _registration: any;
    private _componentContext: any;

    public activate(): void {
        this.initStore();
    }

    private initStore() {
        const props = this._properties;
        const model = this._model;
        const _i18n = this._i18n!.get().ui;

        props.apiKey = model.get("apiKey");

        const store = new What3WordsStore(props, model, _i18n); // TODO: Typing
        // todo action hier
        store.popupTemplate = {
            "title": "shubdawub",
            "content": "Hallooooo",
            "customActions": ["popup-action-copy-what3words"]
        };

        const getW3WAction = this.getW3WAction();

        this._registration = this._componentContext.getBundleContext().registerService(
            ["ct.api.Store"], store, {
            ...props, id: "what3wordsStore"
        } //todo popop
        );
    }

    public deactivate(): void {
        this.unregisterStore();
    }

    private unregisterStore() {
        const reg = this._registration;
        this._registration = undefined;
        if (reg) {
            reg.unregister();
        }
    }

    private getW3WAction() {
        const apuifbasdpvn = this._popupActionFactory;
        const blubbs = apuifbasdpvn.createAction("popup-action-copy-what3words");

        return blubbs;
    }
}
