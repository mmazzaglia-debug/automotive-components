@isTest
private class AppointmentControllerTest {

    @isTest
    static void testConstructor() {
        Test.startTest();
        AppointmentController ctrl = new AppointmentController();
        Test.stopTest();
        System.assertNotEquals(null, ctrl);
    }

    @isTest
    static void testConvertTimeToOtherTimeZone() {
        Test.startTest();
        Map<String, DateTime> result = AppointmentController.convertTimeToOtherTimeZone(
            DateTime.now(),
            DateTime.now().addHours(1),
            'America/New_York',
            'Europe/London'
        );
        Test.stopTest();

        System.assertNotEquals(null, result.get('date1'));
        System.assertNotEquals(null, result.get('date2'));
    }

}
