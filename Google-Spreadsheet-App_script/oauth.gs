
//genrated when you create a Github Oauth app
//by visiting Settings->Developer Settings->New Oauth App
// and then creating one.
//Application name: your app name
//...
//Homepage URL: https://script.google.com/macros/s/<----some key---->/exec
//you can get HomePage Url by clicking Publish->Deploy as Web app, in google script toolbar
//you'll get a window, writing formalities, then you'll get your home page url in the format...
//...
//Authorization callback URL: https://script.google.com/macros/d/<---Script Id---->/usercallback
//You can get script Id by clicking File->Project Properties and their Under info menu you'll find a key Script Id, that's your script id

var CLIENT_ID = '$clientID';
var CLIENT_SECRET = '$clientSecret';
 
// configure the service
function getGithubService_() {
  return OAuth2.createService('GitHub')
    .setAuthorizationBaseUrl('https://github.com/login/oauth/authorize')
    .setTokenUrl('https://github.com/login/oauth/access_token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('repo'); 
}
 
// Logs the redict URI to register
// can also get this from File > Project Properties
function logRedirectUri() {
  var service = getGithubService_();
//  Logger.log(service);
  Logger.log(service.getToken());
  Logger.log(service.hasAccess());
  Logger.log(service.reset());
  Logger.log(service.getToken());
}
 
 
// handle the callback
function authCallback(request) {
  var githubService = getGithubService_();
  var isAuthorized = githubService.handleCallback(request);
 
  if (isAuthorized) {
    
    clearCell("dashboard",2,4);
    
    clearCell("dashboard",2,5);
    
    getIssues();
    
    return HtmlService.createHtmlOutput('Success! You can close this tab.');

  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}
