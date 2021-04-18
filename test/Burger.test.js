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
		burgerMenu          = "BigBurger";
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

	it("The customer account should be the second account.", function(){

		var burger;

		return BurgerMenuOrder.new(customer, {from: seller}).then(function(instance){
			burger = instance;

			return burger.customerAddress();
		}).then(function(customer){
			assert.equal(accounts[1], customer, "The second account is not the customer.");
		});

	});



	it("The first order ID should equal to 1.", function(){

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
			assert.notEqual(order, null, "The first order ID does not equal to 1."); 
		});

	});

	it("The order's price should be set.", function(){

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

	it("The safe payment should be correct.", function(){

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

	it("The contract's balance should be correct after the safe payment.", function() {

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

	it("The first invoice ID should equal to 1.", function(){

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

	it("The first invoice should be for the first order.", function(){

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

	it("The contract's balance should be correct after the order delivered.", function(){

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