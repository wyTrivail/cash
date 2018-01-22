var page = require('webpage').create();
page.open('https://gate.io/trade/ETH_USDT', function(status) {
	console.log("Status: " + status);
	var func = function(){
  	if(status === "success") {
		var ua = page.evaluate(function() {
       		return document.getElementById('ul-bid-list').textContent;
    	});
    	console.log(ua); 
	}
}
	window.setInterval(func, 1000);
  //phantom.exit();
});
