/**
 * Copyright 2019 - 2020
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

/**
 * Retrieves JSON object from url
 * Used to load configuration and game data
 * @param {string} url
 */
function getJson(url)
{
    console.log('Loading ' + url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false )
    xmlHttp.send( null )

    if (xmlHttp.status == 200)
      return JSON.parse(xmlHttp.responseText)
    else
      return null
}