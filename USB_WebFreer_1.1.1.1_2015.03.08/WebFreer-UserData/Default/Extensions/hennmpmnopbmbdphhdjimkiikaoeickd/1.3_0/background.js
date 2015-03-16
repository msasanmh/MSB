// By MSasanMH
function get_crx() {
	chrome.tabs.getSelected(null,function(tab) {
		var tab_url = tab.url;
		
		ext_name_1 = tab_url.split('/detail/');
		ext_name_2 = ext_name_1[1].split('/');
		ext_name = ext_name_2[0];
		
		ext_id_1 = tab_url.split("/");
		ext_id_2 = ext_id_1[6];
		ext_id_3 = ext_id_2.split('?');
		ext_id = ext_id_3[0];
		
		//var url1 = 'https://clients2.google.com/service/update2/crx?response=redirect&x=';
		var url1 = 'https://clients2.google.com/service/update2/crx?response=redirect&x=';
		var url2 = 'id%3D' + ext_id + '%26uc&os=win&arch=x86-32&nacl_arch=x86-64&prodversion=88888888';
		var ext_url = url1 + url2;
		
		// Open Link Direct in New Tab
		//chrome.tabs.create({url: ext_url});
		
		// Make New Tab Page
		nw = window.open();
		nd = nw.document;
		nd.open();
		
nd.write('<table width="100%" height="100%"><tr><td valign="center" align="center">');
		
		// HTML
		nd.write('<html><head><title>Install Or Download Extension</title></head>');
		nd.write('<body style="background: #F6F6F6;">');
		// jQuery Import
		nd.write('<script src="jquery.min.js"></script>')
		// Save To Disk as ZIP
		nd.write('<script src="SaveToDisk.js"></script>')
		// jQuery File Download --> https://github.com/filamentgroup/jQuery-File-Download
		nd.write('<script src="jQuery.download.js"></script>')
		// Table
		nd.write('<table width="600" height="1" align="center" bgcolor="lightBlue" cellPadding="16" cellSpacing="2" style=" font-family:Verdana,Tahoma; font-size:12px; border:1px dashed #666666; border-collapse:collapse; " border="1">')
		// Row 1: Caption
		nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; border:1px dashed #666666;" colspan="2" width="*" height="30">')
		nd.write('<center><b>Install or Download Extensions</b> <i>(Without "No File" Error)</i></center>')
		nd.write('</td></tr>')
		// Row 2
		nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; font-weight:bold; border:1px dashed #666666;" width="40%" height="30">')
		nd.write('Extension Name:')
		nd.write('</td><td style="color:#333333; border:1px dashed #666666;" width="60%" height="30">')
		nd.write(''+ext_name+'')
		nd.write('</td></tr>')
		// Row 3
		nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; font-weight:bold; border:1px dashed #666666;" width="40%" height="30">')
		nd.write('Extension ID:')
		nd.write('</td><td style="color:#333333; border:1px dashed #666666;" width="60%" height="30">')
		nd.write(''+ext_id+'')
		nd.write('</td></tr>')
		// Row 4 -- Install
		//nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; font-weight:bold; border:1px dashed #666666;" width="40%" height="30">')
		//nd.write('<b>Install:</b> <i>(Single Left-Click)</i>')
		//nd.write('</td><td bgcolor="#DDDDDD" onMouseOver="this.bgColor=\'#CCCCCC\';" onMouseOut="this.bgColor=\'#DDDDDD\';" style="color:#333333; border:1px dashed #666666;" width="60%" height="30">')
		//nd.write('<center><span style="font-family:verdana; font-size:14pt;"><a style="color:#8B0000; font-weight:bold; text-decoration:none;" onmouseover="this.style.color=\'#300000\'" onmouseout="this.style.color=\'#8B0000\'" href="' + url1 + url2 + '"><b>Install</b></a></span></center>')
		//nd.write('</td></tr>')
		// Row 5 - Download as ZIP
		//nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; font-weight:bold; border:1px dashed #666666;" width="40%" height="30">')
		//nd.write('<b>Download as ZIP Archive:</b> <i>(Single Left-Click)</i>')
		//nd.write('</td><td bgcolor="#DDDDDD" onMouseOver="this.bgColor=\'#CCCCCC\';" onMouseOut="this.bgColor=\'#DDDDDD\';" style="color:#333333; border:1px dashed #666666;" width="60%" height="30">')
		//nd.write('<center><span style="font-family:verdana; font-size:14pt;"><a style="color:#8B0000; font-weight:bold; text-decoration:none;" onmouseover="this.style.color=\'#300000\'" onmouseout="this.style.color=\'#8B0000\'" href="javascript:SaveToDisk(\'' + url1 + url2 + '\', \''+ext_name+'.zip\')"><b>Download ZIP</b></a></span></center>')
		//nd.write('</td></tr>')
		// Row 6
		nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; border:1px dashed #666666;" colspan="2" width="*" height="30">')
		nd.write('<b>Install:</b> Just Click on "Install or Download" Button. <i>(Single Left-Click)</i>')
		nd.write('</td></tr>')
		// Row 7
		nd.write('<tr bgcolor="#F6F6F6" onMouseOver="this.bgColor=\'#DDDDDD\';" onMouseOut="this.bgColor=\'#F6F6F6\';"><td style="color:#333333; border:1px dashed #666666;" colspan="2" width="*" height="30">')
		nd.write('<b>Download:</b> Right-Click on "Install or Download" Button and Select "Save Link As..."')
		nd.write('</td></tr>')
		
		// Row 8: Install Button
		nd.write('<tr bgcolor="#DDDDDD" onMouseOver="this.bgColor=\'#CCCCCC\';" onMouseOut="this.bgColor=\'#DDDDDD\';"><td style="color:#333333; border:1px dashed #666666;" colspan="2" width="*" height="30">')
		nd.write('<center><span style="font-family:verdana; font-size:14pt;"><a style="color:#8B0000; font-weight:bold; text-decoration:none;" onmouseover="this.style.color=\'#300000\'" onmouseout="this.style.color=\'#8B0000\'" href="' + url1 + url2 + '"><b>Install or Download</b></a></span></center>')
		nd.write('</td></tr>')
		nd.write('')
		nd.write('')
		nd.write('</table>')
		
		nd.write('</td></tr></table>');

		nd.write('</body>');
		nd.write('</html>');
		
		nd.close();
	});
}

// Create context menu.
chrome.contextMenus.create({
	'title': 'Install or DL This Extension',
	'contexts': ['all'],
	'onclick': get_crx,
	'documentUrlPatterns': ['https://chrome.google.com/webstore/detail/*']
});