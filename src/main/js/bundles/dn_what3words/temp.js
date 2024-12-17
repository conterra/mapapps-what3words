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
import apprt_request from "apprt-request";
import Locale from "apprt-core/Locale";

const coordsUrl = "https://api.what3words.com/v3/convert-to-3wa";

function MakPopupHandler(i18n) {

    let _clickHandle;
    let mapWidgetModel;
    let key;
    i18n = i18n._i18n.get();

    function cleanup() {
        _clear();
        _clickHandle && _clickHandle.remove();
    }

    function _clear() {
        const view = mapWidgetModel && mapWidgetModel.get("view");
        if (view) {
            view.popup.content = "";
            view.popup.close();
        }
    }

    return {
        activateTool: function () {
            mapWidgetModel = this.mapWidgetModel;
            key = this.what3wordsModel.get("apiKey");
            const view = mapWidgetModel.get("view");
            if (!view) {
                return;
            }
            // Defines an action to zoom out from the selected feature
            let copyAction = {
                // This text is displayed as a tooltip
                title: i18n.popup.button,
                // The ID by which to reference the action in the event handler
                id: "copy-result",
                // Sets the icon font used to style the action button
                image: "js/bundles/dn_what3words/images/copy.svg"
            };
            // Adds the custom action to the popup.
            view.popup.actions.push(copyAction);

            view.popup.on("trigger-action", function (event) {
                // If the zoom-out action is clicked, fire the zoomOut() function
                if (event.action.id === "copy-result") {
                    copyText();
                }
            });

            function copyText() {
                const copyText = document.getElementsByClassName("popupTitle")[0];
                if (!copyText) { return; }
                navigator.clipboard.writeText(copyText.textContent);
                const tooltip = document.getElementsByClassName("tooltiptext")[0];
                tooltip.style.visibility = "visible";
                tooltip.style.opacity = "1";
                setTimeout(() => {
                    tooltip.style.visibility = "hidden";
                    tooltip.style.opacity = "0";
                }, 5000);

            }

            view.popup.autoOpenEnabled = false;
            _clickHandle = view.on("click", (event) => {
                _clear();

                if (key === "") {
                    console.warn("API key for what3words is empty!");
                    return;
                }

                const latitude = event.mapPoint.latitude;
                const lat = Math.round(latitude * 1000) / 1000;
                const longitude = event.mapPoint.longitude;
                const lon = Math.round(longitude * 1000) / 1000;

                view.popup.open({
                    // Set the location of the popup to the clicked location
                    location: event.mapPoint,
                    // Set the popup's content to the coordinates of the location
                    content: "what3words für: [" + lon + ", " + lat + "]"
                });

                const currentLang = Locale.getCurrent().getLocaleString();
                const queryParams = { key, coordinates: `${latitude},${longitude}`, language: currentLang };



                apprt_request(coordsUrl, { query: queryParams }).then(
                    (response) => {
                        view.popup.title = "<div class='tooltip'> "
                        + "<span class='tooltiptext'>"+ i18n.popup.tooltip +"</span>"
                        + "<span class=popupTitle>///" + response.words + '</span></div>';
                    }
                ).catch((e) => {
                    console.warn("Geocoding failed: " + e.response.data.error.message);
                });

            });
        },
        deactivateTool: cleanup,
        deactivate: cleanup
    };

}

export default MapClickPopupHandler;
