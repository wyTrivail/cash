var page = require('webpage').create();
page.onConsoleMessage = function(msg) {
  console.log('evaluate log: ' + msg);
};

var last_order_list = []
var generate_new_order_list = function(current_order_list){
    if(last_order_list.length == 0) return current_order_list;
    for(var i=0; i != current_order_list.length; ++i){
        console.log(current_order_list[i].time);
        console.log(last_order_list[0].time);
        if(current_order_list[i].time <= last_order_list[0].time) break;
    }
    console.log('i: ' + i);
    return current_order_list.slice(0, i);
}

page.open('https://gate.io/trade/ETH_USDT', function(status) {
	console.log("Status: " + status);
	var func = function(){
  	    if(status === "success") {
		    var data = page.evaluate(function(){
                // handle ask data function
                var handle_ask_nodes = function(node_list){
                    var nodes_data = []
                    for(var i=0; i != node_list.length; ++i){
                        var node = node_list[i];
                        if(node.textContent.trim() == '') continue;
                        var text_array = node.textContent.trim().replace(/\n/g, ' ').split(/\ +/)
                        nodes_data.push({
                            'price_of_coin': text_array[0].trim(),
                            'num_of_coin': text_array[1].trim(),
                            'num_of_usdt': text_array[2].trim()
                        });
                    }
                    return nodes_data;
                }
   
                //extract data
                //extract ask data
                var ask_sell_list = handle_ask_nodes(document.getElementById('ul-ask-list').childNodes);
                var ask_buy_list = handle_ask_nodes(document.getElementById('ul-bid-list').childNodes);

                //extrace order data
                var node_list = document.getElementById('ul-trade-list').childNodes;
                var order_list = []
                for(var i=0; i != node_list.length; ++i){
                    order_list.push({
                        'type': node_list[i].title,
                        'time': node_list[i].childNodes[0].textContent,
                        'price': parseFloat(node_list[i].childNodes[1].textContent),
                        'num_of_coin': parseFloat(node_list[i].childNodes[2].textContent),
                        'num_of_usdt': parseFloat(node_list[i].childNodes[3].textContent)
                    });
                }

                return {
                    'ask_sell_list': ask_sell_list,
                    'ask_buy_list': ask_buy_list,
                    'order_list': order_list
                };
            });

            //generate new order list
            data.order_list = generate_new_order_list(data.order_list);
            if(data.order_list.length != 0){
                last_order_list = data.order_list;
            }
            analyze(data.ask_sell_list, data.ask_buy_list, data.order_list);
	    }else{
            console.log(status);
        }
    }
	window.setInterval(func, 3000);
    //phantom.exit();
});

var total = 0;
var find_order = function(order_list, threshold, type){
    for(var i=0; i != order_list.length; ++i){
        if(order_list[i].type != type) continue;
        if(type == 'sell' && order_list[i].price > threshold) return true;
        if(type == 'buy' && order_list[i].price < threshold) return true;
    }
    return false;
}
var analyze = function(ask_sell_list, ask_buy_list, order_list){
    console.log(new Date());
    
    var top_buy_price = parseFloat(ask_buy_list[0].price_of_coin) + 0.0001;
    var top_sell_price = parseFloat(ask_sell_list[0].price_of_coin) - 0.0001;

    console.log('sell one: ' + top_sell_price);
    console.log('buy one: ' + top_buy_price);
    var gain = (top_sell_price - top_buy_price) - (top_buy_price * 0.0018 + top_sell_price * 0.0018);
    console.log('gain: ' + gain);

    console.log('order list length: ' + order_list.length);

    //monitor
    if(gain > 0 && find_order(order_list, top_buy_price, 'buy') && find_order(order_list, top_sell_price, 'sell')){
        total += gain;
        console.log('total: ' + total);
    }
}
