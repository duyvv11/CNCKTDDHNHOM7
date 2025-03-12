const DeliveryTracker = artifacts.require("DeliveryTracker");

module.exports = function (deployer) {
  deployer.deploy(DeliveryTracker);
};
