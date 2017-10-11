function generateRandomString() {
    var NUM ='';
    var CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 1; i <= 6; i++){
        NUM += CDS.charAt(Math.floor(Math.random() * CDS.length));
    }
    return "DF" + NUM;
}
console.log(generateRandomString());