/**
*
* this code was inspired by the work done by David Riccitelli
*
* Copyright 2011 Aaron K. Saunders, Clearly Innovative Inc
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var fbAuthModule = {};
 
(function() {
 
    fbAuthModule.init = function(clientId, scope) {
        fbAuthModule.clientId = clientId;
        fbAuthModule.redirectUri = 'http://www.facebook.com/connect/login_success.html/&type=user_agent&display=touch';
        fbAuthModule.ACCESS_TOKEN = null;
        fbAuthModule.xhr = null;
        fbAuthModule.scope = scope || null;
    };
 
    /**
    * logs user out
    *
    * @params success_callback method called when successful
    *
    */
    fbAuthModule.logout = function(success_callback) {
 
        fbAuthModule.xhr = Titanium.Network.createHTTPClient();
        fbAuthModule.xhr.open("GET", "http://m.facebook.com/logout.php?confirm=1");
 
        fbAuthModule.xhr.onerror = function(e) {
            Ti.API.error("fbAuthModule ERROR " + e.error);
            Ti.API.error("fbAuthModule ERROR " + fbAuthModule.xhr.location);
            error(e);
        };
 
        fbAuthModule.xhr.onload = function(_xhr) {
            Ti.API.debug("fbAuthModule response: " + fbAuthModule.xhr.responseText);
            if (success_callback) {
                success_callback(fbAuthModule.xhr);
            };
        }
 
        fbAuthModule.xhr.send();
        return;
    };
 
    /**
    * displays the familiar web login dialog we all know and love
    *
    * @params authSuccess_callback method called when successful
    *
    */
    fbAuthModule.login = function(authSuccess_callback) {
 
        if (authSuccess_callback != undefined) {
            fbAuthModule.success_callback = authSuccess_callback;
        }
 
        showAuthorizeUI(
        String.format('https://graph.facebook.com/oauth/authorize?response_type=token&client_id=%s&redirect_uri=%s',
        fbAuthModule.clientId,
        fbAuthModule.redirectUri + (fbAuthModule.scope ? "&scope=" + fbAuthModule.scope: "") )
        );
        return;
    };
 
    /**
    * code to display the familiar web login dialog we all know and love
    */
    function showAuthorizeUI(pUrl)
    {
 
        window = Ti.UI.createWindow({
            modal: true,
            fullscreen: true,
            width: '100%'
        });
        var transform = Ti.UI.create2DMatrix().scale(0);
        view = Ti.UI.createView({
            top: 5,
            width: '100%',
            height: 450,
            border: 10,
            backgroundColor: 'white',
            borderColor: '#aaa',
            borderRadius: 20,
            borderWidth: 5,
            zIndex: -1,
            transform: transform
        });
        closeLabel = Ti.UI.createLabel({
            textAlign: 'right',
            font: {
                fontWeight: 'bold',
                fontSize: '12pt'
            },
            text: '[ X ]',
            top: 5,
            right: 12,
            height: 14
        });
        window.open();
 
        webView = Ti.UI.createWebView({
            top: 25,
            width: '100%',
            url: pUrl,
            autoDetect: [Ti.UI.AUTODETECT_NONE]
        });
        Ti.API.debug('Setting:[' + Ti.UI.AUTODETECT_NONE + ']');
        webView.addEventListener('beforeload',
        function(e) {
            if (e.url.indexOf('http://www.facebook.com/') != -1 || e.url.indexOf('http://m.facebook.com/') != -1) {
                Titanium.API.debug(e);
                authorizeUICallback(e);
                webView.stopLoading = true;
            }
        });
        webView.addEventListener('load', authorizeUICallback);
        view.add(webView);
 
        closeLabel.addEventListener('click', destroyAuthorizeUI);
        view.add(closeLabel);
 
        window.add(view);
 
        var animation = Ti.UI.createAnimation();
        animation.transform = Ti.UI.create2DMatrix();
        animation.duration = 500;
        view.animate(animation);
    };
 
 
 
    /**
    * unloads the UI used to have the user authorize the application
    */
    function destroyAuthorizeUI()
    {
        Ti.API.debug('destroyAuthorizeUI');
        // if the window doesn't exist, exit
        if (window == null) {
            return;
        }
 
        // remove the UI
        try
        {
            Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener');
            webView.removeEventListener('load', authorizeUICallback);
            Ti.API.debug('destroyAuthorizeUI:window.close()');
            window.hide();
        }
        catch(ex)
        {
            Ti.API.debug('Cannot destroy the authorize UI. Ignoring.');
        }
    };
 
 
 
    /**
    * fires event when login fails 
    * <code>app:auth_access_denied</code>
    *
    * fires event when login successful
    * <code>app:auth_token</code>
    */
    function authorizeUICallback(e)
    {
        Ti.API.debug('authorizeUILoaded ' + e);
 
        if (e.url.indexOf('#access_token') != -1)
        {
 
            var resultParams = e.url.split('&');
            fbAuthModule.ACCESS_TOKEN = resultParams[0].split('=')[1];
            Ti.App.fireEvent('app:auth_token', {
                access_token: resultParams[0].split('=')[1],
                expires_in: resultParams[1].split('=')[1]
            });
 
            if (fbAuthModule.success_callback != undefined) {
                fbAuthModule.success_callback({
                    access_token: resultParams[0].split('=')[1],
                    expires_in: resultParams[1].split('=')[1]
                });
            }
 
            destroyAuthorizeUI();
 
        } else if (e.url.indexOf('#error=access_denied') != -1) {
            Ti.App.fireEvent('app:auth_access_denied', {});
            destroyAuthorizeUI();
        }
 
    };
 
})();