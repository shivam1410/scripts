function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Button')
    .addItem('Save Today\'s data', 'moveTodayEntriesToMainFormSheet')
    .addToUi();
}

async function moveTodayEntriesToMainFormSheet() {

  var todaysheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Today");
  var form = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form");
  
  var lastRow_form = form.getLastRow();
  var lastRow_today = todaysheet.getLastRow();
  var data = todaysheet.getDataRange().getValues();
  
  Logger.log(lastRow_form)
  data = data.slice(1);

  var res = await postDataOnGoogleCalendar();
  form.getRange(lastRow_form + 1,1,data.length, data[0].length).setValues(data);
  
  if(res == true){
    todaysheet.getRange(`A2:E${lastRow_today}`).clearContent();
  } else {
    Errormodal(res);
  }
}

function Errormodal(error){
  var name = "Some error posting data on Google Calendar"
  var html = `<html><body><div target="blank">'+ name +'</div></body></html>`;
  var html = `<html>
              <body>
                <div target="blank">${name}</div>
                <div>${error}</div>
              </body>
            </html>`
  var ui = HtmlService.createHtmlOutput(html)
  SpreadsheetApp.getUi().showModelessDialog(ui,"Oauth");
}  
