@isTest
private class CANVehicleControllerTest {

    @TestSetup
    static void setupData() {
        Account acc = new Account(Name = 'Test Dealer Account');
        insert acc;

        Product2 prod = new Product2(Name = 'EV Model S', IsActive = true);
        insert prod;

        Asset parentAsset = new Asset(
            Name = 'Test Vehicle Asset',
            AccountId = acc.Id,
            Product2Id = prod.Id
        );
        insert parentAsset;

        Asset childAsset = new Asset(
            Name = 'Front Left Tire',
            AccountId = acc.Id,
            ParentId = parentAsset.Id,
            SerialNumber = 'TIRE-001'
        );
        insert childAsset;

        Asset_Telematic__c telematic = new Asset_Telematic__c(
            Asset__c = parentAsset.Id,
            Measure_Name__c = 'Power',
            Measure_Value__c = 1,
            Measure_Time__c = DateTime.now()
        );
        insert telematic;
    }

    @isTest
    static void testGetVehicle() {
        Asset a = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Test.startTest();
        Asset result = CANVehicleController.getVehicle(a.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals('Test Vehicle Asset', result.Name);
    }

    @isTest
    static void testGetAsset() {
        Asset a = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Test.startTest();
        Asset result = CANVehicleController.getAsset(a.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals('Test Vehicle Asset', result.Name);
    }

    @isTest
    static void testGetVehiclePartsFromAsset() {
        Asset parentAsset = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Test.startTest();
        List<Asset> parts = CANVehicleController.getVehiclePartsFromAsset(parentAsset.Id);
        Test.stopTest();

        System.assertNotEquals(null, parts);
        System.assertEquals(1, parts.size());
        System.assertEquals('Front Left Tire', parts[0].Name);
    }

    @isTest
    static void testGetTelematics() {
        Asset parentAsset = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Test.startTest();
        List<Asset_Telematic__c> telematics = CANVehicleController.getTelematics(parentAsset.Id);
        Test.stopTest();

        System.assertNotEquals(null, telematics);
        System.assertEquals(1, telematics.size());
        System.assertEquals('Power', telematics[0].Measure_Name__c);
    }

    @isTest
    static void testInsertTelematics() {
        Asset parentAsset = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Asset_Telematic__c newTelematic = new Asset_Telematic__c(
            Asset__c = parentAsset.Id,
            Measure_Name__c = 'Doors',
            Measure_Value__c = 0,
            Measure_Time__c = DateTime.now()
        );

        Test.startTest();
        String result = CANVehicleController.insertTelematics(newTelematic);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertNotEquals('', result);
    }

    @isTest
    static void testUpdateAsset() {
        Asset childAsset = [SELECT Id, SerialNumber FROM Asset WHERE Name = 'Front Left Tire' LIMIT 1];
        childAsset.SerialNumber = 'TIRE-002';

        Test.startTest();
        Boolean result = CANVehicleController.updateAsset(childAsset);
        Test.stopTest();

        System.assertEquals(true, result);
    }

    @isTest
    static void testGetPriceBookList() {
        Test.startTest();
        List<Pricebook2> pricebooks = CANVehicleController.getPriceBookList();
        Test.stopTest();

        System.assertNotEquals(null, pricebooks);
    }

    @isTest
    static void testInsertAssetInspection() {
        Asset parentAsset = [SELECT Id FROM Asset WHERE Name = 'Test Vehicle Asset' LIMIT 1];

        Asset_Inspection__c inspection = new Asset_Inspection__c(
            Asset__c = parentAsset.Id
        );

        Test.startTest();
        String result = CANVehicleController.insertAssetInspection(inspection);
        Test.stopTest();

        System.assertNotEquals(null, result);
    }


    @isTest
    static void testGetAssetIdByVehicleId() {
        Test.startTest();
        List<sObject> result = CANVehicleController.getAssetIdByVehicleId('000000000000000');
        Test.stopTest();
        // May return null if Vehicle object doesn't exist in test context
    }

    @isTest
    static void testSaveOpty() {
        Account acc = [SELECT Id FROM Account WHERE Name = 'Test Dealer Account' LIMIT 1];

        Opportunity opty = new Opportunity(
            Name = 'Test Opty',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30)
        );

        Test.startTest();
        String result = CANVehicleController.saveOpty(opty, new List<OpportunityLineItem>());
        Test.stopTest();

        System.assertNotEquals('', result);
    }

    @isTest
    static void testGetPriceBookEntry() {
        Product2 prod = [SELECT Id FROM Product2 WHERE Name = 'EV Model S' LIMIT 1];
        Id stdPricebookId = Test.getStandardPricebookId();

        PricebookEntry pbe = new PricebookEntry(
            Product2Id = prod.Id,
            Pricebook2Id = stdPricebookId,
            UnitPrice = 50000,
            IsActive = true
        );
        insert pbe;

        Test.startTest();
        PricebookEntry result = CANVehicleController.getPriceBookEntry(prod.Id, stdPricebookId);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(50000, result.UnitPrice);
    }
}
