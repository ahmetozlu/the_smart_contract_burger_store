var Burger = artifacts.require('Burger');

contract('Burger', function(accounts) {

	const ORDER_PRICE            = 3;
	const ORDER_SAFEPAY          = 4;
	const ORDER_SHIPMENT_PRICE   = 5;
	const ORDER_SHIPMENT_SAFEPAY = 6;

	const INVOICE_ORDERNO = 1;
	const INVOICE_COURIER = 3;

	const TYPE_ORDER    = 1;
	const TYPE_SHIPMENT = 2;

	var seller         = null;
	var buyer          = null;	
	var orderno        = null;
	var invoiceno      = null;
	var order_price    = null;	
	var price          = null;
	var goods          = null;
	var quantity       = null;

	before(function() {
		seller         = accounts[0];
		buyer          = accounts[1];		
		orderno        = 1;
		invoiceno      = 1;
		order_price    = 100000;		
		price          = order_price
		goods          = "BigMac";
		quantity       = 200;
	});

	it("The burger store account should own the contract.", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.owner();
		}).then(function(owner){
			assert.equal(seller, owner, "The burger store account does not own the contract.");
		});

	});

	it("should the second account was the buyer", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.buyerAddr();
		}).then(function(buyer){
			assert.equal(accounts[1], buyer, "The second account was not the buyer");
		});

	});



	it("should first order was number 1", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
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
			return burgerStore.queryOrder(orderno);
		}).then(function(order){
			assert.notEqual(order, null, "The order number 1 did not exists"); 
		});

	});

	it("should the order's price was set", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, order_price, {from: seller});
		}).then(function(){
			return burgerStore.queryOrder(orderno);
		}).then(function(order){
			assert.equal(order[ORDER_PRICE].toString(), order_price);
		});

	});

	it("should the safe pay was correct", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, order_price, {from: seller});
		}).then(function(){
			return burgerStore.sendSafepay(orderno, {from: buyer, value: order_price});
		}).then(function(){
			return burgerStore.queryOrder(orderno);
		}).then(function(order){
			assert.equal(order[ORDER_SAFEPAY].toString(), price);
		});
	});

	it("should the contract's balance was correct after the safepay", function() {

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, order_price, {from: seller});
		}).then(function(){
			return burgerStore.sendSafepay(orderno, {from: buyer, value: price});
		}).then(function(){
			return new Promise(function(resolve, reject) {
				return web3.eth.getBalance(burgerStore.address, function(err, hash){
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

	it("should the first invoice was number 1", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burgerStore.sendInvoice(orderno, 0, {from: seller});
		}).then(function(){
			return burgerStore.getInvoice(invoiceno);
		}).then(function(invoice){
			assert.notEqual(invoice, null);
		});
	});

	it("should the invoice 1 it is for order 1", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, price, {from: seller});
		}).then(function(){
			return burgerStore.sendInvoice(orderno, 0, {from: seller});
		}).then(function(){
			return burgerStore.getInvoice(invoiceno);
		}).then(function(invoice){
			assert.equal(invoice[INVOICE_ORDERNO].toString(), orderno);
		});
	});

	it("should the contract's balance was correct after the delivery", function(){

		var burgerStore;

		return Burger.new(buyer, {from: seller}).then(function(instance){
			burgerStore = instance;

			return burgerStore.sendOrder(goods, quantity, {from: buyer});
		}).then(function(){
			return burgerStore.sendPrice(orderno, order_price, {from: seller});
		}).then(function(){
			return burgerStore.sendSafepay(orderno, {from: buyer, value: price});
		}).then(function(){
			return burgerStore.sendInvoice(orderno, 0, {from: seller});
		}).then(function(){
			return burgerStore.delivery(invoiceno, 0, {from: buyer});
		}).then(function(){
		return new Promise(function(resolve, reject){
			return web3.eth.getBalance(burgerStore.address, function(err, hash){
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