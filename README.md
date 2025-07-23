# what3words Bundle

This bundle will integrate [what3words](https://what3words.com/de/) into map.apps.

what3words provides a whole different way of geolocation. It covers the whole world in 3m x 3m squares, all addressed
with a unique combination of three words, e.g. **///snippet.measure.dribble** which is the location of the con terra main office.

The combinations of words, so called three word addresses, are unique and spread all over the globe so that quite similar
combinations are far away from each other.

Three word addresses are available in 25+ different languages. The what3words service provides conversion from the
words to lat/lon coordinates and the conversion from lat/lon coordinates to the three word addresses.

This map.apps bundle will provide two integration points for the service:
* a store for the omnisearch, which will take three word addresses like ///snippet.measure.dribble and display them on the map (any language can be used)
* a tool, which, when activated, will provide the three word address for any clicked location on the map

To be able to use this bundle, a development API key is required. It can be obtained for free from [here](https://accounts.what3words.com/register)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/internal_demo_what3words/index.html

## Requirements
* map.apps 4.6.2 (or above)
* a what3words API developer key which can be retrieved from [here](https://accounts.what3words.com/register)

## Installation Guide

1. Obtain an API Key
2. Add the bundles "omnisearch" and "dn_what3words" to your app
3. Configure the "dn_what3words" bundle to use the API key
4. Add the "popupToggleTool" to any toolset

```json

        "dn_what3words": {
            "Config": {
                "apiKey": "XXXXXXXX"
            }
        }

```

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
