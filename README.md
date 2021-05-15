# The Smart Contract Burger Store

This project focuses on a case study which is developing an Ethereum smart contract to manage a burger store. This case study can be adopted for various cases to use smart contract for real-life businesses. For more info, you can check [related medium post](https://ahmetozlu93.medium.com/building-smart-contract-for-businesses-cd620b00801b).

Basicaly the smart contract, which is developed in this project, provides:

- **The functions for customers:** Order burger, safe payment, get invoice and mark order as delivered functions.
- **The functions for burger store:** Get orders, send price, send invoice and safe payout functions.

This repository presents practices about:

- Setup a blockchain.
- Develop Ethereum smart contract.
- Deploy the contract and test it.

## Theory

Basically there are 3 components in this project which are:

Component | Explanation
--- | --- |
Burger Store | *Deploys the contract and owns it.*
Customers     | *Can order burgers to buy them.*
Smart Contract | *Provides safe and robust contract that are immutable.*

And here is given below a business flow chart which explains a sample flow for the usage of this smart contract.

<p align="center">
  <img src="https://user-images.githubusercontent.com/22610163/118378443-9a3c2e80-b5dc-11eb-8848-a3fd094f9f34.png" width=720>
</p>

### Functionalities

There are a bunch of functions are implemented in this case study. This functions can be adopted for any other business cases. Here are the functions and their details.

- **sendOrder:** Function to send order. Only customers can use this function.
- **checkOrder:** Function to check orders.
- **sendPrice:** Function to send price. Only the owner (Burger Store which deploys this Smart Contract) can use this function.
- **sendSafePayment:** Function to send safe payment. Only customers can use this function.
- **sendInvoice:** Function to send invoice. Only the owner can use this function.
- **getInvoice:** Function to get invoice.
- **markOrderDelivered:** Function to mark the order as delivered. Only customers can use this function.

And, here are the events are triggered for the activities:

- **OrderSent**: Event triggers when order sent.
- **PriceSent**: Event triggers when price sent.
- **SafePaymentSent**: Event triggers when safe payment sent.
- **InvoiceSent**: Event triggers when invoice sent.
- **OrderDelivered**: Event triggers when order delivered.

The functions and events can be modified and used for any other business logic requirements.

## Quick Demo


First, clone the repository and build the project using truffle by this command:

    truffle build
    
<p align="center">
  <img src="https://user-images.githubusercontent.com/22610163/115788152-ecb67080-a3cb-11eb-938f-5ba3c7c6d7f3.png">
</p>

After building the project and starting ganache which provides ethereum blockchain network on your local, our smart contract can be deployed using truffle by this command:

    truffle migrate --reset
    
<p align="center">
  <img src="https://user-images.githubusercontent.com/22610163/115788246-0b1c6c00-a3cc-11eb-8e16-ea92f32ff8ef.jpg">
</p>

We can use [developed unit test class](https://github.com/ahmetozlu/the_smart_contract_burger_store/blob/main/test/Burger.test.js) to perform unit testing:

    truffle test

<p align="center">
  <img src="https://user-images.githubusercontent.com/22610163/115788372-31420c00-a3cc-11eb-84a5-5287b0f89c55.png">
</p>

## Citation
If you use this code for your publications, please cite it as:

    @ONLINE{
        author = "Ahmet Özlü",
        title  = "A Case Study: Ethreum Smart Contract for Managing a Burger Store",
        year   = "2021",
        url    = "https://github.com/ahmetozlu/the_smart_contract_burger_store"
    }

## Author
Ahmet Özlü

## License
This system is available under the MIT license. See the LICENSE file for more info.
