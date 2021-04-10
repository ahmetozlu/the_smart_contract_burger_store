pragma solidity ^0.5.0;

contract Burger {
	// The burger store's address
 	address payable public owner;

	/// The buyer's address part on this contract
	address public buyerAddr;

	// The Buyer struct
	struct Buyer {				
		address addr;
		string name;		

		bool init;
	}

	/// The Order struct
	struct Order {
		string goods;
		uint quantity;
		uint number;
		uint price;
		uint safepay;

		bool init;			
	}

	/// The Invoice struct
	struct Invoice {
		uint orderno;
		uint number;	

		bool init;
	}

	/// The mapping to store orders
	mapping (uint => Order) orders;

	/// The mapping to store invoices
	mapping (uint => Invoice) invoices;

	/// The sequence number of orders
	uint orderseq;

	/// The sequence number of invoices
	uint invoiceseq;

	// Event triggered for every new order
	event OrderSent(address buyer, string goods, uint quantity, uint orderno);

	// Event triggerd when the order gets valued and wants to know the value of the payment
	event PriceSent(address buyer, uint orderno, uint price);

	/// Event trigger when the buyer performs the safepay
	event SafepaySent(address buyer, uint orderno, uint value, uint now);

	/// Event triggered when the seller sends the invoice
	event InvoiceSent(address buyer, uint invoiceno, uint orderno, uint delivery_date);

	/// Event triggered when the courie delives the order
	event OrderDelivered(address buyer, uint invoiceno, uint orderno, uint real_delivey_date);

	// The smart contract's constructor
	constructor(address _buyerAddr) public payable {
		/// The seller is the contract's owner
		owner = msg.sender;

		buyerAddr = _buyerAddr;
	}


	// The function to send purchase orders
	//   requires fee
	//   Payable functions returns just the transaction object, with no custom field.
	//   To get field values listen to OrderSent event.
	function sendOrder(string memory goods, uint quantity) payable public {
		/// Accept orders just from buyer
		require(msg.sender == buyerAddr);

		/// Increment the order sequence
		orderseq++;

		/// Create the order register
		orders[orderseq] = Order(goods, quantity, orderseq, 0, 0, true);

		/// Trigger the event
		emit OrderSent(msg.sender, goods, quantity, orderseq);
	}

	// The function to query orders by number
	// Constant functions returns custom fields
	function queryOrder(uint number) view public returns (address buyer, string memory goods, uint quantity, uint price, uint safepay) {
		// Validate the order number
		require(orders[number].init);

		// Return the order data
		return(buyerAddr, orders[number].goods, orders[number].quantity, orders[number].price, orders[number].safepay);
	}

	// The function to send the price to pay for order
	//  Just the owner can call this function
	//  requires free
	function sendPrice(uint orderno, uint price) payable public {
		// Only the owner can use this function
		require(msg.sender == owner);

		// Validate the order number
		require(orders[orderno].init);

		// Update the order price
		orders[orderno].price = price;

		// Trigger the event
		emit PriceSent(buyerAddr, orderno, price);
	}

	/// The function to send the value of order's price
	///  This value will be blocked until the delivery of order
	///  requires fee
	function sendSafepay(uint orderno) payable public {

		/// Validate the order number
		require(orders[orderno].init);

		/// Just the buyer can make safepay
		require(buyerAddr == msg.sender);

		/// The order's value plus the shipment value must equal to msg.value
		//require((orders[orderno].price + orders[orderno].shipment.price) == msg.value);

		orders[orderno].safepay = msg.value;

		emit SafepaySent(msg.sender, orderno, msg.value, now);
	}

	/// The function to send the invoice data
	///  requires fee
	function sendInvoice(uint orderno, uint delivery_date) payable public {

		/// Validate the order number
		require(orders[orderno].init);

		/// Just the seller can send the invoice
		require(owner == msg.sender);

		invoiceseq++;

		/// Create then Invoice instance and store it
		invoices[invoiceseq] = Invoice(orderno, invoiceseq, true);

		/// Trigger the event
		emit InvoiceSent(buyerAddr, invoiceseq, orderno, delivery_date);
	}

	/// The function to get the sent invoice
	///  requires no fee
	function getInvoice(uint invoiceno) view public returns (address buyer, uint orderno/*, uint delivery_date*/){

		/// Validate the invoice number
		require(invoices[invoiceno].init);

		Invoice storage _invoice = invoices[invoiceno];
		Order storage _order     = orders[_invoice.orderno];
		// order a delivery date attribute eklenmesi lazım
		//return (buyerAddr, _order.number, _order.shipment.date, _order.shipment.courier);
		return (buyerAddr, _order.number);
	}

	/// The function to mark an order as delivered
	function delivery(uint invoiceno, uint timestamp) payable public {

		/// Validate the invoice number
		require(invoices[invoiceno].init);

		Invoice storage _invoice = invoices[invoiceno];
		Order storage _order     = orders[_invoice.orderno];

		/// Just the courier can call this function
		//require(_order.shipment.courier == msg.sender);

		/// Just the buyer can make safepay
		require(buyerAddr == msg.sender);

		emit OrderDelivered(buyerAddr, invoiceno, _order.number, timestamp);

		/// Payout the Order to the seller
		owner.transfer(_order.safepay);

		/// Payout the Shipment to the courier
		//_order.shipment.courier.transfer(_order.shipment.safepay);

	}


}