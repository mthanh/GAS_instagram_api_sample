//instagram Graph API 
var instragramID = 'input here';
var ACCESS_TOKEN = "input here";

var media_limit_get = 10


//sheet infor
var sheet_SSId = '1l9rzGRiTja5lnzLGnFxUYX2K2N0jqwAm04vL4nWcC9c';
var mySS = SpreadsheetApp.openById(sheet_SSId); 

// var sheet_user_name = "user_sheet"; 
// var sheet_user = mySS.getSheetByName(sheet_user_name);
var sheet_user = mySS.getActiveSheet();


//debug test
debug_test_EN = false


function getInstagramMedia(){
  userlist = get_user_sheet_data(sheet_user)
  
  // console.log(userlist)

  for (const [key, user_sheet] of Object.entries(userlist)) {
    console.log(key, user_sheet);

    search_media_of_user(user_sheet);
  }
}


function search_media_of_user(user_sheet){
  if(user_sheet=="") return

  username = user_sheet["username"]
  sheetID = user_sheet["sheetID"]
  sheetName = user_sheet["sheetName"]
  var sheetMedia = SpreadsheetApp.openById(sheetID); 

  var sheet_data = sheetMedia.getSheetByName(sheetName);
  if (sheet_data == null) {
    sheetMedia.insertSheet(sheetName);
    var Title_data = ["movie",	"Maintext",	"description",	"image",	"from sns",	"date",	"cntrol",	"id",	"user_name"];
    sheetMedia.appendRow(Title_data)
    // sheetMedia.getRange("A1").setValue(Title_data); 

    //then get again
    sheet_data = sheetMedia.getSheetByName(sheetName);
  }


  var instagram_url = 'https://graph.facebook.com/v4.0/'+ instragramID + '?fields=business_discovery.username('+ username +'){followers_count,follows_count,media_count,media.limit(' + media_limit_get + '){caption,children,media_type,media_url,timestamp,permalink}}&access_token='+ ACCESS_TOKEN;

  var encodedURI = encodeURI(instagram_url);
  var response = UrlFetchApp.fetch(encodedURI); //URLから情報を取得
  var jsonData_insta = JSON.parse(response);//JSONデータをパース

  //find last id from sheet
  last_id = findlast_id(sheet_data, username)
  debug_test("last_id", last_id);


  actually_media_get = Object.keys(jsonData_insta["business_discovery"]["media"]["data"]).length
  max_size_limit = Math.min(media_limit_get, actually_media_get)


  //check where is last_id inside media_data
  last_id_match = max_size_limit - 1 

  for (var i = 0; i < max_size_limit; i++){

    var new_id = jsonData_insta["business_discovery"]["media"]["data"][i]["id"]

    if (last_id == new_id){
      last_id_match = i-1//save to the next
      break
    }
  }
  

  debug_test("last_id_match", last_id_match)
  if(last_id_match>0){
    console.log("  updating data")
  }
  else{
    console.log("  no data update")
  }


  //save from the old -> new
  for (var i = last_id_match; i >= 0; i--){
    var permalink = jsonData_insta["business_discovery"]["media"]["data"][i]["permalink"]
    var caption = jsonData_insta["business_discovery"]["media"]["data"][i]["caption"]
    var media_type = jsonData_insta["business_discovery"]["media"]["data"][i]["media_type"]
    var media_url = jsonData_insta["business_discovery"]["media"]["data"][i]["media_url"]
    var timestamp = jsonData_insta["business_discovery"]["media"]["data"][i]["timestamp"]
    var id = jsonData_insta["business_discovery"]["media"]["data"][i]["id"]


    debug_test("permalink", permalink)
    debug_test("caption", caption)
    debug_test("media_type", media_type)
    debug_test("media_url", media_url)
    debug_test("timestamp", timestamp)
    debug_test("id", id)
 


    //if the newest id existed -> STOP
    var newData =[
    permalink,    //0 movie, link media
    caption,      //1 Maintext
    "",           //2 description
    media_url,    //3 image
    "instagram",  //4 from sns
    timestamp,    //5 date
    media_type,   //6 cntrol
    id,           //7 id
    username];    //8 user_name

    sheet_data.appendRow(newData);
    sheet_data.setRowHeightsForced(sheet_data.getLastRow(), 1, 21); //21 is default

    debug_test("last_append_row", sheet_data.getLastRow())
  }
}


function findlast_id(sheet, username){
  var values = sheet.getDataRange().getValues();

  last_id = "NULL"
  for (var i = values.length - 1; i > 0; i--) {
    var user_in_sheet = values[i][8];
    if (user_in_sheet == username) {
      last_id = values[i][7]
      break
    }
  }

  return last_id
}


function get_user_sheet_data(sheet){
  var userlist = []
  all_users = sheet.getDataRange().getValues();
  for (var i = 1; i < all_users.length; i++) {
    var user_element = {}
    user_element["username"] = all_users[i][0]
    user_element["sheetID"] = all_users[i][1]
    user_element["sheetName"] = all_users[i][2]
    userlist.push(user_element)
  }
  return userlist
}
function addSheet(sheet, username) {
  sheet.insertSheet(username);
}


function debug_test(name, variable){
  if (debug_test_EN){
    console.log(name, variable)
  }
}





