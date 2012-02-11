Ti.include('../util/common.js');
Ti.include('../util/tea.js');
Ti.include('../util/tools.js');
Ti.include('../model/modelLocator.js');

var win = Ti.UI.currentWindow;
var model = win.model;
var db = win.db;

function addRegistration(llId, emailAddr, displayName, fbKey, fbSecret, pUser, pPassword, serverSecret){
    var rows = 0;
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('LLID', '" + llId + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('EMAILADDR', '" + emailAddr + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('DISPLAYNAME', '" + displayName + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FBKEY', '" + fbKey + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('FBSECRET', '" + fbSecret + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('PUSER', '" + pUser + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('PPASSWORD', '" + pPassword + "', 0)");
    rows += db.execute("INSERT INTO AppParams (name, valueStr, valueInt) VALUES ('SERVERSECRET', '" + serverSecret + "', 0)");
    Ti.API.info("addRegistration():  rows --> " + rows);
};

function init(){
    var loginPage = Ti.UI.createWebView();
    loginPage.url = model.getSecureBaseUrl() + '/register';
    loginPage.scalesPageToFit = true;
    loginPage.addEventListener('load', function(e){
        if (e.url == "https://zarcode4fishin.appspot.com/registerReturn") {
            loginPage.hide();
            var j = null;
            var tempXML = e.source.html;
            if (tempXML != null && tempXML.length > 0) {
                var len = tempXML.length - 25 - 14;
                tempXML = tempXML.substr(25, len);
                tempXML = Tools.trim(tempXML);
                var modXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + tempXML;
                Ti.API.info("Modified XML :: " + modXML);
                var xml = Titanium.XML.parseString(modXML);
                
                // server secret
                var serverSecret = xml.documentElement.getElementsByTagName("servercode").item(0);
                var serverSecretStr = Tea.decrypt(serverSecret.text, model.getPW1());
                Ti.API.info('Server Secret: [' + serverSecretStr + ']');
                model.setPW2(serverSecretStr);
                
                // email address
                var emailAddr = xml.documentElement.getElementsByTagName("emailaddr").item(0);
                var emailAddrStr = Tea.decrypt(emailAddr.text, model.getPW1());
                Ti.API.info('Email Address: [' + emailAddrStr + ']');
                
                // displayName
                var nickname = xml.documentElement.getElementsByTagName("nickname").item(0);
                
                // ll id
                var llid = xml.documentElement.getElementsByTagName("llid").item(0);
                var llIdStr = Tea.decrypt(llid.text, model.getPW1());
                Ti.API.info('LL Id: [' + llIdStr + ']');
                
                // encrypt id for client to server key
                Ti.API.info('Encrypting clear id=' + llIdStr + ' with key [' + serverSecretStr + ']');
                var llIdCrypted = Tea.encrypt(llIdStr, serverSecretStr);
                Ti.API.info('NEW llId for sending to server [' + llIdCrypted + ']');
                var d = Tea.decrypt(llIdCrypted, serverSecretStr);
                Ti.API.info('----------------> ' + d);
                
                var u = {
                    emailAddr: emailAddrStr,
                    displayName: nickname.text,
                    idClear: llIdStr,
                    id: llIdCrypted
                };
                model.setCurrentUser(u);
                
                // facebook key
                var fbKey = xml.documentElement.getElementsByTagName("fbkey").item(0);
                var fbKeyStr = Tea.decrypt(fbKey.text, model.getPW1());
                Ti.API.info('FB Key: [' + fbKeyStr + ']');
                model.setFBAPIKey(fbKey.text);
                
                // facebook secret	
                var fbSecret = xml.documentElement.getElementsByTagName("fbsecret").item(0);
                var fbSecretStr = Tea.decrypt(fbSecret.text, model.getPW1());
                Ti.API.info('FB Secret: [' + fbSecretStr + ']');
                model.setFBSecret(fbSecretStr);
                
                // picasa user	
                var pUser = xml.documentElement.getElementsByTagName("picasauser").item(0);
                var pUserStr = Tea.decrypt(pUser.text, model.getPW1());
                Ti.API.info('Picasa User: [' + pUserStr + ']');
                model.setPicasaUser(pUserStr);
                
                // picasa password	
                var pPassword = xml.documentElement.getElementsByTagName("picasapassword").item(0);
                var pPasswordStr = Tea.decrypt(pPassword.text, model.getPW1());
                Ti.API.info('Picasa Password: [' + pPasswordStr + ']');
                model.setPicasaPassword(pPassword.text);
                
                addRegistration(llid.text, emailAddr.text, nickname, fbKey.text, fbSecret.text, pUser.text, pPassword.text, serverSecret.text);
                
                Titanium.App.fireEvent('REGISTER_COMPLETE', {});
            }
            else {
                Ti.API.info("Unable to get raw xml data from webview!!!");
            }
            loginPage.hide();
            win.close();
        }
        else {
            loginPage.show();
            Ti.API.info("Display this page --- URL=" + e.url);
        }
    });
    win.add(loginPage);
};

init();
