/* 
    Better Pop Up Blocker
    Copyright (C) 2010  Eric Wong	
	contact@optimalcycling.com
	http://www.optimalcycling.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function blockEditControlIntercept()
{
	var aElements = document.getElementsByTagName('*');
	for (var i = 0; i < aElements.length; i++) {
		if (aElements[i].hasAttribute("ondragstart")) 
		{	
			aElements[i].ondragstart = "";
		}
		if (aElements[i].hasAttribute("oncontextmenu")) 
		{	
			aElements[i].oncontextmenu = "";
		}	
		if (aElements[i].hasAttribute("onselectstart")) 
		{	
			aElements[i].onselectstart = "";
		}
		if (aElements[i].hasAttribute("onmousedown")) 
		{	
			aElements[i].onmousedown = "";
		}	

		if (aElements[i].hasAttribute("oncut")) 
		{	
			aElements[i].oncut = "";
		}
		if (aElements[i].hasAttribute("oncopy")) 
		{	
			aElements[i].oncopy = "";
		}
		if (aElements[i].hasAttribute("onpaste")) 
		{	
			aElements[i].onpaste = "";
		}		
	}
}

function blockWindowTargets()
{
	var aElements = document.getElementsByTagName('*');
	for (var i = 0; i < aElements.length; i++) {
		if (aElements[i].hasAttribute("target")) 
		{	
			aElements[i].target = "";
		}		
	}	
}

function showExtendedTooltips()
{
	var aElements = document.getElementsByTagName('a');
	for (var i = 0; i < aElements.length; i++) {	
		aElements[i].title = (aElements[i].href ? ("Link: " + aElements[i].href) : "Link: None")
			+ (aElements[i].onclick ? ("\n\nOnClick: " + aElements[i].onclick) : "\n\nOnClick: None")
			+ (aElements[i].title ? ("\n\nDescrip: " + aElements[i].title) : "");
	}	
}

function stripJSFromLinkLocations()
{
	var aElements = document.getElementsByTagName('a');
	for (var i = 0; i < aElements.length; i++) {	
		if (aElements[i].hasAttribute("href")) 
		{	
			var hrefVal = aElements[i].href;
			
			/*
			if (aElements[i].hasAttribute("onclick")) 
			{	
				//aElements[i].href = "javascript:" + aElements[i].onclick;	
				aElements[i].onclick = "";
			}	*/		
			
			// Strip javascript code from href tags
			if (!(RegExp('^(http[s]?:\/\/|http[s]?:\/\/|mailto:|ftp:\/\/)', 'i').test(hrefVal)))
			{
			    var possibleURLs = hrefVal.match(/(http[s]?:\/\/[a-z0-9_-]+\.|http[s]?:\/\/)[a-z]+\.[a-z]+[^\'\"]+/i);
				
				if (possibleURLs && possibleURLs.length > 0)
					aElements[i].href = possibleURLs[0];
			}
		}	
	}	
}

chrome.extension.sendRequest({type: "get settings block idle", url: location.href}, function(settings) {
	if (!settings.enabled)
	{					    
		if (settings.blockWindowTargets)
			blockWindowTargets();
		
		if (settings.blockJSContextMenuAndClickIntercept)
			blockEditControlIntercept();
			
		if (settings.extendedTooltips)
			showExtendedTooltips();
			
		if (settings.stripJSFromLinkLocations)
			stripJSFromLinkLocations();
		
	}
});


