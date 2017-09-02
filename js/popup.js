// Filename: popup.js
// Date:     July 2017
// Authors:  Evgeni Dobranov & Thomas Binu
// Purpose:  Defines extension UI and functional behavior

// Entry point into app functionality
function onPopupLoad(){

    // Immediately inject script to get page content
    chrome.tabs.executeScript(null, { file: "js/contentscript.js" }, function(response)
    {
        if (chrome.runtime.lastError) {
            console.log("Chrome runtime error: ", chrome.runtime.lastError.message);
        }
    });

    // Listener for communication with contentscript.js
    chrome.runtime.onMessage.addListener(function(request, sender) {
        if (request.action == "getSource") {


            console.log(places);

            //var pageContent = (request.source).toString();
            //var pageContentCleaned = pageContent.replace(/[^a-zA-Z0-9.,:;'\s]/gi, '').replace(/(\r\n|\n|\r)/gm,' ')//.replace(/(?:[A-Z]+[a-z]{2,}(?:and|of|is|to|the|a|from|in|out)*[ A-za-z\&,-:]*){4,}/, '');
            //var places = main(pageContentCleaned);

            var places = ['Seattle', 'Miami', 'Chicago', 'Moscow', 'Tahiti', 'Hawaii', 'Fiji', 'Bulgaria', 'India', 'Belgium', 'France', 'Brussels', 'Madrid'];

            renderEsriMap(places);
            $('#splash').hide();
        }
    });

}
window.onload = onPopupLoad;
