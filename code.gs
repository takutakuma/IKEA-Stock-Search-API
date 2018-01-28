function doGet(e) {
  if(e.parameter.productNo){
    productNumber = e.parameter.productNo;
  }else{
    productNumber = "30339293";
  }

  var stockInfo = getStockInfoJson(productNumber);
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify(stockInfo));
  return output;
}


function getStockInfoJson(productNumber) {
  //URLと対象商品
  const productURL ='http://www.ikea.com/jp/ja/iows/catalog/availability/';

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("sheet");
  if ( !sheet ) return;
  
  //スクレイピングしデータを店舗毎に切り分け
  var storeNumbers = [448,447,887,359];
  var storeNames = ["港北","TOKYO BAY","新三郷","立川"];
  var html = getStockInfo(productURL + productNumber);
  var stockInfo = [];

  for(var i = 0;storeNumbers.length > i;i++){
    var storeNumber = storeNumbers[i];
    
    stockInfo.push(getInfoStore(storeNumber,html));
  }
  
  //Jsonの作成
  return makeJson(storeNames,stockInfo,productNumber);
  
}

function makeJson(storeNames,stockInfo,productNumber) {

  //店舗名と在庫情報をまとめる
  var jsonArray = [];
  
  for(var i = 0;storeNames.length > i ;i++){
    var json = new Object();
    json['storeName'] = storeNames[i];
    json['stock'] = stockInfo[i];
    
    jsonArray.push(json);
  }
  
  var data = new Object();
  
  data['status'] = 200;
  data['productNo'] = productNumber;
  data['stocks'] = jsonArray;
  
  return data;
}

//在庫情報の取得
function getStockInfo(productURL){
 
  var html = UrlFetchApp.fetch(productURL).getContentText();

  return html;
}

//店舗毎の在庫情報の取得
function getInfoStore(storeNumber,html){
  var info = Parser.data(html)
                  .from('<localStore buCode="' + storeNumber.toString()) 
                  .to('</localStore>')
                  .build();  
  
  var stockInfo = Parser.data(info)
                        .from("<availableStock>")
                        .to("</availableStock>")
                        .build();
 
  return stockInfo;
}
  
