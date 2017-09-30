// FILE: htmlParser.js
// DATE: September 2017
// PURPOSE: Return the names of locations in the html content on a webpage

// Goal of function: return the first place (not just the first word) in a list of places
// Example input: "New York City, Oakland, and San Francisco"
// Example output: "New York City"
function firstToken(str) {
  	var getfirstToken = /^[A-Z]+[a-z]+[ \-]?(?:[A-Z]+[a-z]+)*|^[A-Za-z\-]*/ // Example at: https://regex101.com/r/L09k74/1/debugger
  	first_token = getfirstToken.exec(str)[0];
  	return first_token
}

// Goal of function: match overlapping strings (don't consume characters when executing regex)
// Example input: "12345"
// Example output: ["123", "234", "345"]
function match_overlap(input, re) {
	var r = new Array();

    if (!re.global) re = new RegExp(
        re.source, (re+'').split('/').pop() + 'g'
    )

	while ((match = re.exec(input)) !== null) {
    	if (match.index === re.lastIndex) {
	        var first_token = firstToken(match[1]);
	        var token_length = first_token.length;
	        if (token_length == 0) {
	        	token_length = 1
	        }
	        re.lastIndex = re.lastIndex + token_length;
    	}
    r.push(match[1]);
	}
	return r
}

// Goal of function: find all the unique characters in array
// Example input: ["New York City", "Albany, New York", "New York City]
// Example output: ["New York City", "Albany, New York"]
function unique(arr) {
    var u = {}, arr_unique = [];

    for(var i = 0, l = arr.length; i < l; ++i) {
        if(!u.hasOwnProperty(arr[i])) {
            arr_unique.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return arr_unique;
}

// Goal of function: check if the input to the parser is a single token so that the user can highlight one word and map it
// Example input: "San Francisco"
// Example output: true
function if_one_token(str, find_places) {
	var spaceCount = (str.split(" ").length - 1);
	var len_str = str.length;
	var place = find_places.exec(str);
	if (place != null) {
		var len_place = place[0].length;
	}
	else {
		var len_place = 0
	}

	if (spaceCount <= 1 || len_str == len_place) {
		return true
	}
}

// Goal of function: check if a word that the parser considered a place is in a blacklisted or can't be a place b/c of its POS
// Example input: "American"
// Example output: false
function is_place(str) {
	var lexicon = blacklist()
	var tag = str.terms().data()[0];
	var blacklist = str.replace((/( )/, ''), lexicon);

	if (tag != undefined) {
		if (tag[0]["tags"][1] != "Demonym" && tag[0]["tags"][1] != "Adjective" &&
			tag[0]["tags"][1] != "Adverb" && str.organizations().data().length == 0 &&
			blacklist.match('#Company')["list"].length == 0 && blacklist.match('#Date')["list"].length == 0 &&
			blacklist.match('#Planet')["list"].length == 0 && blacklist.match('#Misc')["list"].length == 0 &&
			tag[0]["tags"][1] != "Preposition" && tag[0]["tags"][1] != "Currency" && tag[0]["tags"][0] != "SportsTeam") {
			return true
		}
		else {
			return false
		}
	}

	else {
		return false
	}
}

// Goal of function: find all the places in html content
// Example input: "I went to San Francisco first, then Oakland to see the A's play the Giants."
// Example output: ["San Francisco", "Oakland"]
function parse(html) {
	var find_places = /(?:[A-Z][a-z]+\s?)+/ // Example at: https://regex101.com/r/sewpyL/1/debugger
	var places_context = /(?=(\b(?:(?:\. )*[A-Z]*[a-z]+)\b[ ,]?\s*(?:([A-Z]+[a-z]+\s?))(?:[A-Z]+[a-z]+)*(?:,*)(?:\s*[A-Z]*[a-z]+[ ,']?){0,2}))/ // Example at: https://regex101.com/r/k04MvA/2/debugger
	var place_comma_place = /(?:[A-Z]+[a-z]+\s?)*(?:,\s[A-Z]+[a-z]+\s?)/ // Example at: https://regex101.com/r/ANL3oV/1/debugger
	var list_of_places = /(?:[A-Z]+[a-z,]+\s?)*(?:(?:(?:,|, and| and)))(?:\s*[A-Z]+[a-z]+)*|(?:,\s[A-Z]+[a-z]+[ \-]?)/ // Example at: https://regex101.com/r/jeKCYA/1/debugger
	var one_token = if_one_token(html, find_places)
	var places_list = new Array();

	// If the use highlights a single token then always geodcode that token
    if (one_token == true) {
		places_list.push(find_places.exec(html)[0])
	}

	else {
		// Get all places (and their surrounding words) from html and put each string in an array (each string contains a place)
		var array = match_overlap(html, places_context);

		for (var i = 0; i < array.length; i++) {
        	var element = array[i]
        	var nlpStr = nlp(element)
        	var inner_place = list_of_places.exec(element);
        	var inner_list = place_comma_place.exec(element);
        	var contains_person = nlpStr.match('* #Person *').out('text');
        	var selected = nlp(find_places.exec(element))
        	var contains_noun = selected.nouns().out('array')
        	var prep_matches = nlpStr.match('(at|in|on|through) #Noun *').out('text');

        	// Consider all comma-seperated places ("Albany, New York") as one place, not two
        	if (inner_list != null) {
            	var place = inner_place[0].split(/,/)[0]
            	if (place != null) {
                	places_list.push(place[0]);
            	}
            	else {
                	places_list.push(inner_list[0]);
            	}
          	}

          	// Persons are named-entities that look like places, so explicitely remove all names
          	//	unless the name is a POS such that it must be a location
          	else if (contains_noun.length > 0) {
	            var place = find_places.exec(element)

	            if (contains_person.length > 0) {
	                var cont_matches = (nlpStr.terms(1).data()[0])["tags"][5]
	                if ((prep_matches.length > 0) && cont_matches != "Contraction" && is_place(nlp(place[0]) == true)) {
	                    places_list.push(place[0]);
	                }
	            }
	            else {
	                if (is_place(nlp(place[0])) == true) {
	                    places_list.push(place[0]);
	                }
	            }
	        }

            else {
              	var place = find_places.exec(element)

              	// Remove all nouns at the start of a sentence 
              	// 	unless they are a POS such that they have to be a location
              	if (place_start != null) {
              		var start_of_sentence = /(?:\.\s(?:\s*))+([A-Z]+[a-z]+[\-]?)/
              		var place_start = start_of_sentence.exec(array[i])

                	if (is_place(nlp(place[0]) == true && (nlpStr.match('* #TitleCase (with|on|around|through|at) *').out('text') != undefined || 
                		nlpStr.match('* #TitleCase and #TitleCase *').out('text') != undefined || nlpStr.match('* #Plural (#Copula|#PresentTense) *').out('text') != undefined))) {
                    	places_list.push(place[0])
                	}
               	}

              	else {

                    if (is_place(nlp(place[0])) == true) {
                        places_list.push(place[0]);
                    }
               }
            }
        }
    }
	var places_arr = unique(places_list)
	return places_arr
}
