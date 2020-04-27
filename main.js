var redirectUri = "https://princemerluza.github.io/zoom-to-tableau-wdc-test/";
var clientId = "3U9rD5THSbucRLn5_W2ynQ";

$(document).ready(function() {
    if(window.location.href.includes("code")){
        console.log("Yep");
    } else {
        window.location.href = "https://zoom.us/oauth/authorize?response_type=code&" + "client_id=" + clientId + 
        "&redirect_uri=" + redirectUri;
    }
});