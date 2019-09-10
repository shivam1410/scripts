// add custom menu
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Github Issues')
  .addItem('Get User Repos','getRepos')
  .addItem('get issues for a Repo','getIssues')
      .addToUi();
}

//triggers
function createSpreadsheetOpenTrigger() {
  var ss = SpreadsheetApp.getActive();
  Logger.log(ss)
  ScriptApp.newTrigger('onStart')
      .forSpreadsheet(ss)
      .onOpen()
      .create();
}
function createSpreadsheetEditTrigger() {
  var ss = SpreadsheetApp.getActive();
  Logger.log(ss)
  ScriptApp.newTrigger(['onSheetEdit'])
      .forSpreadsheet(ss)
      .onEdit()
      .create();
}

//onStart trigger triggering onOpen
function onStart(){
  repo= SpreadsheetApp.getActive()
  .getSheetByName("dashboard")
  .getRange(4, 2)
  .getValue();
  
  if(repo){
    getRepos();
    getIssues();
  }
}

//on changing repository name, which is triggered onEdit
//reset function,(its also a trigger actually). which is triggered onEdit
function onSheetEdit(e) {

  col = e.range.getColumn();
  row = e.range.getRow();
  //onRepoEdit
  if(col == 2 && row == 4){
    Logger.log("onRepoEdit")
    clearDataTable("dashboard",['A7:Z','D1']);
    Logger.log("hello");
    getIssues();
  }
   //onResetEdit
  if(col == 4 && row == 1){
   Logger.log("onReset")
    var reset = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("dashboard")
    .getRange(1,4)
    .getValue();
   
    if(reset){
      var service = getGithubService_();
      service.reset();
      clearCell("dashboard",1,4);
      clearDataTable("dashboard",['A7:Z','D1']);
      getIssues();    
    }
  }
  
 //onOrgChange
  if(col == 2 && row == 3) {
  Logger.log("onorgchange")
    var changedorg = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("dashboard")
    .getRange(3,2)
    .getValue();
    
    if(changedorg){
      getRepos();
    }
  }
}
 
/***************************************/
// Get User Repos
function getRepos() {

   var service = getGithubService_();
   var ss = SpreadsheetApp.getActiveSpreadsheet();
   var sheet = ss.getSheetByName("dashboard");
   var temp = ss.getSheetByName("temp");
   var $org = sheet.getRange(3,2).getValue();
     Logger.log(service.getAccessToken());
   if (service.hasAccess()) {
     Logger.log("App has Repo access.");
     var $URL = "https://api.github.com/" + "user/repos";


     var headers = {
       "Authorization": "Token " + getGithubService_().getAccessToken(),
       "Accept": "application/vnd.github.v3+json"
     };
     
     var options = {
       "headers": headers,
       "method" : "GET",
       "muteHttpExceptions": true
     };
     
     var response = UrlFetchApp.fetch($URL, options);
     var data = JSON.parse(response.getContentText());
    Logger.log(data);
     var repoNames = [];
      
     data.forEach(function(elem) {
       repoNames.push([elem["name"]]);
     });
     clearDataTable("temp",['A3:A']);
     temp.getRange(3,1,repoNames.length,1).setValues(repoNames);
     Logger.log(repoNames);
   } else {
     Logger.log("App has no access yet.");
   
     var authorizationUrl = service.getAuthorizationUrl();
     Logger.log("Open the following URL %s", authorizationUrl);
     clearDataTable("temp",['A3:A']);
     setValueInCell("dashboard",2,4,"please visit: ");
     setValueInCell("dashboard",2,5,authorizationUrl);
   }
 }

////
////////// get issues for a Repo
function getIssues() {
    var service = getGithubService_();
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("dashboard");
    var temp = ss.getSheetByName("temp");
    
    var $org = sheet.getRange(3,2).getValue();
    var $repo= sheet.getRange(4,2).getValue();
 
   if (service.hasAccess()) {
     Logger.log("App has access.");
     
     var $URL = "https://api.github.com/repos/" + $org +"/" + $repo;
    
     var headers = {
       "Authorization": "token " + getGithubService_().getAccessToken(),
       "Accept": "application/json"
     };
      
     var options = {
       "headers": headers,
       "method" : "GET",
       "muteHttpExceptions": true
     };

     var response = UrlFetchApp.fetch($URL, options);
     var data = JSON.parse(response.getContentText());
     var issues_count = data.open_issues_count;
Logger.log(data);
     var issues =[]
     var issuesnumber = [];
     var issuestitles = [];
     var issuesCreated_at = [];
     var issuesUpdated_at = [];
     var issuesFixed_at = [];
     var issuesMilestoneNumber = [];
     var issuesMilestoneState = [];
     var issuesMilestoneTitle = [];
     var issuesMilestoneDue_on = [];
     var issuesCommentsCount = [];
     var page=1;
     for (var iss = 0; iss<=issues_count; iss =iss + 100)
     {
       var $URL = "https://api.github.com/repos/" + $org + "/" + $repo + "/issues?page=" + page + "&per_page=100";
       var headers = {
           "Authorization": "Bearer " + getGithubService_().getAccessToken(),
           "Accept": "application/json"
         };
       var options = {
           "headers": headers,
           "method" : "GET",
           "muteHttpExceptions": true
         };
       var response = UrlFetchApp.fetch($URL, options);
       var result = JSON.parse(response.getContentText());
    Logger.log(result);
       result.forEach(function(elem) {
         issues.push([elem]);
         issuesnumber.push([elem.number]);
         issuestitles.push([elem.title]);
         issuesCreated_at.push([elem.created_at]);
         issuesUpdated_at.push([elem.updated_at]);
         issuesFixed_at.push([elem.fixed_at]);
         Logger.log(elem.milestone);
 
           if(elem.milestone && elem.milestone.number){
             issuesMilestoneNumber.push([elem.milestone.number]);           
           }
           if(!elem.milestone || !elem.milestone.number ){
             issuesMilestoneNumber.push(["NA"]);        
           }
           if(elem.milestone && elem.milestone.state){   
             issuesMilestoneState.push([elem.milestone.state]);
           } 
           if(!elem.milestone || !elem.milestone.state) {
           issuesMilestoneState.push(["NA"]);
           }
           if(elem.milestone && elem.milestone.title){
             issuesMilestoneTitle.push([elem.milestone.title]);
           }
           if(!elem.milestone || !elem.milestone.title) {
             issuesMilestoneTitle.push(["NA"]);
           }
           if(elem.milestone && elem.milestone.due_on){
             issuesMilestoneDue_on.push([elem.milestone.due_on]);
           }
           if(!elem.milestone || !elem.milestone.due_on) {
             issuesMilestoneDue_on.push(["NA"]);
           }
           issuesCommentsCount.push([elem.comments]);
       });
       page++;
    }
     
     if(issues.length){
       sheet.getRange(7, 1, issuestitles.length, 1).setValues(issuesnumber);
       sheet.getRange(7, 2, issuestitles.length, 1).setValues(issuestitles);
       sheet.getRange(7, 3, issuestitles.length, 1).setValues(issuesCreated_at);
       sheet.getRange(7, 4, issuestitles.length, 1).setValues(issuesUpdated_at);
       sheet.getRange(7, 5, issuestitles.length, 1).setValues(issuesFixed_at);
       sheet.getRange(7, 6, issuestitles.length, 1).setValues(issuesMilestoneNumber);
       sheet.getRange(7, 7, issuestitles.length, 1).setValues(issuesMilestoneState);
       sheet.getRange(7, 8, issuestitles.length, 1).setValues(issuesMilestoneTitle);
       sheet.getRange(7, 9, issuestitles.length, 1).setValues(issuesMilestoneDue_on);
       sheet.getRange(7, 10, issuestitles.length, 1).setValues(issuesCommentsCount);
     }
     clearCell("dashboard",2,4);
     clearCell("dashboard",2,5);
   }
   else {
     Logger.log("App has no access yet.");
   
     var authorizationUrl = service.getAuthorizationUrl();
     Logger.log("Open the following URL %s", authorizationUrl);
   
     setValueInCell("dashboard",2,4,"please visit: ");
     setValueInCell("dashboard",2,5,authorizationUrl);
   }
 }

//clear a cell
function clearCell(sheet,i,j) {
     SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(sheet)
    .getRange(i,j)
    .clearContent();
}

//clear the main Datatable
function clearDataTable(sheet,arr){
  SpreadsheetApp
  .getActiveSpreadsheet()
  .getSheetByName(sheet)
  .getRangeList(arr)
  .clearContent();
}

//set value in a cell
function setValueInCell(sheet,i,j,data) {
     SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(sheet)
    .getRange(i,j)
    .setValue(data);
}
