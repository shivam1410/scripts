

var calId = {
  "Actions":    "<calender-id>@group.calendar.google.com",
  "Body":       "<calender-id>@group.calendar.google.com",
  "Compulsive": "<calender-id>@group.calendar.google.com",
  "Knowledge":  "<calender-id>@group.calendar.google.com",
  "Leisure":    "<calender-id>@group.calendar.google.com",
  "Office":     "<calender-id>@group.calendar.google.com",
  "People":     "<calender-id>@group.calendar.google.com",
  "Skills":     "<calender-id>@group.calendar.google.com",
  "Tracking":   "<calender-id>@group.calendar.google.com"
}

var sheetCat = {
  "Actions":	["Inside Task", "Inside task",	"Outside Task", "outside Task"],
  "Body": [	"Meditation",	"Sleep", "sleep", "Nap",	"Exercise",	"Masturbate",	"Extra","extra",	"Eating" ],
  "Compulsive":	["Compulsive", "compulsive",	"Nicotine",	"Social Media", "Social media", "Nothing"],
  "Leisure":	["Leisure", "leisure",	"Youtube"],
  "Knowledge":	["Research",	"Information",	"Study"],
  "Office":	["Training",	"Office call", "Office Call",	"office Work"],
  "People":	["Phone Call", "Phone call",	"Text Chat",	"Friends",	"Family", "Conversation"],
  "Skills":	["Sketch", "sketch",	"Ukulele",	"Music",	"Read",	"coding", "Coding"],
  "Tracking":	["Writing",	"Time Tracker",	"Expense"]
}

async function postDataOnGoogleCalendar(){
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Today").getDataRange().getValues();
    //[	"Date",	"Start Time",	"End Time",	"Activity",	"Category"]
    for(var i=1;i<ss.length;i++){

      var arr = ss[i];
      var cat = arr[4]
      if(sheetCat.Body.indexOf(cat) != -1 ){
        if(cat == "Extra" && arr[3]){
          arr[4] = arr[4] + " - " + arr[3];
            // Logger.log(arr[4])
            await pushingOneEvent(arr, calId.Body)
          } else if( cat == "extra" && arr[3]){
            arr[4] = "Extra" + " - " + arr[3];
            await pushingOneEvent(arr, calId.Body)
          }else {
            await pushingOneEvent(arr, calId.Body)
          }
      } else if ( sheetCat.Leisure.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Leisure)

      } else if ( sheetCat.Skills.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Skills)

      } else if ( sheetCat.Knowledge.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Knowledge)

      } else if ( sheetCat.Tracking.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Tracking)
        
      } else if ( sheetCat.Office.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Office)

      } else if ( sheetCat.People.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.People)
        
      } else if ( sheetCat.Actions.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Actions)

      } else if ( sheetCat.Compulsive.indexOf(cat) != -1 ){
          await pushingOneEvent(arr, calId.Compulsive) 
      }
    }
    var response = await postSleepDataOnGoogleFit()
    Logger.log(response)
    if(response.length > 0)
      return true;
    else{
      throw response;
    }
  } catch(e){
    return e;
  }
}

async function pushingOneEvent(arr, calendarId){
try {
    var date = Utilities.formatDate(arr[0], 'GMT+05:30', 'yyyy-MM-dd');
    var startTime = date + 'T' + Utilities.formatDate(new Date(arr[1] - 530000), 'GMT+05:30', 'HH:mm:ssZ')
    var endTime = date + 'T' + Utilities.formatDate(new Date(arr[2] - 530000), 'GMT+05:30', 'HH:mm:ssZ')

    var summary = arr[4]
    var description = arr[3]
    var event = {
      summary,
      description,
      start:{
        dateTime : startTime
      },
      end:{
        dateTime: endTime
      }
    }

 
    // Logger.log(event.summary)
    var response = await Calendar.Events.insert(event,calendarId);
    Logger.log(response.summary)
    return true
  } catch(e){
    return e;
  }
}


// async function postSleepDataOnGoogleCalendar(){
//   var token = await getToken();
//   Logger.log(token);
// }

