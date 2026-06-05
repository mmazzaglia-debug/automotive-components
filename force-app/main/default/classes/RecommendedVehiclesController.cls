public with sharing class RecommendedVehiclesController {
    private static final Integer DEFAULT_LIMIT = 3;
    private static final Integer FETCH_WINDOW = 50;

    public class VehicleRecommendation {
        @AuraEnabled public Id recordId;
        @AuraEnabled public String vehicleName;
        @AuraEnabled public String imageUrl;

        public VehicleRecommendation(Id recordId, String vehicleName, String imageUrl) {
            this.recordId = recordId;
            this.vehicleName = vehicleName;
            this.imageUrl = imageUrl;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<VehicleRecommendation> getRecommendedVehicles(Id leadId, Integer maxRecords) {
        Integer limitToUse = (maxRecords == null || maxRecords <= 0) ? DEFAULT_LIMIT : maxRecords;

        // Try likely vehicle objects in order. If one isn't available in this org, skip it.
        for (String objectApiName : new List<String>{ 'Vehicle__c', 'Product2' }) {
            List<VehicleRecommendation> results = getRecommendationsForObject(objectApiName, limitToUse);
            if (!results.isEmpty()) {
                return results;
            }
        }

        return new List<VehicleRecommendation>();
    }

    private static List<VehicleRecommendation> getRecommendationsForObject(String objectApiName, Integer maxRecords) {
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
        Schema.SObjectType objectType = globalDescribe.get(objectApiName);
        if (objectType == null) {
            return new List<VehicleRecommendation>();
        }

        Map<String, Schema.SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
        if (!fieldMap.containsKey('Name')) {
            return new List<VehicleRecommendation>();
        }

        String imageField = getFirstExistingField(fieldMap, new List<String>{
            'Image_URL__c',
            'ImageUrl__c',
            'Photo_URL__c',
            'PhotoUrl__c',
            'Picture_URL__c',
            'PictureUrl__c',
            'Thumbnail_URL__c',
            'ThumbnailUrl__c'
        });

        List<String> selectFields = new List<String>{ 'Id', 'Name' };
        if (String.isNotBlank(imageField)) {
            selectFields.add(imageField);
        }

        String soql = 'SELECT ' + String.join(selectFields, ',') +
            ' FROM ' + objectApiName +
            ' WHERE Name != null' +
            ' LIMIT ' + FETCH_WINDOW;

        List<SObject> records = Database.query(soql);
        shuffle(records);

        List<VehicleRecommendation> response = new List<VehicleRecommendation>();
        for (SObject recordRow : records) {
            if (response.size() >= maxRecords) {
                break;
            }

            String vehicleName = (String)recordRow.get('Name');
            String imageUrl = String.isNotBlank(imageField) ? (String)recordRow.get(imageField) : null;
            response.add(new VehicleRecommendation((Id)recordRow.get('Id'), vehicleName, imageUrl));
        }

        return response;
    }

    private static String getFirstExistingField(
        Map<String, Schema.SObjectField> fieldMap,
        List<String> candidateFieldNames
    ) {
        for (String fieldName : candidateFieldNames) {
            if (fieldMap.containsKey(fieldName)) {
                return fieldName;
            }
        }
        return null;
    }

    // Lightweight in-memory shuffle for randomizing recommendation order.
    private static void shuffle(List<SObject> records) {
        Integer size = records.size();
        for (Integer i = size - 1; i > 0; i--) {
            Integer randomIndex = Integer.valueOf(Math.floor(Math.random() * (i + 1)));
            SObject temp = records[i];
            records[i] = records[randomIndex];
            records[randomIndex] = temp;
        }
    }
}