// medium'da post geliştirmeye başla
// youtube videosu için içerik tasarımı düşün ve geliştir
// kod sadelestirilecek: gereksiz satırlar çıkarılacak, comment'ler yeniden yazılacak
// order a markOrderDelivered date attribute eklenmesi lazım

pragma solidity ^0.5.0;

contract BurgerMenuOrder {
		
 	address payable public owner;
	
	address public customerAddress;
	
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
	
	struct Invoice {
		uint ID;		
		uint orderNo;		
		bool created;
	}
	
	mapping (uint => Order) orders;
	
	mapping (uint => Invoice) invoices;
	
	uint orderseq;
	
	uint invoiceseq;
	
	event OrderSent(address customer, string burgerMenu, uint quantity, uint orderNo);
	
	event PriceSent(address customer, uint orderNo, uint price);
	
	event SafePaymentSent(address customer, uint orderNo, uint value, uint now);
	
	event InvoiceSent(address customer, uint invoiceID, uint orderNo, uint delivery_date);
	
	event OrderDelivered(address customer, uint invoiceID, uint orderNo, uint real_delivey_date);
	
	constructor(address _buyerAddr) public payable {		
		owner = msg.sender;

		customerAddress = _buyerAddr;
	}


	function sendOrder(string memory burgerMenu, uint quantity) payable public {		
		require(msg.sender == customerAddress);

		orderseq++;
	
		orders[orderseq] = Order(orderseq, burgerMenu, quantity, 0, 0, 0, 0, true);
		
		emit OrderSent(msg.sender, burgerMenu, quantity, orderseq);
	}

	function checkOrder(uint ID) view public returns (address customer, string memory burgerMenu, uint quantity, uint price, uint safePayment) {		
		require(orders[ID].created);
		
		return(customerAddress, orders[ID].burgerMenu, orders[ID].quantity, orders[ID].price, orders[ID].safePayment);
	}

	function sendPrice(uint orderNo, uint price) payable public {		
		require(msg.sender == owner);
		
		require(orders[orderNo].created);
		
		orders[orderNo].price = price;
		
		emit PriceSent(customerAddress, orderNo, price);
	}

	function sendSafePayment(uint orderNo) payable public {
		
		require(orders[orderNo].created);
		
		require(customerAddress == msg.sender);

		/// The order's value plus the shipment value must equal to msg.value
		//require((orders[orderNo].price + orders[orderNo].shipment.price) == msg.value);

		orders[orderNo].safePayment = msg.value;

		emit SafePaymentSent(msg.sender, orderNo, msg.value, now);
	}
	
	function sendInvoice(uint orderNo, uint order_date) payable public {
		
		require(orders[orderNo].created);
		
		require(owner == msg.sender);

		invoiceseq++;
		
		invoices[invoiceseq] = Invoice(invoiceseq, orderNo, true);

		/// Update the shipment data
		//orders[orderNo].shipment.date    = delivery_date;
		//orders[orderNo].shipment.courier = courier;

		orders[orderNo].orderDate = order_date;
		
		emit InvoiceSent(customerAddress, invoiceseq, orderNo, order_date);
	}
	
	function getInvoice(uint invoiceID) view public returns (address customer, uint orderNo, uint invoice_date){
		
		require(invoices[invoiceID].created);

		Invoice storage _invoice = invoices[invoiceID];
		Order storage _order     = orders[_invoice.orderNo];
		// order a markOrderDelivered date attribute eklenmesi lazım
		//return (customerAddress, _order.ID, _order.shipment.date, _order.shipment.courier);		

		return (customerAddress, _order.ID, _order.orderDate);
	}
	
	function markOrderDelivered(uint invoiceID, uint delivery_date) payable public {
		
		require(invoices[invoiceID].created);

		Invoice storage _invoice = invoices[invoiceID];
		Order storage _order     = orders[_invoice.orderNo];

		/// Just the courier can call this function
		//require(_order.shipment.courier == msg.sender);
		
		require(customerAddress == msg.sender);

		_order.deliveryDate = delivery_date;

		emit OrderDelivered(customerAddress, invoiceID, _order.ID, delivery_date);
		
		owner.transfer(_order.safePayment);

		/// Payout the Shipment to the courier
		//_order.shipment.courier.transfer(_order.shipment.safePayment);

	}


}
