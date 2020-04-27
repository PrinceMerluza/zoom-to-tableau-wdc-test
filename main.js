var redirectUri = "https://princemerluza.github.io/zoom-to-tableau-wdc-test/index.html";
var clientId = "3U9rD5THSbucRLn5_W2ynQ";
var token = '';

function getToken(code){
    $.ajax('https://ri64kb0pda.execute-api.ap-southeast-1.amazonaws.com/getZoomAPIToken?code=' + code, {
        complete: function(data){
            console.log(data);
        }
    })
}

$(document).ready(function() {
    // Get Query Parameters
    var queryParamsString = window.location.href.includes('?') ? 
            window.location.href.split("?")[1] : null;
    var queryParams = {};

    if(queryParamsString){
        queryParamsString.split('&').forEach(function(q){
            var pair = q.split('=');
            queryParams[pair[0]] = pair[1];
        });
        console.log(queryParams);
    } 
        
    if(queryParams.code){
        getToken(queryParams.code);
    } else {
        window.location.href = "https://zoom.us/oauth/authorize?response_type=code&"
            + "client_id=" + clientId
            + "&redirect_uri=" + redirectUri;
    }
});