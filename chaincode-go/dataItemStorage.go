/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"log"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)



type SmartContract struct {
	contractapi.Contract
}

type DataItem struct {
	ID             string `json:"ID"`
	Data           string `json:"data"`
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (s *SmartContract) CreateDataItem(ctx contractapi.TransactionContextInterface, id string, data string) error {
	exists, err := s.DataItemExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the DataItem %s already exists", id)
	}

	dataItem := DataItem{
		ID:             id,
		Data:          data,
	}
	dataItemJSON, err := json.Marshal(dataItem)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(id, dataItemJSON)
}

func (s *SmartContract) ReadDataItem(ctx contractapi.TransactionContextInterface, id string) (*DataItem, error) {
	dataItemJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if dataItemJSON == nil {
		return nil, fmt.Errorf("the data item %s does not exist", id)
	}

	var dataItem DataItem
	err = json.Unmarshal(dataItemJSON, &dataItem)
	if err != nil {
		return nil, err
	}

	return &dataItem, nil
}

func (s *SmartContract) UpdateDataItem(ctx contractapi.TransactionContextInterface, id string, data string) error {
	exists, err := s.DataItemExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the data item %s does not exist", id)
	}

	dataItem := DataItem{
		ID:             id,
		Data:           data,
	}
	dataItemJSON, err := json.Marshal(dataItem)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, dataItemJSON)
}

func (s *SmartContract) DeleteDataItem(ctx contractapi.TransactionContextInterface, id string) error {
	exists, err := s.DataItemExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the data item %s does not exist", id)
	}

	return ctx.GetStub().DelState(id)
}

func (s *SmartContract) DataItemExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	dataItemJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return dataItemJSON != nil, nil
}

func (s *SmartContract) GetAllDataItems(ctx contractapi.TransactionContextInterface) ([]*DataItem, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil,err
	}
	defer resultsIterator.Close()

	var dataItems []*DataItem
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil,err
		}

		var dataItem DataItem
		err = json.Unmarshal(queryResponse.Value, &dataItem)
		if err != nil {
			return nil,err
		}
		dataItems = append(dataItems, &dataItem)
	}
	return dataItems,nil
}





func main() {
	dataItemStorageChaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating DataItemStorage chaincode: %v", err)
	}

	if err := dataItemStorageChaincode.Start(); err != nil {
		log.Panicf("Error starting DataItemStorage chaincode: %v", err)
	}
}
