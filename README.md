## About
Visable is a Chrome browser extension that maps the locations on your web page. Visable uses a customized natural language processing toolkit to parse the text in your active tab, pull the relevant geographic data and display these locations. Highlight key words, phrases and paragraphs that contain location information and map those places in the current tab. Find places, create maps and explore ArcGIS Online feature layers to the geographic data all with the push of a button.

## Install
Download and install Visable it from GitHub.

To install from GitHub:
1. Download the .zip & extract or clone this repo to your computer using `git clone https://github.com/our-sinc-topo/visable.git`.
2. Type `chrome://extensions` in your Chrome browser's URL bar and hit enter.
3. Check Developer Mode in the upper right hand corner of the extensions page.
4. Hit Load unpacked extension... on the upper left hand side.
5. Navigate to the root directory of the extension and select it (the root directly contains manifest.json).

Try it out by going to a page, highlighting some text and clicking the extension's icon.

## Requirements
The Chrome browser is required to use this product.

## Issues
Find an issue or want to give us your feedback? Please let us know by submitting an issue. 

## Preprocessing
1) remove all non-alphanumberic characters/punctuation/spaces

2) replace all hyphens, en dashes, em dashes, and line breaks with spaces

3) replace all backslashes with the word "or" surrounded by a space on each side--" or "

## Processing
1) make sure place is not in comma-seperated string
2) if it is, then add comma-seperated string to list
3) if it's in a list of places, get the first place in the list
      
4) make sure place is a noun
5) if it is, make sure's not a person
      
6) make sure place isn't at the start of a sentence
7) if it is, take additional steps to make sure it's not a standard, capitalized noun
