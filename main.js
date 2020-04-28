var redirectUri = "https://princemerluza.github.io/zoom-to-tableau-wdc-test/index.html";
var clientId = "3U9rD5THSbucRLn5_W2ynQ";


(function () {
    var myConnector = tableau.makeConnector();

    myConnector.init = function(initCallback){
        tableau.authType = tableau.authTypeEnum.custom;

        var accessToken = Cookies.get('access_token');
        // if(!accessToken){
        //     var clientCookies = document.cookie.split(';').map(function(c){
        //         c.trim()
        //     });
        //     var clientCookiesObj = {};
        //     for(var i = 0; i < clientCookies.length; i++){
        //         var pair = clientCookies[i].split('=');
        //         clientCookiesObj[pair[0]] = pair[1];
        //     }
        //     accessToken = clientCookiesObj['access_token_c'];
        // }
        tableau.password = accessToken;

        initCallback();
    }

    myConnector.getSchema = function(schemaCallback){
        var cols = [{
            id: 'id',
            dataType: tableau.dataTypeEnum.string
        }, {
            id: 'type',
            dataType: tableau.dataTypeEnum.int
        }, {
            id: 'duration',
            dataType: tableau.dataTypeEnum.int
        }]

        var tableSchema = {
            id: 'meetings',
            alias: 'Meetings of the user',
            columns: cols
        }

        schemaCallback([tableSchema]);
    };
    

    myConnector.getData = function(table, doneCallback){
        var token = tableau.password;
        
        $.ajax('https://api.zoom.us/v2/users/me/meetings', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token
            },
            complete: function(data){
                var meetings = data.responseJSON.meetings;
                var tableData = [];

                // NOTE: Doesn' support paging
                for(var i = 0; meetings.length; i++){
                    tableData.push({
                        id: meetings[i].id,
                        type: meetings[i].type,
                        duration: meetings[i].duration,
                    });
                }

                table.appendRows(tableData);
                doneCallback();
            }
        })
    };

    tableau.registerConnector(myConnector);
})();


function getToken(code){
    $.ajax('https://ri64kb0pda.execute-api.ap-southeast-1.amazonaws.com/getZoomAPIToken?code=' + code, {
        complete: function(data){
            // document.cookie = 'access_token_c=' + data.responeText;
            console.log('Got that sweet token');
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
        history.pushState({}, null, redirectUri);
    } else {
        window.location.href = "https://zoom.us/oauth/authorize?response_type=code&"
            + "client_id=" + clientId
            + "&redirect_uri=" + redirectUri;
    }

    $("#submitButton").click(function () {
        tableau.connectionName = "Zoom Connection";
        tableau.submit();
    });
});