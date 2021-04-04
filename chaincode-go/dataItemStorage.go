/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/fhazraty/DataCollectionParadigm/chaincode-go/chaincode"
)

func main() {
	dataItemStorageChaincode, err := contractapi.NewChaincode(&chaincode.SmartContract{})
	if err != nil {
		log.Panicf("Error creating DataItemStorage chaincode: %v", err)
	}

	if err := dataItemStorageChaincode.Start(); err != nil {
		log.Panicf("Error starting DataItemStorage chaincode: %v", err)
	}
}
