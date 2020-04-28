var redirectUri = "https://princemerluza.github.io/zoom-to-tableau-wdc-test/index.html";
var clientId = "3U9rD5THSbucRLn5_W2ynQ";


(function () {
    var myConnector = tableau.makeConnector();

    myConnector.init = function(initCallback){
        var accessToken = Cookies.get("access_token");
        console.log("Access token is '" + accessToken + "'");
        var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;

        initCallback();

        // If we are not in the data gathering phase, we want to store the token
        // This allows us to access the token in the data gathering phase
        if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
            if (hasAuth) {
                tableau.password = accessToken;
            }
        }     
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
        throw new Error(token);
        $.ajax('https://api.zoom.us/v2/users/me/meetings', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token
            },
            complete: function(data, status){
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
            console.log(data);
            Cookies.set('access_token', JSON.parse(data.responseText), {path: ''});
            window.location.href = redirectUri;
        }
    })
}

$(document).ready(function() {
    var token = Cookies.get('access_token');
    if(token){
        document.getElementById('btn-submit').style.display = '';
        document.getElementById('btn-auth').style.display = 'none';
    }else{
        document.getElementById('btn-submit').style.display = 'none';
        document.getElementById('btn-auth').style.display = '';
    }

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
    }

    $("#btn-submit").click(function () {
        tableau.connectionName = "Zoom Connection";
        tableau.submit();
    });

    $("#btn-auth").click(function () {
        window.location.href = "https://zoom.us/oauth/authorize?response_type=code&"
            + "client_id=" + clientId
            + "&redirect_uri=" + redirectUri;
    });
});