@isTest
private class Auto_Genie_c360_ControllerTest {

    @isTest
    static void testGetContactFromContact() {
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        Contact con = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            AccountId = acc.Id,
            Email = 'john@example.com'
        );
        insert con;

        Test.startTest();
        Contact result = Auto_Genie_c360_Controller.getContact(con.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals('John', result.FirstName);
    }
}
