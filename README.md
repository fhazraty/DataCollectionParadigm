# DataCollectionParadigm Repository
This repository is created to demostrate the layered architecture which has discussed in "A Paradigm for COVID-19 Data Collection and Decision-Making using Blockchain and IoT" paper

#Automated data gathering in blockchain to use in higher levels of decision-making

## Full detail for starting a hyperledger test network
Follow the link : 
https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html

## Add changes to test-network :
Replace all codes exist in test-network folder to fabric-samples/test-network.


# Docker container for node js sample code
For deleting the image run:
```bash 
docker image rm fhazraty/iotsampledevice:1.0 -f
```

For build and create a new docker container run:
```bash 
cd /c/DataCollectionParadigm/DataCollectionParadigm/Application
docker build --force-rm -t 'fhazraty/iotsampledevice:1.0' . 
```

### Optional
For create an instance from image run in detach mode:
```bash 
 docker run -v C:/Users/Farhad/go/src/github.com/fhazraty/fabric-samples:/fabric-samples --name iotcontainer -d -p 49160:8080 fhazraty/iotsampledevice:1.0
```
### Optional
For create an instance from image run in attach mode:
```bash 
 docker run -v C:/Users/Farhad/go/src/github.com/fhazraty/fabric-samples:/fabric-samples --name iotcontainer -p 49160:8080 fhazraty/iotsampledevice:1.0
```

## The code to run the network :
Go to the download location of hyperledger fabric test network:
```bash
cd /c/Users/Farhad/go/src/github.com/fhazraty/fabric-samples/test-network
```

Replace the Testnetwork folder with sample code and then

For deleting all existing network :
```bash
./network.sh down
```
Create a network with certificate authority:
```bash
./network.sh up -ca
```
### Optional
If certificate authority did not start use this :
```bash
cd /c/Users/Farhad/go/src/github.com/fhazraty/fabric-samples/test-network
docker-compose -f ./docker/docker-compose.yaml up -d
```

Create a channel named mychannel:
```bash
./network.sh createChannel 
```

The address of chaincode on my hard drive is
```bash 
"/c/DataCollectionParadigm/DataCollectionParadigm/chaincode-go/"
```

For deploying a chaincode on the network use :
```bash
./network.sh deployCC -ccn datacollectionchaincode -ccp /c/DataCollectionParadigm/DataCollectionParadigm/chaincode-go/ -ccl go
```

For testing the network, channel and application open links below in browser:
Init ledger :
```bash
http://localhost:49160/init?userIdItem={Username}
```

Add new Item :
```bash
http://localhost:49160/createItem?userIdItem={Username}&itemId={ItemId}&itemValue={ItemValue}
```

Read all submitted data :
```bash
http://localhost:49160/readAllData?userIdItem={Username}
```

Run test :
```bash
http://localhost:49160/insertTransactions?userIdItem={Username}&itemNumber=3000
```