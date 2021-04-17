'use strict';

const express = require('express');
const PORT = 8080;
const HOST = '0.0.0.0';
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('/fabric-samples/test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('/fabric-samples/test-application/javascript/AppUtil.js');
const channelName = 'mychannel';
const chaincodeName = 'datacollectionchaincode';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function createItem(req, res){
    try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		try{
			await enrollAdmin(caClient, wallet, mspOrg1);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		try{
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
async function init(req, res){
    try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		try{
			await enrollAdmin(caClient, wallet, mspOrg1);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		try{
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
async function readAllData(req, res){
    try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		try{
			await enrollAdmin(caClient, wallet, mspOrg1);
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		try{
			await registerAndEnrollUser(caClient, wallet, mspOrg1, req.query.userIdItem, 'org1.department1');
		} catch (error2) {
			console.log(`******** FAILED to run the application: ${error2}`);
		}
		const gateway = new Gateway();

		try {
			try{
				await gateway.connect(ccp, {
					wallet,
					identity: req.query.userIdItem,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});
			} catch (error2) {
				console.log(`******** FAILED to run the application: ${error2}`);
			}
            const network = await gateway.getNetwork(channelName);

			const contract = network.getContract(chaincodeName);
            
			let result = await contract.evaluateTransaction('GetAllDataItems');
			res.send(`*** Result: ${prettyJSONString(result.toString())}`);

		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.log(`******** FAILED to run the application: ${error}`);
	}
  console.log('End of read all data....');
}

const app = express();

app.use(express.static('public'))

app.get('/', function(req, res) {
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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
