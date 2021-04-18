// medium'da post geliştirmeye başla
// youtube videosu için içerik tasarımı düşün ve geliştir
// kod sadelestirilecek: gereksiz satırlar çıkarılacak, comment'ler yeniden yazılacak
// order a markOrderDelivered date attribute eklenmesi lazım

pragma solidity ^0.5.0;

contract BurgerMenuOrder {
	// the contract's owner address
 	address payable public owner;
	
	// the customer address
	address public customerAddress;
	
	// Order struct
	struct Order {
		uint ID;
		string burgerMenu;
		uint quantity;		
		uint price;
		uint safePayment;
		uint orderDate;
		uint deliveryDate;
		bool created;			
	}

	// Invoice struct
	struct Invoice {
		uint ID;		
		uint orderNo;		
		bool created;
	}
	
	// mapping for orders to have an list for the orders
	mapping (uint => Order) orders;
	
	// mapping for invoices to have an list for the invoices
	mapping (uint => Invoice) invoices;
	
	// index value of the orders
	uint orderseq;
	
	// index value of the invoices
	uint invoiceseq;
	
	// event triggers when order sent
	event OrderSent(address customer, string burgerMenu, uint quantity, uint orderNo);
	
	// event triggers when price sent
	event PriceSent(address customer, uint orderNo, uint price);
	
	// event triggers when safe payment sent
	event SafePaymentSent(address customer, uint orderNo, uint value, uint now);
	
	// event triggers when invoice sent
	event InvoiceSent(address customer, uint invoiceID, uint orderNo, uint delivery_date);
	
	// event triggers when order delivered
	event OrderDelivered(address customer, uint invoiceID, uint orderNo, uint real_delivey_date);
	
	// BurgerMenuOrder constructor
	constructor(address _buyerAddr) public payable {		
		owner = msg.sender;

		customerAddress = _buyerAddr;
	}

	// function to send order
	function sendOrder(string memory burgerMenu, uint quantity) payable public {				
		// only the customer can use this function
		require(msg.sender == customerAddress);

		// increase the order index
		orderseq++;
	
		// create the order
		orders[orderseq] = Order(orderseq, burgerMenu, quantity, 0, 0, 0, 0, true);
		
		// trigger OrderSent event
		emit OrderSent(msg.sender, burgerMenu, quantity, orderseq);
	}

	// function to check orders
	function checkOrder(uint ID) view public returns (address customer, string memory burgerMenu, uint quantity, uint price, uint safePayment) {		
		// check the order exists
		require(orders[ID].created);
		
		// return the order
		return(customerAddress, orders[ID].burgerMenu, orders[ID].quantity, orders[ID].price, orders[ID].safePayment);
	}

	// function to send price
	function sendPrice(uint orderNo, uint price) payable public {		
		// only the owner can use this function
		require(msg.sender == owner);
		
		// check the order exists
		require(orders[orderNo].created);
		
		// set the order price
		orders[orderNo].price = price;
		
		// trigger PriceSent event
		emit PriceSent(customerAddress, orderNo, price);
	}

	// function to send safe payment
	function sendSafePayment(uint orderNo) payable public {
		// only the customer can use this function
		require(customerAddress == msg.sender);

		// check the order exists
		require(orders[orderNo].created);			

		// payout
		orders[orderNo].safePayment = msg.value;

		// trigger SafePaymentSent event
		emit SafePaymentSent(msg.sender, orderNo, msg.value, now);
	}
	
	// function to send invoice
	function sendInvoice(uint orderNo, uint order_date) payable public {
		// only the owner can use this function
		require(owner == msg.sender);

		// check the order exists
		require(orders[orderNo].created);
		
		// increase the invoice index
		invoiceseq++;
		
		// create the invoice
		invoices[invoiceseq] = Invoice(invoiceseq, orderNo, true);

		//  set the order date
		orders[orderNo].orderDate = order_date;
		
		// trigger InvoiceSent event
		emit InvoiceSent(customerAddress, invoiceseq, orderNo, order_date);
	}
	
	// function to get invoice
	function getInvoice(uint invoiceID) view public returns (address customer, uint orderNo, uint invoice_date){
		// check the invoice exists
		require(invoices[invoiceID].created);

		// get the related invoice info
		Invoice storage _invoice = invoices[invoiceID];
		// get the related order info
		Order storage _order     = orders[_invoice.orderNo];		

		// return the invoice
		return (customerAddress, _order.ID, _order.orderDate);
	}
	
	// function to mark the order as delivered
	function markOrderDelivered(uint invoiceID, uint delivery_date) payable public {
		// only the customer can use this function
		require(customerAddress == msg.sender);

		// check the invoice exists
		require(invoices[invoiceID].created);

		// get the related invoice info
		Invoice storage _invoice = invoices[invoiceID];
		// get the related order info
		Order storage _order     = orders[_invoice.orderNo];	

		// set the delivery date
		_order.deliveryDate = delivery_date;

		// trigger OrderDelivered event
		emit OrderDelivered(customerAddress, invoiceID, _order.ID, delivery_date);
		
		// payout
		owner.transfer(_order.safePayment);
	}


}
