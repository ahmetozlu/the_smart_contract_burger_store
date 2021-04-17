var BurgerMenuOrder = artifacts.require('BurgerMenuOrder');

contract('BurgerMenuOrder', function(accounts) {

	const ORDER_PRICE            = 3;
	const ORDER_SAFEPAY          = 4;	

	const INVOICE_ORDERNO = 1;		

	var seller         = null;
	var customer          = null;	
	var orderno        = null;
	var invoiceno      = null;
	
	var price          = null;
	var burgerMenu          = null;
	var quantity       = null;
	var orderDate      = null;
	var deliveryDate      = null;

	before(function() {
		seller         = accounts[0];
		customer          = accounts[1];		
		orderno        = 1;
		invoiceno      = 1;		
		price          = 100000;
		burgerMenu          = "BigMac";
		quantity       = 200;
		orderDate      = (new Date()).getTime(); // for date time practices: https://github.com/pipermerriam/ethereum-datetime
		deliveryDate      = (new Date()).getTime() + 30000;
		console.log(new Date().toString());
		console.log((new Date()).getTime().toString());
	});

	it("The burger store account should own the contract.", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.owner();
		}).then(function(owner){
			assert.equal(seller, owner, "The burger store account does not own the contract.");
		});

	});

	it("should the second account was the customer", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.customerAddress();
		}).then(function(customer){
			assert.equal(accounts[1], customer, "The second account was not the customer");
		});

	});



	it("should first order was ID 1", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(transaction){
			return new Promise(function(resolve, reject){
				return web3.eth.getTransaction(transaction.tx, function(err, tx){
					if(err){
						reject(err);
					}
					resolve(tx);
				});
			});
		}).then(function(tx){
			console.log(tx.gasPrice.toString());
		}).then(function(){
			//query getTransactionReceipt
		}).then(function(){
			return burger.checkOrder(orderno);
		}).then(function(order){
			assert.notEqual(order, null, "The order ID 1 did not exists"); 
		});

	});

	it("should the order's price was set", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.checkOrder(orderno);
		}).then(function(order){
			assert.equal(order[ORDER_PRICE].toString(), price);
		});

	});

	it("should the safe pay was correct", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.sendSafePayment(orderno, {from: customer, value: price});
		}).then(function(){
			return burger.checkOrder(orderno);
		}).then(function(order){
			assert.equal(order[ORDER_SAFEPAY].toString(), price);
		});
	});

	it("should the contract's balance was correct after the safepay", function() {

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.sendSafePayment(orderno, {from: customer, value: price});
		}).then(function(){
			return new Promise(function(resolve, reject) {
				return web3.eth.getBalance(burger.address, function(err, hash){
					if(err){
						reject(err);
					}
					resolve(hash);
				});
			});
		}).then(function(balance){
			assert.equal(balance.toString(), price);
		});
	});

	it("should the first invoice was ID 1", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.sendInvoice(orderno, orderDate, {from: seller});
		}).then(function(){
			return burger.getInvoice(invoiceno);
		}).then(function(invoice){
			assert.notEqual(invoice, null);
		});
	});

	it("should the invoice 1 it is for order 1", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.sendInvoice(orderno, orderDate, {from: seller});
		}).then(function(){
			return burger.getInvoice(invoiceno);
		}).then(function(invoice){
			assert.equal(invoice[INVOICE_ORDERNO].toString(), orderno);
		});
	});

	it("should the contract's balance was correct after the markOrderDelivered", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.sendOrder(burgerMenu, quantity, {from: customer});
		}).then(function(){
			return burger.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burger.sendSafePayment(orderno, {from: customer, value: price});
		}).then(function(){
			return burger.sendInvoice(orderno, orderDate, {from: seller});
		}).then(function(){
			return burger.markOrderDelivered(invoiceno, deliveryDate, {from: customer});
		}).then(function(){
		return new Promise(function(resolve, reject){
			return web3.eth.getBalance(burger.address, function(err, hash){
				if(err){
					reject(err);
				}
					resolve(hash);
				});
			});
		}).then(function(balance){
			assert.equal(balance.toString(), 0);
		});
	});

});