function generateRandomString() {
    var NUM ='';
    var CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < 5; i++){
        NUM += CDS.charAt(Math.floor(Math.random() * CDS.length));
    }
    var POS = Math.floor(Math.random() * 6)+1;
    console.log(POS);
    var result = NUM.substr(0, POS) + "DF" + NUM.substr(POS);
    return result;
}
console.log(generateRandomString());