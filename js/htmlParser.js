// find the length of the first word in a string or token
/*
function first_word(str) {
  var firstWords = [];
  for (var i=0; i<str.length; i++)
  {
    var firstWord = str.substr(0, str.indexOf(" "));
    firstWords.push(firstWord);
  }
  return firstWords[0]
}
*/
function first_word(str) {
  var firstWords = /^[A-Z]+[a-z]+[ \-]?(?:d[a-u].)?(?:[A-Z]+[a-z]+)*|^[A-Za-z\-]*/;
  firstWord = firstWords.exec(str)[0]
  return firstWord
}

// after finding a match
// remove only the first word or token in the string from future matches
// add match to array and look again for more matches
// after finding a match
// remove only the first word or token in the string from future matches
// add match to array and look again for more matches
function match_overlap(input, re) {
	var r = new Array();
  if (!re.global) re = new RegExp(
        re.source, (re+'').split('/').pop() + 'g'
    );
    // var count = 0
	while ((m = re.exec(input)) !== null) {
		// count = count + 1
		// if (count >= 100) {
			// console.log(count)
			// console.log(m)
			// console.log(first_word(m[1]))
			//console.log(re.lastIndex)
			// throw "stop execution";
		// }
    	if (m.index === re.lastIndex) {
        var first_token = first_word(m[1])
        var token_length = first_token.length
        if (token_length == 0) {
        	token_length = 1
        }
        re.lastIndex = re.lastIndex + token_length;
    	}
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
		arr = get_second_token(str);
	}
	else {
	  	var arr = str
	}
	return arr
}

// check if identified place token matches all POS criteria
function is_place(str, lexicon, array_i) {
	blacklist = ['Monday','Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February', 'March',
	'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar',
	'Apr', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Mercury', 'Venus', 'Earth', 'Mars',
	'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'there', 'There']

	// identified place must not be a demonym, adjective, adverb, or company
	// identified place must not be a day of the week or month of the year
	if (nlp(str).terms().data()[0]["tags"][1] != "Demonym" && nlp(str).terms().data()[0]["tags"][1] != "Adjective"
		&& nlp(str).terms().data()[0]["tags"][1] != "Adverb" && nlp(str).organizations().data().length == 0
		&& nlp(str, lexicon).organizations().data().length == 0 && nlp(str).terms().data()[0]["tags"][1] != "Preposition"
		&& nlp(str).nouns().not(blacklist).length > 0 && nlp(str).terms().data()[0]["tags"][1] != "Currency"
		&& nlp(str).terms().data()[0]["tags"][0] != "SportsTeam") { // && nlp((nlp(array_i).after(str).out().split(" ").splice(1)[0])).verbs().data().length == 0) {
		return "true"
	}
	else {
		return "false"
	}
}

/*
start with four-token strings of places
conditions in order of importance:

0. place is not in comma-seperated string
	if it is, then add comma-seperated string to list and break loop
1. place is a noun
2. place not a person
3. place is not in blacklist
	if it meets these conditions, then add it to the list

*/

function main(html) {

	//var find_places = /[A-Z]+[a-z]+[ \-]?(?:d[a-u].)?(?:[A-Z]+[a-z]+)*/
	var find_places = /(?:[A-Z]+[a-z]+[ \-]?)+/
	var places_context = /(?=((\. )*[A-Z]*[a-z]+[ \-,]?\s*(?:([A-Z]+[a-z]+[ \-]?)|\band\b)(?:d[a-u].)?(?:[A-Z]+[a-z]+)*(?:,*)\s*\S*\s*\S*(?:\s*[A-Z]*[a-z]+[ \-,']?){0,2}))/
	//var places_context = /(?=((\. )*[A-Z]*[a-z]+[ \-,]?\s*(?:([A-Z]+[a-z]+[ \-]?)|\band\b)(?:d[a-u].)?(?:[A-Z]+[a-z]+)*(?:,*)\s*\S*\s*\S*(?:\s*[A-Z]+[a-z]+[ \-,']?)*))/
	var array = match_overlap(html, places_context);
	var iloc_comma_bloc = /(?:[A-Z]+[a-z]+[ \-]?)*(?:, [A-Z]+[a-z]+[ \-]?)/ // place_comma_place_comma_place | ...place_comma_and_place | ...place_and_place | iloc_comma_bloc
	var place_comma_place_comma_place = /[A-Z]+[a-z]+[ \-]?(?:(?:,|, and| and))[ ][A-Z]+[a-z]+[ \-,]*(?:(?:(?:,|, and| and)))(?:[ A-Z]*[a-z]+[ \-]*)*|(?:, [A-Z]+[a-z]+[ \-]?)/ // place_comma_place_comma_place | ...place_comma_and_place | ...place_and_place
	var get_first_place = /[A-Z]+[a-z]+[ \-]?(?=(?:,|, and| and)((?:[ ][A-Z]+[a-z]+)(?:(?:[ \-,]*)(?:[A-Z]+[a-z]+[ \-]*)))*)/
	var lexicon = org_lexicon();
	var places_list = new Array();

	for (i = 0; i < array.length; i++) {

	  arr = get_arr(array[i])

	  var inner_place = place_comma_place_comma_place.exec(arr); // list of places
	  var inner_list = iloc_comma_bloc.exec(arr); // comma-seperated place
	  var contains_person = nlp(arr).match('* #Person *').out('text');
	  var selected = nlp(find_places.exec(arr))
	  var contains_noun = selected.nouns().out('array')
	  var prep_matches = nlp(arr).match('(at|in|on|through) #Noun *').out('text');

	  if (inner_list != null) {
      	var place = get_first_place.exec(inner_place[0]) // first place in list of places
	  	if (place != null) {
	  		places_list.push(place[0]);
	  	}
	  	else {
	    	places_list.push(inner_list[0]);
	    }
	  }

	  else if (contains_noun.length > 0 && nlp(find_places.exec(arr)).nouns().not(['terms','sale']).length > 0) {
	  	if (contains_person.length > 0) {
	  		var cont_matches = (nlp(arr).terms(1).data()[0])["tags"][5]
		  	if ((prep_matches.length > 0) && cont_matches != "Contraction") {
		       var place = find_places.exec(arr)
		       if (is_place(place, lexicon, array[i]) == "true") {
		       		places_list.push(place[0]);
		   		}
	      	}
	     }

	     else {
	      var place = find_places.exec(arr)
	      var start_of_sentence = /(?:\.\s(?:\s*))+([A-Z]+[a-z]+[\-]?)/
	      var place_start = start_of_sentence.exec(array[i])
	      // var blacklist = sentenceStartBlacklist()
	      // var tags = nlp(place_start[0]).terms(1).data()
	      if (place_start != null) {
	      	// var get_tagged_token = /[A-Z]+[a-z]+[ \-]?((?:d[a-u].)?(?:[A-Z]+[a-z]+)*)/ // regex to only get second word
	    	// var tagged_token = get_tagged_token.exec(place[1])
	      	// push second word to list
			// console.log(tagged_token)
	      	if (is_place(place, lexicon, array[i]) == "true" && nlp(place).places().out('array') != 0) {
	      		places_list.push(place[0])
	      	}
	      }
		  	else {
		  		if (is_place(place, lexicon, array[i]) == "true") {
		  			places_list.push(place[0]);
		  		}
		  	}  
		}
    }
	}
	places_arr = unique(places_list)
	return places_arr
}
