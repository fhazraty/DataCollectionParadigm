# DataCollectionParadigm Repository
This repository is created to demostrate the layered architecture which has discussed in "A Paradigm for COVID-19 Data Collection and Decision-Making using Blockchain and IoT" paper

#Automated data gathering in blockchain to use in higher levels of decision-making


./network.sh down
./network.sh up -ca
./network.sh createChannel
./network.sh deployCC -ccn datacollectionchaincode -ccp /c/DataCollectionParadigm/DataCollectionParadigm/chaincode-go/ -ccl go


# Docker container for node js sample code
For build and create a new docker container run:
docker build -t 'fhazraty/iotsampledevice:1.0' .

For create an instance from image run:
docker run -p 49160:8080 -d fhazraty/iotsampledevice:1.0

For deleting the image run:
docker image rm fhazraty/iotsampledevice:1.0 -f
