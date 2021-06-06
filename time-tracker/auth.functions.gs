var client_id = "<client_id>";
var client_secret = "<client_secret>";
var redirect_uri =  `<redirect_url>`;
const Token_url = "https://oauth2.googleapis.com/token";
var Auth_URL = "https://accounts.google.com/o/oauth2/auth";
var Scope = ["https://www.googleapis.com/auth/fitness.activity.read","https://www.googleapis.com/auth/fitness.sleep.write",
"https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/calendar.events"];

var code="<code>"

var Token_object = {
  "expires_in": 3599.0, 
  "token_type": "Bearer", 
  "refresh_token": "<refresh_token>", 
  "scope": ["https://www.googleapis.com/auth/fitness.activity.read","https://www.googleapis.com/auth/fitness.sleep.write","https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/calendar.events"]
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
      Logger.log(code)
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
  var url = Auth_URL.addQuery(options);
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
