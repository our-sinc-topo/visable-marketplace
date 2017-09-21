// find the length of the first word in a string or token
function first_word(str) {
  var firstWords = /^[A-Z]+[a-z]+[ \-]?(?:d[a-u].)?(?:[A-Z]+[a-z]+)*|^[A-Za-z\-]*/;
  firstWord = firstWords.exec(str)[0]
  console.log(str)
  console.log(firstWord)
  return firstWord
}

// after finding a match remove only the first word or token in the string from future matches
// add match to array and look again for more matches
// e.g. don't consume characters when matching regex
function match_overlap(input, re) {
	var r = new Array();
    if (!re.global) re = new RegExp(
        re.source, (re+'').split('/').pop() + 'g'
    );
	while ((m = re.exec(input)) !== null) {
    	if (m.index === re.lastIndex) {
    	console.log(m)
    	console.log(m[1])
        var first_token = first_word(m[1])
        console.log(first_token)
        var token_length = first_token.length
        console.log(token_length)
        if (token_length == 0) {
        	token_length = 1
        }
        re.lastIndex = re.lastIndex + token_length;
    	}
    console.log(m[1])
    r.push(m[1]);
	}
	return r
}

// return all unique values in array
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

function get_second_token(str) {
    // var tags = nlp(place_start[0]).terms(1).data()
    // get all but first word (usually just second word)
    var get_tagged_token = /(?:^.\s\S*\s)([A-Z]+[a-z]+[ \-,]+[A-Z]?[a-z]*)/ // regex to only get second token (in group 1)
    var tagged_token = get_tagged_token.exec(str)
    if (tagged_token != null) {
        // push second word to list
		return tagged_token[1]
    }
    else {
        return str
    }
}

function get_arr(str) {
	// if word is at the start of a sentence
	// make sure that first word is a noun and can be included in token
	if (str.charAt(0) == '.') {
		var arr = get_second_token(str);
	}
	else {
	  	var arr = str
	}
	return arr
}


function check_one_token(str){

}

function if_one_token(str, find_places) {
	var spaceCount = (str.split(" ").length - 1);
	var len_str = str.length;
	var len_place = find_places.exec(str)[0].length;
	if (spaceCount <= 1 || len_str == len_place) {
		return true
	}

}

// check if identified place token matches all POS criteria
function is_place(str) {
	// blacklist of words that will always have the same feature set as a place
	// but will almost never be a place so they're specifically excluded (unless the place is listed as a city within a state/province/country, e.g. "Monday, Texas")
	// "there" is considered a noun in the compromise lexicon so is also specifically excluded
	var blacklist = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March',
	'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar',
	'Apr', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Mercury', 'Venus', 'Earth', 'Mars',
	'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'there', 'There']
	// list of forbes 500 organizations and 100 most mentioned organizations on twitter
	// organizations often have the same feature set as places so these companies are specifically excluded
	var lexicon_companies = org_lexicon();
	// list of 500 most common nouns
	// sometimes these nouns are formatting with capital letters either b/c (1) they're at the start of a sentence or (2) they're part of a title
	// in these case they have the same feature set as places so they're specifically excluded
	var lexicon_nouns = mostCommonNouns();
	// identified place must not be a demonym, adjective, adverb, or company
	// identified place must not be a day of the week or month of the year

	if (nlp(str).terms().data()[0] != undefined) {
		if (nlp(str).terms().data()[0]["tags"][1] != "Demonym" && nlp(str).terms().data()[0]["tags"][1] != "Adjective" &&
			nlp(str).terms().data()[0]["tags"][1] != "Adverb" && nlp(str).organizations().data().length == 0 &&
			nlp(str.replace(/( )/, ''), lexicon_nouns).match('#Company')["list"].length == 0 && 
			nlp(str.replace(/( )/, ''), lexicon_nouns).match('#CommonNoun')["list"].length == 0 &&
			nlp(str).terms().data()[0]["tags"][1] != "Preposition" && nlp(str).nouns().not(blacklist).length > 0 &&
			nlp(str).terms().data()[0]["tags"][1] != "Currency" && nlp(str).terms().data()[0]["tags"][0] != "SportsTeam") {
			return true
		}
	}
	else {
		return false
	}
}

// rule-based nlp:
// start with four-token string: a possible place, its subsequent word and previous two words
// places_context regex gets this string
// different regex is performed depending on POS characteristics of the 4-token string
function parse(html) {

	// get sequence of words that start with a capital letter
	// e.g. "San Francisco" or "Dallas"
	var find_places = /(?:[A-Z][a-z]+[ ]?)+/
	// get token in the sequence above and its subsequent word and two previous words
	// e.g. "is near San Francisco coast"
	var places_context = /(?=(\b(?:(?:\. )*[A-Z]*[a-z]+)\b[ \-,]?\s*(?:([A-Z]+[a-z]+[ \-]?))(?:d[a-u].)?(?:[A-Z]+[a-z]+)*(?:,*)\s*\S*\s*\S*(?:\s*[A-Z]*[a-z]+[ \-,']?){0,2}))/

	// get all the comma-seperated places not in a list of places
	// e.g., return "Albany, California" as one place if it's mentioned outside of a list
	// a list suggests that "Albany" and "California" are two seperate places, but the string "Albany, California" in the middle of a sentence suggests one place in California
	var iloc_comma_bloc = /(?:[A-Z]+[a-z]+[ \-]?)*(?:, [A-Z]+[a-z]+[ \-]?)/ // place_comma_place_comma_place | ...place_comma_and_place | ...place_and_place | iloc_comma_bloc
	// get all the places in a list of places
	// e.g. returns "Albany, California, Nevada, and Sacramento" as one string
	var place_comma_place_comma_place = /[A-Z]+[a-z]+[ \-]?(?:(?:,|, and| and))[ ][A-Z]+[a-z]+[ \-,]*(?:(?:(?:,|, and| and)))(?:[ A-Z]*[a-z]+[ \-]*)*|(?:, [A-Z]+[a-z]+[ \-]?)/ // place_comma_place_comma_place | ...place_comma_and_place | ...place_and_place
	// get the first place in a list of places
	// e.g. return "Albany" in the list "Albany, California, Nevada, and Sacramento"
	// makes sure that each place in a list is returned
	var get_first_place = /[A-Z]+[a-z]+[ \-]?(?=(?:,|, and| and)((?:[ ][A-Z]+[a-z]+)(?:(?:[ \-,]*)(?:[A-Z]+[a-z]+[ \-]*)))*)/
	// empty list to append all places to
	// used as output of main() --> all places in list are sent to geocoder
	var places_list = new Array();

	var one_token = if_one_token(html, find_places)

    if (one_token == true) {
		places_list.push(find_places.exec(html)[0])
	}
	else {

        // get all four-token strings without consuming characters returned in places_context
        // e.g. allows the return of both "is near San Francisco coast" and "coast and Oakland port" from the sentence "The boat is near the San Francisco coast and Oakland port."
        var array = match_overlap(html, places_context);

        // iterate iver all 4-token strings in array
        // array is all 4-token strings on webpage (non-character-consuming)
        for (var i = 0; i < array.length; i++) {

          var arr = get_arr(array[i])

          var inner_place = place_comma_place_comma_place.exec(arr); // list of places
          var inner_list = iloc_comma_bloc.exec(arr); // comma-seperated place

          var contains_person = nlp(arr).match('* #Person *').out('text');
          var selected = nlp(find_places.exec(arr))
          var contains_noun = selected.nouns().out('array')
          var prep_matches = nlp(arr).match('(at|in|on|through) #Noun *').out('text');

          // if the place is in a list of places
          if (inner_list != null) {
            // get first place in list of place
            var place = get_first_place.exec(inner_place[0])
            if (place != null) {
                places_list.push(place[0]);
            }
            else {
                places_list.push(inner_list[0]);
            }
          }

          // if place is a noun and not in the blacklist (terms and sale come up on articles as Terms of Sale which has the feature set of a place)
          else if (contains_noun.length > 0 && nlp(find_places.exec(arr)).nouns().not(['Terms','Sale','Copyright']).length > 0) {
            var place = find_places.exec(arr)
            // if the noun is the name of a famous person or a common English name
            if (contains_person.length > 0) {
                // push if the name isn't preceded by a contraction and is preceded by a location-designating preposition
                // otherwise the name is actually a name so don't push name to list of places
                var cont_matches = (nlp(arr).terms(1).data()[0])["tags"][5]
                if ((prep_matches.length > 0) && cont_matches != "Contraction" && is_place(place[0]) == true) {
                    places_list.push(place[0]);
                }
             }
             else {
                if (is_place(place[0]) == true) {
                    places_list.push(place[0]);
                }
             }
         }

             else {
              var place = find_places.exec(arr)
              var start_of_sentence = /(?:\.\s(?:\s*))+([A-Z]+[a-z]+[\-]?)/
              var place_start = start_of_sentence.exec(array[i])
              // if the place is at the start of a sentence (words at the start of a sentence often have the same feature set as locations)
              if (place_start != null) {
                // add place to list only if it's (1) not an organization, (2a) not one of the 500 most common nounns unless (2b) that noun is not followed by a location-specific preposition
                // compromise recognizes words at the start of a sentence as #TitleCase, not #Noun
                if (is_place(place[0]) == true && (nlp(place, most_common_nouns).nouns().data().length == 0 || nlp(arr).match('* #TitleCase with|on|around|through|at').out('text') == undefined)) {
                    places_list.push(place[0])
                }
               }
              else {
                    if (is_place(place[0]) == true) {
                        places_list.push(place[0]);
                    }
               }
            }
        }
    }

	var places_arr = unique(places_list)
	return places_arr
}
