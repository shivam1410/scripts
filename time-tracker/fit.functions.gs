
async function postSleepDataOnGoogleFit() {
  try {
    var token = await getToken();
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sleep").getDataRange().getValues();
    // range to start from
    var startFrom = Number(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sleep').getRange(1, 10).getValue())

    //[Date, Start Time, End Time]
    var resArray = [];
    let end_index = startFrom;

    for (var i = startFrom; i < ss.length; i++) {
      var id = `sleepSheet` + (i); 
  
      var date = Utilities.formatDate(new Date(ss[i][0]), "IST", "yyyy-MM-dd'T'")
      var start_time = Utilities.formatDate(new Date(ss[i][1]), "IST", "HH:mm:ss")
      var end_time = Utilities.formatDate(new Date(ss[i][2]), "IST", "HH:mm:ss")
      var startTimeMillis = Date.parse(date + start_time) - 9.5*60*60*1000 //// seconds in -9.5 hours
      var endTimeMillis = Date.parse(date + end_time) - 9.5*60*60*1000 //// seconds in -9.5 hours
      // Logger.log("%d, %d", ss[i][5], ss[i][6])
      Logger.log("%d, %d", startTimeMillis, endTimeMillis)
      if (id && startTimeMillis && endTimeMillis) {
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
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json;encoding=utf-8"
        }

        var options = {
          headers,
          "method": "put",
          "muteHttpExceptions": true,
          payload: JSON.stringify(sleepData),
        }

        var response = await UrlFetchApp.fetch(URL, options)
        Logger.log(response)
        resArray.push(JSON.parse(response).id);
        end_index = i+1;
      } else {
        continue;
      }
    }
    var cell_res = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sleep").getRange(2,11);
    var cell_last = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sleep").getRange(1,10);
    if(resArray.join(", ")){
      cell_res.setValue("Success : " + resArray.join(", ") + " added to database");
      cell_last.setValue(end_index);
      return resArray;
    } else {
      resArray[0]="NosleepData";
      cell_res.setValue("Success : " + resArray.join(", ") + " added to database");
      cell_last.setValue(end_index);
      return resArray;
    }
    
  } catch (e) {
    var cell = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sleep").getRange(2, 11);
    cell.setValue("Error : " + e);
    return e;
  }
}


async function fetchToken() {
  var token = await getToken();
  Logger.log(token);
}

