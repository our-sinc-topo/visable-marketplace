// Filename: contentscript.js
// Date:     July 2017
// Authors:  Evgeni Dobranov
// Purpose:  Defines actions taken on client-loaded page

function get_response(){
    var response;

    // If there is a user selection get that selection, otherwise get whole page
    if (window.getSelection().toString())
        response = window.getSelection().toString();
    else
        response = document.body.innerText;

    return response
}

// Send message to the extension with page content payload
chrome.runtime.sendMessage({
	action: "getSource",
	source: get_response()
    });

// Perform client-loaded page search if signaled from mapscript.js
chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.action == "searchForWord") {
    	window.find(message.source, false, false, true, false);
    }
});