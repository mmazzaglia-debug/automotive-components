public without sharing class CANVehicleController {
    
    @AuraEnabled(cacheable=true)
    public static Asset getVehicle(String assetId) {
        System.debug('getVehicle');
        return [SELECT Id, Name, AccountId, Product2.Top_View_Image_URL__c FROM Asset WHERE Id = :assetId];
    }

    @AuraEnabled(cacheable=true)
    public static List<sObject> getAssetIdByVehicleId(String vehicleId) {
        System.debug('getAssetIdByVehicleId');
        try {
            return Database.query('SELECT AssetId FROM Vehicle WHERE Id = :vehicleId');
        } catch(QueryException e) {
            // object or field does not exist
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static WorkOrder getAssetIdByWorkOrderId(String workOrderId) {
        System.debug('getAssetIdByWorkOrderId');
        return [SELECT AssetId FROM WorkOrder WHERE Id = :workOrderId];
    }

    @AuraEnabled(cacheable=true)
    public static Case getAssetIdByCaseId(String caseId) {
        System.debug('getAssetIdByCaseId');
        return [SELECT AssetId FROM Case WHERE Id = :caseId];
    }

    @AuraEnabled(cacheable=true)
    public static Asset getAsset(String assetId) {
        System.debug('getAsset');
        return [SELECT Id, Name, AccountId, Product2.Top_View_Image_URL__c FROM Asset WHERE Id = :assetId];
    }

    @AuraEnabled
    public static List<Asset> getVehiclePartsFromAsset(String assetId) {
        System.debug('get vehicle parts from asset id');
        return [SELECT Id, Name, CSS_properties__c, SerialNumber, ProductFamily, Product2.Product_Image_URL__c, Product2.Life_Expectancy__c, Life_Expectancy__c, Remaining_Life__c, InstallDate, Daily_Mileage__c, Replacement_Date__c, Walk_Around_Order__c FROM Asset WHERE ParentId = :assetId ORDER BY Walk_Around_Order__c];
    }

    @AuraEnabled
    public static Boolean updateAsset(Asset tireAsset) {
        try {
            update tireAsset;
            return true;
        } catch(DmlException e) {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
            return false;
        }
        
    }

    @AuraEnabled
    public static String saveOpty(Opportunity opty, List<OpportunityLineItem> optyLineItemList){
        try {
            System.debug('insert opportunity');
            insert opty;
            for(OpportunityLineItem opli:optyLineItemList){
                opli.OpportunityId = opty.Id;
            }
            insert optyLineItemList;
            System.debug('inserted opportunity : ' + opty.Id);
            return opty.Id;
        } catch(DmlException e) {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
            return '';
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Asset_Telematic__c> getTelematics(String assetId) {
        System.debug('get telematics');
        return [SELECT Id, Name, Asset__c, Measure_Name__c, Measure_Time__c, Measure_Value__c FROM Asset_Telematic__c WHERE Asset__c = :assetId ORDER BY Measure_Time__c];
    }

    @AuraEnabled
    public static string insertTelematics(Asset_Telematic__c assetTelematic){
        try {
            insert assetTelematic;
            return assetTelematic.Id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Pricebook2> getPriceBookList(){
        try {
            return [SELECT Id, Name FROM Pricebook2];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static PriceBookEntry getPriceBookEntry(String productId, String pricebookId){
        try {
            return [SELECT Id, UnitPrice FROM PriceBookEntry WHERE Product2Id = :productId AND Pricebook2Id = :pricebookId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static string insertAssetInspection(Asset_Inspection__c assetInspection){
        try {
            insert assetInspection;
            return assetInspection.Id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}