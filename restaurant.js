var Restaurant = function() {
    //Internal reference
    var self = this;
    //Clock Speed
    self.clockSpeed = 3000;
    //Staff
    self.staff = {};
    //Constructor
    self.constructor = function() {
        //Kitchen
        self.Kitchen = new self.KitchenOperation();
        //Zones
        self.Zones = {
            "Solo": new self.Zone({
                "name": "Solo",
                "tables": 2
            }),
            "Group": new self.Zone({
                "name": "Group",
                "tables": 4
            }),
            "Party": new self.Zone({
                "name": "Party",
                "tables": 6
            })
        };
        //Staff
        self.Staff = {
            "Host": new self.Host({
                "name": "Natasha Romanoff"
            }),
            "Waiters": [
                new self.Waiter({
                    "name": "Maria Hill",
                    "zone": "Solo"
                }),
                new self.Waiter({
                    "name": "Clint Barton",
                    "zone": "Group"
                }),
                new self.Waiter({
                    "name": "Nicholas Fury",
                    "zone": "Party"
                })
            ],
            "Bussers": [
                new self.Busser({
                    "name": "Phil, Son of Coul",
                    "zone": "Solo"
                }),
                new self.Busser({
                    "name": "Melinda May",
                    "zone": "Group"
                }),
                new self.Busser({
                    "name": "Colleen Wing",
                    "zone": "Party"
                })
            ]
        };
        //Customers
        self.Customer = {
            "Fenris Enterprise": new self.Customer({
                "name": "Harvey Brooks",
                "drink": "Half-and-half iced tea with four lemon slices",
                "food": "Juicy medium-rare ribeye steak, mashed potatoes, asparagus"
            }),
            "Koeniggsegg": new self.Customer({
                "name": "Christian von Koeniggsegg",
                "drink": "Swedish Beer",
                "food": "Seared fish on a bed of saurkraut"
            }),
            "Tesla": new self.Customer({
                "name": "Elon Musk",
                "drink": "your second-best wine",
                "food": "Devilled Egg Breakfast"
            })
        };

        //Loop
        setInterval(self.loop, self.clockSpeed);
    };
    //Loop
    self.loop = function() {
        //Make sure the place isn't on fire lol
    };
    //Host
    self.Host = function(configuration) {
        //Internal reference
        var host = this;
        //Constructor
        host.constructor = function() {
            setInterval(host.loop, self.clockSpeed);
        };
        //Loop
        host.loop = function() {
            //console.log("Hello World. I am a Host!! I AM ALIVE!");
            //1 - Loop through list of Customers
            for (customerName in self.Customer) {
                //Current Customer
                var currentCustomer = self.Customer[customerName];
                //Do they not have an assignedTable?
                if (currentCustomer.configuration.assignedTable == null) {
                    //Greet customer
                    host.greetCustomer(currentCustomer);
                    //Find the least saturated zone; this will become our availableZone
                    var availableZone = host.findLeastSaturatedZone();
                    //If there is an availableZone, 
                    if (availableZone) {
                        //Get an availableTable in the availableZone
                        var availableTable = availableZone.getAvailableTable();
                        //If there is one
                        if (availableTable) {
                            //Assign it to the Customer
                            currentCustomer.assignTable(availableTable);
                            //Reassure
                            currentCustomer.reassure("your Busser will take your drink order momentarily.");
                        } else {
                            //Reassure
                            currentCustomer.reassure("we are waiting for a table in your zone");
                        }
                    } else {
                        //Reassure
                        currentCustomer.reassure("we are waiting for a zone to take customers");
                    }
                }
            }
        };

        //Greet Customer
        host.greetCustomer = function(customer) {
            console.log("Hello " + customer.configuration.name + ". I, " + configuration.name + ", welcome you to Avengers Restaurant");
            customer.reassure("Let me find you a good spot....");
        };

        //Find Least Saturated Zone
        host.findLeastSaturatedZone = function(partySize) {
            //Sorted Zones
            var sortedZones = [];
            //Loop through all zones
            for (zoneName in self.Zones) {
                //Current Zone
                var currentZone = self.Zones[zoneName];
                //Get Current Zone Saturation
                var currentZoneSaturation = currentZone.determineSaturationLevel();
                //If currentZoneSaturation is zero, just send them there;
                if (currentZoneSaturation == 0) {
                    return currentZone;
                } else {
                    //Query saturation level
                    sortedZones[currentZone.determineSaturationLevel()] = currentZone;
                }
            }
            //If we made it this far, then we need to do some actual zorting, so...
            sortedZones = sortedZones.sort();
            //Grab the first one
            return sortedZones.shift();
        };
        //Go
        host.constructor();
    };

    //Waiter
    self.Waiter = function(configuration) {
        //Internal reference
        var waiter = this;
        //Configuration
        waiter.configuration = {
            "name": configuration.name,
            "zone": configuration.zone
        };
        //Constructor
        waiter.constructor = function() {
            setInterval(waiter.loop, self.clockSpeed);
        };
        //Loop
        waiter.loop = function() {
            //console.log(waiter.configuration.name + ", and my Zone is " + waiter.configuration.zone);
            //Loop through all tables in assigned Zone
            for (i = 0; i < self.Zones[waiter.configuration.zone].tables.length; i++) {
                //Current Table
                var currentTable = self.Zones[waiter.configuration.zone].tables[i];
                //Is the table saturated?
                if (currentTable.isSaturated() == true) {
                    //First Customer
                    var firstCustomer = currentTable.configuration.customers[0];
                    //If there is no foodOrder, get one from the honcho customer
                    if (currentTable.getfoodOrders().length == 0) {
                        //Ask the first customer for the drink order
                        var foodOrder = firstCustomer.getfoodOrder();
                        //Assign the foodOrder to this table
                        foodOrder.assignTable(currentTable);
                        //Add it to the foodOrders on this table
                        currentTable.configuration.foodOrders.push(foodOrder);
                        //Reassure firstCustomer
                        firstCustomer.reassure("your food is cooking, yaaay!");
                        //Deliver order to Kitchen
                        self.Kitchen.receiveOrder(foodOrder);
                    }
                }
            }
            //Swing by the Kitchen and see if any drink orders are ready
            for (i in self.Kitchen.orders) {
                //Current Order
                var currentOrder = self.Kitchen.orders[i];
                //Is it a drink order and is it ready?
                if ((currentOrder.configuration.type == "food") && (currentOrder.configuration.ready == true)) {
                    //console.log("ZYZ",currentOrder.configuration.table);
                    currentOrder.configuration.table.deliverOrder(currentOrder);
                    //Let the kitchen know
                    delete self.Kitchen.orders[i];
                }
            }
            //Loop through all tables in assigned Zone
            for (i = 0; i < self.Zones[waiter.configuration.zone].tables.length; i++) {
                //Current Table
                var currentTable = self.Zones[waiter.configuration.zone].tables[i];
                //Is the table saturated?
                if ((currentTable.isSaturated() == true) && (currentTable.allOrdersConsumed() == true)) {
                    //First Customer
                    var firstCustomer = currentTable.configuration.customers[0];
					//Generate the check for this table
					var check = currentTable.generateCheck();
					//Deliver check
					firstCustomer.receiveCheck(check);
                }
            }			
        };
        //Go
        waiter.constructor();
    };

    //Busser
    self.Busser = function(configuration) {
        //Internal reference
        var busser = this;
        //Configuration
        busser.configuration = {
            "name": configuration.name,
            "zone": configuration.zone
        };
        //Constructor
        busser.constructor = function() {
            setInterval(busser.loop, self.clockSpeed);
        };
        //Loop
        busser.loop = function() {
            //console.log(busser.configuration.name + ", and my Zone is " + busser.configuration.zone);
            //Loop through all tables in assigned Zone
            for (i = 0; i < self.Zones[busser.configuration.zone].tables.length; i++) {
                //Current Table
                var currentTable = self.Zones[busser.configuration.zone].tables[i];
                //Is the table saturated?
                if (currentTable.isSaturated() == true) {
                    //If there is no drinkOrder, get one from the honcho customer
                    if (currentTable.getDrinkOrders().length == 0) {
                        //First Customer
                        var firstCustomer = currentTable.configuration.customers[0];
                        //Ask the first customer for the drink order
                        var drinkOrder = firstCustomer.getDrinkOrder();
                        //Assign the drinkOrder to this table
                        drinkOrder.assignTable(currentTable);
                        //Add it to the drinkOrders on this table
                        currentTable.configuration.drinkOrders.push(drinkOrder);
                        //Reassure firstCustomer
                        firstCustomer.reassure("the waiter will swing by in a moment, as will the drinks");
                        //Deliver order to Kitchen
                        self.Kitchen.receiveOrder(drinkOrder);
                    }
                } else {
                    //Is the table dirty?
                    if (currentTable.isDirty() == true) {
                        currentTable.cleanUp();
                    }
                }
            }
            //Swing by the Kitchen and see if any drink orders are ready
            for (i in self.Kitchen.orders) {
                //Current Order
                var currentOrder = self.Kitchen.orders[i];
                //Is it a drink order and is it ready?
                if ((currentOrder.configuration.type == "drink") && (currentOrder.configuration.ready == true)) {
                    //console.log("ZYZ",currentOrder.configuration.table);
                    currentOrder.configuration.table.deliverOrder(currentOrder);
                    //Let the kitchen know
                    delete self.Kitchen.orders[i];
                }
            }
        };
        //Go
        busser.constructor();
    };

    //Customer
    self.Customer = function(configuration) {
        //Internal reference
        var customer = this;
        //Configuration
        customer.configuration = {
            "name": configuration.name,
            "assignedTable": null,
            "drink": configuration.drink,
            "food": configuration.food,
            "timeWaiting": 0,
            "drinkOrders": [],
            "foodOrders": [],
            "assurance": "",
            "finishedEating": false,
            "paidForFood": false
        };
        //Constructor
        customer.constructor = function() {
            customer.patience = setInterval(customer.loop, self.clockSpeed);
        };
        //Loop
        customer.loop = function() {
            customer.configuration.timeWaiting += 1;
            console.log(configuration.name, "->> Waiting for " + customer.configuration.timeWaiting + " pretend minute(s); " + customer.configuration.assurance);
            //Are my orders delivered to my table?
            if (customer.configuration.assignedTable.configuration.deliveredOrders.length > 0) {
                //Consumed Ordes
                var consumedOrders = 0;
                //Consume
                for (i in customer.configuration.assignedTable.configuration.deliveredOrders) {
                    if (customer.configuration.assignedTable.configuration.deliveredOrders[i].configuration.consumed == false) {
                        //Consume
                        customer.configuration.assignedTable.configuration.deliveredOrders[i].configuration.consumed = true;
                        //Customer re-assures self
                        customer.reassure("ah good, i can consume " + customer.configuration.assignedTable.configuration.deliveredOrders[i].configuration.item);
                    } else {
                        consumedOrders++;
                    }
                }
                //Have my food and drink order been delivered?
                if (customer.configuration.assignedTable.configuration.deliveredOrders.length >= 2) {
                    //Have I consumed them all?
                    if (consumedOrders == customer.configuration.assignedTable.configuration.deliveredOrders.length) {
                        //Customer re-assures self
                        customer.reassure("Schweet. I'm ready for my check now.");
                    } else {

                    }
                } else {

                }


            }
            //Run out of patience after 15 pretend minutes
            if (customer.configuration.timeWaiting >= 16) {
                customer.getFrustrated();
            }
        };
        //Deliver Check
        customer.receiveCheck = function(check){
			//Customer re-assures self
			customer.reassure("I will now pay my check and go home");
			console.log(check);
        };
        //Assign Table
        customer.assignTable = function(table) {
            console.log(configuration.name, "->> Cool. I will sit at at a Table in Zone " + table.configuration.assignedZone.configuration.name);
            table.seatCustomer(customer);
        };
        //Get Drink Order
        customer.getDrinkOrder = function() {
            return new self.Order({
                "item": customer.configuration.drink,
                "quantity": "1",
                "type": "drink"
            });
        };
        //Get Food Order
        customer.getfoodOrder = function() {
            return new self.Order({
                "item": customer.configuration.food,
                "quantity": "1",
                "type": "food"
            });
        };
        //Reassure
        customer.reassure = function(assurance) {
            customer.configuration.timeWaiting = 0;
            customer.configuration.assurance = " :: '" + assurance + "'";
        };
        //Get Frustrated
        customer.getFrustrated = function() {
            console.log(configuration.name, "->> Fuck this; I'm out.");
            clearInterval(customer.patience);
        }
        //Go
        customer.constructor();
    };

    //Zone
    self.Zone = function(configuration) {
        //Internal reference
        var zone = this;
        //Configuration
        zone.configuration = {
            "name": configuration.name,
            "tables": configuration.tables
        }
        //Tables
        zone.tables = [];
        //Constructor
        zone.constructor = function() {
            console.log("Hello World. I am a Zone, and I contain Tables.");
            //Create Tables
            for (i = 0; i < configuration.tables; i++) {
                zone.tables.push(new self.Table({
                    "assignedZone": zone
                }));
            }
        };
        //Get Available Table
        zone.getAvailableTable = function() {
            //Create Tables
            for (i = 0; i < zone.tables.length; i++) {
                //Current Table
                var currentTable = zone.tables[i];
                //If the table is not saturated, then it is available
                if (currentTable.isSaturated() == false) {
                    return currentTable;
                }
            }

            return false;
        };
        //Report Saturation
        zone.determineSaturationLevel = function() {
            //Saturated Tables
            var saturatedTables = 0;
            //Loop through all tables in the zone
            for (i = 0; i < zone.tables.length; i++) {
                //Current Table
                var currentTable = zone.tables[i];
                //See if this table is at capacity
                if (currentTable.isSaturated() == true) {
                    saturatedTables++;
                }
            }
            //Calculate
            return (saturatedTables / zone.tables.length) * 100;
        }
        //Go
        zone.constructor();
    };

    //Table
    self.Table = function(configuration) {
        //Internal reference
        var table = this;
        //configuration
        table.configuration = {
            "assignedZone": configuration.assignedZone,
            "customers": [],
            "drinkOrders": [],
            "foodOrders": [],
            "deliveredOrders": [],
            "isDirty": false
        };
        //Constructor
        table.constructor = function() {
            //console.log("Hello World. I am a Table in Zone '" + table.configuration.assignedZone.configuration.name + "'");
        };
        //All orders Consumed
        table.allOrdersConsumed = function(){
          //Consumed Orders
          var consumedOrders = 0;
          //Total Delivered Orders
          var totalDeliveredOrders = table.configuration.deliveredOrders.length;		  
		  //At least one Drink and Food order need to be consumed.
		  if(totalDeliveredOrders >= 2){
			  //Loop
			  for(i in table.configuration.deliveredOrders){
				//Current Delivered Order
				var currentDeliveredOrder = table.configuration.deliveredOrders[i];
				//If it was consumed, count it
				if(currentDeliveredOrder.configuration.consumed == true){
				  consumedOrders++;
				}
			  }
			  //Send it back
			  return (consumedOrders == totalDeliveredOrders);			  
		  }
		  else{
			  return false;
		  }
        };
        //Generate Check
        table.generateCheck = function(){
          return {
            "cost":table.configuration.deliveredOrders.length * 24.99
          };
        }
        //Get Drink Orders
        table.getDrinkOrders = function() {
            return table.configuration.drinkOrders;
        };
        //Get Food Orders
        table.getfoodOrders = function() {
            return table.configuration.foodOrders;
        };
        //Seat Customer
        table.seatCustomer = function(customer) {
            //Customer is now associated with this table
            customer.configuration.assignedTable = table;
            //Record to this table's list of customers
            table.configuration.customers.push(customer);
            //The table is dirty the second an ass takes a seat, lol
            table.configuration.isDirty = true;
        };
        //Deliver Order
        table.deliverOrder = function(order) {
            //Deliver order
            table.configuration.deliveredOrders.push(order);
        };
        //Clean Up
        table.cleanUp = function() {
            table.configuration.isDirty = false;
        };
        //Is Dirty
        table.isDirty = function() {
            return table.configuration.isDirty;
        };
        //Is Saturated
        table.isSaturated = function() {
            if (table.configuration.customers.length > 0) {
                return true;
            } else {
                return false;
            }
        }
        //Go
        table.constructor();
    };

    //Order
    self.Order = function(configuration) {
        //Internal reference
        var order = this;
        //Configuration
        order.configuration = {
            "table": null,
            "item": configuration.item,
            "type": configuration.type,
            "ready": false,
            "consumed": false,
            "paidFor": false,
            "quantity": configuration.quantity
        };
        //Constructor
        order.constructor = function() {
            //Hmm...
        };
        //Assign to Table
        order.assignTable = function(table) {
            console.log("Order assigned to ", table);
            order.configuration.table = table;
        }
        //Go
        order.constructor();
    };

    //Kitchen
    self.KitchenOperation = function() {
        //Internal reference
        var kitchen = this;
        //Orders
        kitchen.orders = [];
        //Order Index
        kitchen.orderIndex = 0;
        //Constructor
        kitchen.constructor = function() {
            console.log("I am an Kitchen! I prepare orders as I damn well please :)", kitchen.configuration);
            setInterval(kitchen.prepareOrder, self.clockSpeed / 2);
        };
        //Receive Order
        kitchen.receiveOrder = function(order) {
            kitchen.orders.push(order);
        };
        //Prepare Order
        kitchen.prepareOrder = function() {
            if (kitchen.orders.length > 0) {
                if (kitchen.orders[kitchen.orderIndex]) {
                    //Mark it as ready
                    kitchen.orders[kitchen.orderIndex].configuration.ready = true;
                    //Log
                    //console.log("Kitchen Order Ready!",kitchen.orders[kitchen.orderIndex].configuration);
                    kitchen.orderIndex++;
                } else {
                    kitchen.orderIndex = 0;
                }
            } else {
                console.log("No orders in the kitchen yet :(");
            }
        };
        //Go
        kitchen.constructor();
    };
    //Showtime
    self.constructor();
};

var AvengersRestaurant = new Restaurant();
