//instagram Graph API 
var instragramID = 'input here';
var ACCESS_TOKEN = "input here";

var media_limit_get = 10


//sheet infor
var sheet_SSId = '1sU917U1ByBTuT1IQ-UPZiel9AdJBYKTEesF8B7gsYb4';
var mySS = SpreadsheetApp.openById(sheet_SSId); 

var sheet_data_name = "media_data"; 
var sheet_data = mySS.getSheetByName(sheet_data_name);

var sheet_user_name = "user_name"; 
var sheet_user = mySS.getSheetByName(sheet_user_name);


//debug test
debug_test_EN = false


function getInstagramMedia(){
  userlist = get_user_name(sheet_user)
  
  for (const [key, value] of Object.entries(userlist)) {
    console.log(key, value);
    search_media_of_user(value);
  }
}

let getVarNameFromObject = (nameObject) => {
  for(let varName in nameObject) {
    return varName;
  }
}

function search_media_of_user(username){
  if(username=="") return

  var instagram_url = 'https://graph.facebook.com/v4.0/'+ instragramID + '?fields=business_discovery.username('+ username +'){followers_count,follows_count,media_count,media.limit(' + media_limit_get + '){caption,children,media_type,media_url,timestamp,permalink}}&access_token='+ ACCESS_TOKEN;

  var encodedURI = encodeURI(instagram_url);
  var response = UrlFetchApp.fetch(encodedURI); //URLから情報を取得
  var jsonData_insta = JSON.parse(response);//JSONデータをパース

  //find last id from sheet
  last_id = findlast_id(sheet_data, username)
  debug_test("last_id", last_id)


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
    //             0        1         2         3           4           5         6    7     8
    var newData =[permalink,caption,media_type,media_url, "instagram", timestamp, "", id, username];


    debug_test("last_append_row", sheet_data.getLastRow())
    sheet_data.appendRow(newData);
    sheet_data.setRowHeightsForced(sheet_data.getLastRow(), 1, 21); //21 is default
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
function get_user_name(sheet){
  var userlist = []
  all_users = sheet.getDataRange().getValues();
  for (var i = 0; i < all_users.length; i++) {
    userlist.push(all_users[i][0])
  }
  return userlist
}
function addSheet(sheet, username) {
  sheet.insertSheet();
  newSheet.setName(username);
}


function debug_test(name, variable){
  if (debug_test_EN){
    console.log(name, variable)
  }
}




