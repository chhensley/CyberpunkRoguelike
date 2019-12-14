/**
 * Copyright 2019
 * Do as thou wilt shall be the whole of the License.
 * Love is the License, love under will.
 */

/**
 * Retrieves JSON object from url
 * Used to load configuration and game data
 * @param {string} url - URL
 */
function getJson(url)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false )
    xmlHttp.send( null )

    if (xmlHttp.status == 200)
      return JSON.parse(xmlHttp.responseText)
    else
      return null
}