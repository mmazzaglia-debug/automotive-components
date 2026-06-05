@isTest
private class RecommendedVehiclesControllerTest {

    @isTest
    static void testGetRecommendedVehiclesWithProduct2() {
        Product2 prod = new Product2(Name = 'Test Vehicle Model X', IsActive = true);
        insert prod;

        Test.startTest();
        List<RecommendedVehiclesController.VehicleRecommendation> results =
            RecommendedVehiclesController.getRecommendedVehicles(null, 5);
        Test.stopTest();

        System.assertNotEquals(null, results);
        System.assert(results.size() > 0, 'Should return at least one recommendation from Product2');
        System.assertEquals('Test Vehicle Model X', results[0].vehicleName);
    }

    @isTest
    static void testGetRecommendedVehiclesNullMaxRecords() {
        Product2 prod = new Product2(Name = 'Vehicle A', IsActive = true);
        insert prod;

        Test.startTest();
        List<RecommendedVehiclesController.VehicleRecommendation> results =
            RecommendedVehiclesController.getRecommendedVehicles(null, null);
        Test.stopTest();

        System.assertNotEquals(null, results);
        System.assert(results.size() <= 3, 'Should default to 3 max records');
    }

    @isTest
    static void testGetRecommendedVehiclesZeroMaxRecords() {
        Product2 prod = new Product2(Name = 'Vehicle B', IsActive = true);
        insert prod;

        Test.startTest();
        List<RecommendedVehiclesController.VehicleRecommendation> results =
            RecommendedVehiclesController.getRecommendedVehicles(null, 0);
        Test.stopTest();

        System.assertNotEquals(null, results);
    }

    @isTest
    static void testGetRecommendedVehiclesWithLead() {
        Lead testLead = new Lead(FirstName = 'John', LastName = 'Doe', Company = 'Test Co');
        insert testLead;

        Product2 prod = new Product2(Name = 'Sedan EV', IsActive = true);
        insert prod;

        Test.startTest();
        List<RecommendedVehiclesController.VehicleRecommendation> results =
            RecommendedVehiclesController.getRecommendedVehicles(testLead.Id, 2);
        Test.stopTest();

        System.assertNotEquals(null, results);
    }

    @isTest
    static void testGetRecommendedVehiclesMultipleProducts() {
        List<Product2> products = new List<Product2>();
        for (Integer i = 0; i < 10; i++) {
            products.add(new Product2(Name = 'Vehicle ' + i, IsActive = true));
        }
        insert products;

        Test.startTest();
        List<RecommendedVehiclesController.VehicleRecommendation> results =
            RecommendedVehiclesController.getRecommendedVehicles(null, 5);
        Test.stopTest();

        System.assertEquals(5, results.size(), 'Should return exactly 5 recommendations');
    }

    @isTest
    static void testVehicleRecommendationConstructor() {
        Id fakeId = '001000000000001';
        RecommendedVehiclesController.VehicleRecommendation rec =
            new RecommendedVehiclesController.VehicleRecommendation(fakeId, 'Test Car', 'https://img.com/car.png');

        System.assertEquals(fakeId, rec.recordId);
        System.assertEquals('Test Car', rec.vehicleName);
        System.assertEquals('https://img.com/car.png', rec.imageUrl);
    }
}
