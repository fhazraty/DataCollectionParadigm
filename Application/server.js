'use strict';

const express = require('express');
const PORT = 8080;
const HOST = '0.0.0.0';
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('/fabric-samples/test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('/fabric-samples/test-application/javascript/AppUtil.js');
const channelName = 'mychannel';
const chaincodeName = 'datacollectionchaincode';
const mspOrg1 = 'Org1MSP';
const mspOrg2 = 'Org2MSP';
const walletPath = path.join(__dirname, 'wallet2');
const walletPath3 = path.join(__dirname, 'wallet3');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function createItem(req, res) {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		try {
			await enrollAdmin(caClient, wallet, mspOrg1);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		try {
			await registerAndEnrollUser(caClient, wallet, mspOrg1, req.query.userIdItem, 'org1.department1');
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		const gateway = new Gateway();

		try {
			await gateway.connect(ccp, {
				wallet,
				identity: req.query.userIdItem,
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			await contract.submitTransaction('CreateDataItem', req.query.itemId, req.query.itemValue)
			res.send('Transaction submitted...');
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		res.send(`******** FAILED to Create DataItem: ${error}`);
	}
}
async function init(req, res) {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		try {
			await enrollAdmin(caClient, wallet, mspOrg1);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		try {
			await registerAndEnrollUser(caClient, wallet, mspOrg1, req.query.userIdItem, 'org1.department1');
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		const gateway = new Gateway();
		try {
			await gateway.connect(ccp, {
				wallet,
				identity: req.query.userIdItem,
				discovery: { enabled: true, asLocalhost: true }
			});
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);
			await contract.submitTransaction('InitLedger');
			res.send('Init execution sent...');
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		res.send(`******** FAILED to run Init: ${error}`);
	}
}
async function readAllData(req, res) {
	try {
		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath3);
		try {
			await enrollAdmin(caClient, wallet, mspOrg2);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2} ---- line 96`);
		}
		try {
			await registerAndEnrollUser(caClient, wallet, mspOrg2, req.query.userIdItem, 'org2.department1');
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2} ---- line 101`);
		}
		const gateway = new Gateway();

		try {
			try {
				await gateway.connect(ccp, {
					wallet,
					identity: req.query.userIdItem,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});
			} catch (error2) {
				console.log(`******** FAILED to run the application: ${error2}  ---- line 113`);
			}
			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);

			let result = await contract.evaluateTransaction('GetAllDataItems');
			res.send(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.log(`******** FAILED to run the application: ${error}  ---- line 126`);
	}
	console.log('End of read all data....');
}
async function readAllDataByEvent(req, res) {
	try {
		const ccp = buildCCPOrg2();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');
		const wallet = await buildWallet(Wallets, walletPath3);
		try {
			await enrollAdmin(caClient, wallet, mspOrg2);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2} ---- line 141`);
		}
		try {
			await registerAndEnrollUser(caClient, wallet, mspOrg2, req.query.userIdItem, 'org2.department1');
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2} ---- line 146`);
		}
		const gateway = new Gateway();

		try {
			try {
				await gateway.connect(ccp, {
					wallet,
					identity: req.query.userIdItem,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});
			} catch (error2) {
				console.log(`******** FAILED to run the application: ${error2}  ---- line 158`);
			}
			const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);

			let listener;
			
			// first create a listener to be notified of chaincode code events
			// coming from the chaincode ID "events"
			listener = async (event) => {
				// The payload of the chaincode event is the value place there by the
				// chaincode. Notice it is a byte data and the application will have
				// to know how to deserialize.
				// In this case we know that the chaincode will always place the asset
				// being worked with as the payload for all events produced.
				const asset = JSON.parse(event.payload.toString());
				//console.log(`*** Contract Event Received: ${event.eventName} - ${JSON.stringify(asset)} received at:` + Date.now());
				
				console.log(Date.now() + "," + asset.ID.toString() + "," + "EventReceived");
				// show the information available with the event
				//console.log(`*** Event: ${event.eventName}:${asset.ID}`);
				// notice how we have access to the transaction information that produced this chaincode event
				//const eventTransaction = event.getTransactionEvent();
				//console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
				//showTransactionData(eventTransaction.transactionData);
				// notice how we have access to the full block that contains this transaction
				//const eventBlock = eventTransaction.getBlockEvent();
				//console.log(`*** block: ${eventBlock.blockNumber.toString()}`);
			};

			contract.addContractListener(listener);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.log(`******** FAILED to run the application: ${error}  ---- line 193`);
	}
	console.log('End of read all data....');
}
function showTransactionData(transactionData) {
	const creator = transactionData.actions[0].header.creator;
	console.log(`    - submitted by: ${creator.mspid}-${creator.id_bytes.toString('hex')}`);
	for (const endorsement of transactionData.actions[0].payload.action.endorsements) {
		console.log(`    - endorsed by: ${endorsement.endorser.mspid}-${endorsement.endorser.id_bytes.toString('hex')}`);
	}
	const chaincode = transactionData.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec;
	console.log(`    - chaincode:${chaincode.chaincode_id.name}`);
	console.log(`    - function:${chaincode.input.args[0].toString()}`);
	for (let x = 1; x < chaincode.input.args.length; x++) {
		console.log(`    - arg:${chaincode.input.args[x].toString()}`);
	}
}
async function insertTransactions(req, res) {
		try {
			const ccp = buildCCPOrg1();
			const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
			const wallet = await buildWallet(Wallets, walletPath);
			try {
				await enrollAdmin(caClient, wallet, mspOrg1);
			} catch (error2) {
				console.log(`******** FAILED to run the application: ${error2}`);
			}
			try {
				await registerAndEnrollUser(caClient, wallet, mspOrg1, req.query.userIdItem, 'org1.department1');
			} catch (error2) {
				console.log(`******** FAILED to run the application: ${error2}`);
			}
			const gateway = new Gateway();

			try {
				await gateway.connect(ccp, {
					wallet,
					identity: req.query.userIdItem,
					discovery: { enabled: true, asLocalhost: true }
				});
				const network = await gateway.getNetwork(channelName);
				const contract = network.getContract(chaincodeName);

				var i;
				for (i = 0; i < req.query.itemNumber; i++) {
					console.log(Date.now() + "," + i.toString() + "," + "submitted");
					await contract.submitTransaction('CreateDataItem', i.toString(), i.toString());
					console.log(Date.now() + "," + i.toString() + "," + "confirmed");
				}
				res.send('Transaction submitted...');
			} finally {
				gateway.disconnect();
			}
		} catch (error) {
			res.send(`******** FAILED to Create DataItem: ${error}`);
		}
}

	const app = express();

	app.use(express.static('public'))

	app.get('/', function (req, res) {

		res.render('index.html');
	});

	app.get('/createItem', (req, res) => {
		createItem(req, res);
	});

	app.get('/init', (req, res) => {
		init(req, res);
	});

	app.get('/readAllData', (req, res) => {
		readAllData(req, res);
	});
	app.get('/readAllDataByEvent', (req, res) => {
		readAllDataByEvent(req, res);
	});

	app.get('/insertTransactions', (req, res) => {
		insertTransactions(req, res);
	});

	app.listen(PORT, HOST);
	console.log(`Running on http://${HOST}:${PORT}`);
