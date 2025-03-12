// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeliveryTracker {
    enum OrderStatus { Created, InTransit, Delivered }

    struct Item {
        string name;
        uint256 quantity;
    }

    struct Order {
        uint256 id;
        address store;
        address deliveryPerson;
        OrderStatus status;
        Item[] items;
    }

    mapping(uint256 => Order) public orders;
    uint256 public nextOrderId;

    event OrderCreated(uint256 orderId, address store);
    event OrderPickedUp(uint256 orderId, address deliveryPerson);
    event OrderDelivered(uint256 orderId);

    function createOrder(string[] memory itemNames, uint256[] memory itemQuantities) external {
        require(itemNames.length == itemQuantities.length, "Mismatched items and quantities");

        Order storage newOrder = orders[nextOrderId];
        newOrder.id = nextOrderId;
        newOrder.store = msg.sender;
        newOrder.deliveryPerson = address(0);
        newOrder.status = OrderStatus.Created;

        for (uint256 i = 0; i < itemNames.length; i++) {
            newOrder.items.push(Item(itemNames[i], itemQuantities[i]));
        }

        emit OrderCreated(nextOrderId, msg.sender);
        nextOrderId++;
    }

    function pickUpOrder(uint256 orderId) external {
        require(orders[orderId].status == OrderStatus.Created, "Order not available for pickup");
        orders[orderId].deliveryPerson = msg.sender;
        orders[orderId].status = OrderStatus.InTransit;
        emit OrderPickedUp(orderId, msg.sender);
    }

    function confirmDelivery(uint256 orderId) external {
        require(orders[orderId].deliveryPerson == msg.sender, "Only assigned delivery person can confirm delivery");
        require(orders[orderId].status == OrderStatus.InTransit, "Order is not in transit");
        orders[orderId].status = OrderStatus.Delivered;
        emit OrderDelivered(orderId);
    }
}
