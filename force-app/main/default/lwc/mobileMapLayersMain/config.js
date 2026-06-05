export const config = {
  mapObjects: [
    {
      value: 'ServiceAppointment',
      latField: 'Latitude',
      longField: 'Longitude',
      titleField: 'AppointmentNumber',
      detailField: 'Subject',
    },
    {
      value: 'Asset',
      latField: 'Latitude__c',
      longField: 'Longitude__c',
      titleField: 'Name',
      detailField: 'Quantity',
    },
  ],
  distanceUnit: 'mi', // Preferred distance unit: km or mi
};