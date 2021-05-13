var client_id = "FIT_TRACKER_CLIENT_ID";
var client_secret = "FIT_TRACKER_CLIENT_SECRET";
var redirect_uri =  `FIT_TRACKER_REDIRECT_URI`;
const Token_url = "https://oauth2.googleapis.com/token";
var Auth_URL = "https://accounts.google.com/o/oauth2/auth";
var Scope = ["https://www.googleapis.com/auth/fitness.activity.read","https://www.googleapis.com/auth/fitness.sleep.write"];
var code = "FIT_TRACKER_CODE"
var Token_object = FIT_TRACKER_TOKEN_OBJECT

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Google Fit')
  .addItem('Set Sleep data','postSleepDataOnGoogleFit')
  .addItem('get sleep data', "getSleepDataOnGoogleFit")
  .addToUi();
}

async function postSleepDataOnGoogleFit(){
  var token = await getToken();
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sleep").getDataRange().getValues();
  // range to start from
  var startFrom = Number(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sleep').getRange(2,9).getValue())

  //[Identifier, Date, Start Time, End Time]
  for(var i=startFrom;i<ss.length;i++)
  {
    var id = ss[i][0]; 
    var startTimeMillis = Number(ss[i][5])
    var endTimeMillis = Number(ss[i][6])
    Logger.log(id)
    Logger.log(startTimeMillis)
    Logger.log( endTimeMillis)
    var URL = `https://www.googleapis.com/fitness/v1/users/me/sessions/${id}`;

    var sleepData = {
      id,
      name: "Sleep date " + i,
      description: "description test " + i,
      startTimeMillis,
      endTimeMillis,
      version: 1,
      lastModifiedToken: "Sheet Token",
      application: {
          detailsUrl: "Time Tracker Sheet",
          name: "Time Tracker Sheet",
          version: "1.0"
      },
      activityType: 72
    }
    var headers = {
      "Authorization" : "Bearer " + token,
      "Content-Type": "application/json;encoding=utf-8"
    }

    var options = {
      headers,
      "method" : "put",
      "muteHttpExceptions": true,
      payload: JSON.stringify(sleepData),
    }

    var response = await UrlFetchApp.fetch(URL, options)
    Logger.log(response);
  }
}


async function getSleepDataOnGoogleFit(){
// startTime=2021-02-24T04:00:000Z&endTime=2021-02-24T10:00:000Z
    var URL = `https://www.googleapis.com/fitness/v1/users/me/sessions?activityType=72`
    var token = await getToken();
    var headers = {
      "Authorization" : "Bearer " + token,
      "Content-Type": "application/json;encoding=utf-8"
    }

    var options = {
      headers,
      "method" : "get",
      "muteHttpExceptions": true,
    }

    var response = await UrlFetchApp.fetch(URL, options)
    Logger.log(response);
}

async function getToken(){
  var headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  };

  var options = {
    headers : headers,
    'method' : 'post',
    "muteHttpExceptions": true
  };

  if(Token_object.refresh_token){

    const values = {
      client_id,
      client_secret,
      refresh_token:Token_object.refresh_token,
      grant_type:"refresh_token"
    }
      var url = Token_url.addQuery(values);
  } else {
      
      const values = {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
      };

      var url = Token_url.addQuery(values);
  }
  
  var response = await UrlFetchApp.fetch(url, options)
  return (JSON.parse(response)).access_token;
}


async function dataSource(options){
  var token = await getToken();
  Logger.log(token)
  var headers = {
    "Authorization" : "Bearer " + token
  }
  var options = {
    headers,
    "method": "get",
    "muteHttpExceptions": true
  }
 var URL = "https://www.googleapis.com/fitness/v1/users/me/dataSources" //?access_token=" + token
  var response = UrlFetchApp.fetch(URL, options);
  Logger.log(response);
}

function getCode(){
  const options = {
    redirect_uri,
    client_id,
    include_granted_scopes: true,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: Scope.join(' '),
  };  
  Logger.log(Scope.join(" "))
  var url = Auth_URL.addQuery(options);
  Logger.log(url); 
  var response = UrlFetchApp.fetch(url)
  
  modalUrl(url)
}

function modalUrl(url){
  var name = "Authenticate Time Tracker to Use Google Fit data"
  var html = '<html><body><a href="' + url + '" target="blank" onclick="google.script.host.close()">'+ name +'</a></body></html>';
  var ui = HtmlService.createHtmlOutput(html)
  SpreadsheetApp.getUi().showModelessDialog(ui,"Oauth");
}  

String.prototype.addQuery = function(obj) {
  return this + Object.keys(obj).reduce(function(p, e, i) {
    return p + (i == 0 ? "?" : "&") +
      (Array.isArray(obj[e]) ? obj[e].reduce(function(str, f, j) {
        return str + e + "=" + encodeURIComponent(f) + (j != obj[e].length - 1 ? "&" : "")
      },"") : e + "=" + encodeURIComponent(obj[e]));
  },"");
}
