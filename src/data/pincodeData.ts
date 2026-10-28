import { PinCodeEntry } from '../types';

export const PINCODE_DATABASE: PinCodeEntry[] = [
  // Delhi
  { pincode: '110001', officeName: 'New Delhi GPO', officeType: 'HO', district: 'Central Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110002', officeName: 'Darya Ganj SO', officeType: 'SO', district: 'Central Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110003', officeName: 'Aliganj SO', officeType: 'SO', district: 'South Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110006', officeName: 'Delhi Sadar Bazar SO', officeType: 'SO', district: 'North Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110019', officeName: 'Kalkaji SO', officeType: 'SO', district: 'South Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110025', officeName: 'Jamia Nagar SO', officeType: 'SO', district: 'South Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110034', officeName: 'Saraswati Vihar SO', officeType: 'SO', district: 'North West Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110058', officeName: 'Janakpuri SO', officeType: 'SO', district: 'West Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110085', officeName: 'Rohini Sector 7 SO', officeType: 'SO', district: 'North West Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },
  { pincode: '110092', officeName: 'Anand Vihar SO', officeType: 'SO', district: 'East Delhi', state: 'Delhi', deliveryStatus: 'Delivery' },

  // Maharashtra / Mumbai / Pune
  { pincode: '400001', officeName: 'Mumbai GPO', officeType: 'HO', district: 'Mumbai', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '400050', officeName: 'Bandra West SO', officeType: 'SO', district: 'Mumbai Suburban', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '400051', officeName: 'Bandra Kurla Complex SO', officeType: 'SO', district: 'Mumbai Suburban', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '400076', officeName: 'Powai IIT SO', officeType: 'SO', district: 'Mumbai Suburban', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '411001', officeName: 'Pune Cantt GPO', officeType: 'HO', district: 'Pune', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '411004', officeName: 'Deccan Gymkhana SO', officeType: 'SO', district: 'Pune', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '411057', officeName: 'Hinjawadi SO', officeType: 'SO', district: 'Pune', state: 'Maharashtra', deliveryStatus: 'Delivery' },
  { pincode: '440001', officeName: 'Nagpur GPO', officeType: 'HO', district: 'Nagpur', state: 'Maharashtra', deliveryStatus: 'Delivery' },

  // Karnataka / Bengaluru
  { pincode: '560001', officeName: 'Bengaluru GPO', officeType: 'HO', district: 'Bangalore', state: 'Karnataka', deliveryStatus: 'Delivery' },
  { pincode: '560034', officeName: 'Koramangala SO', officeType: 'SO', district: 'Bangalore', state: 'Karnataka', deliveryStatus: 'Delivery' },
  { pincode: '560038', officeName: 'Indiranagar SO', officeType: 'SO', district: 'Bangalore', state: 'Karnataka', deliveryStatus: 'Delivery' },
  { pincode: '560066', officeName: 'Whitefield SO', officeType: 'SO', district: 'Bangalore', state: 'Karnataka', deliveryStatus: 'Delivery' },
  { pincode: '560100', officeName: 'Electronic City SO', officeType: 'SO', district: 'Bangalore', state: 'Karnataka', deliveryStatus: 'Delivery' },
  { pincode: '570001', officeName: 'Mysuru Head Office', officeType: 'HO', district: 'Mysore', state: 'Karnataka', deliveryStatus: 'Delivery' },

  // Uttar Pradesh
  { pincode: '201301', officeName: 'Noida Sector 16 SO', officeType: 'SO', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '201001', officeName: 'Ghaziabad H.O', officeType: 'HO', district: 'Ghaziabad', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '226001', officeName: 'Lucknow G.P.O.', officeType: 'HO', district: 'Lucknow', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '226010', officeName: 'Gomti Nagar SO', officeType: 'SO', district: 'Lucknow', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '221001', officeName: 'Varanasi Cantt HO', officeType: 'HO', district: 'Varanasi', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '211001', officeName: 'Prayagraj Kutchery SO', officeType: 'SO', district: 'Prayagraj', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '282001', officeName: 'Agra Fort HO', officeType: 'HO', district: 'Agra', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '208001', officeName: 'Kanpur GPO', officeType: 'HO', district: 'Kanpur Nagar', state: 'Uttar Pradesh', deliveryStatus: 'Delivery' },

  // Bihar
  { pincode: '800001', officeName: 'Patna G.P.O.', officeType: 'HO', district: 'Patna', state: 'Bihar', deliveryStatus: 'Delivery' },
  { pincode: '800020', officeName: 'Kankarbagh SO', officeType: 'SO', district: 'Patna', state: 'Bihar', deliveryStatus: 'Delivery' },
  { pincode: '842001', officeName: 'Muzaffarpur HO', officeType: 'HO', district: 'Muzaffarpur', state: 'Bihar', deliveryStatus: 'Delivery' },
  { pincode: '823001', officeName: 'Gaya HO', officeType: 'HO', district: 'Gaya', state: 'Bihar', deliveryStatus: 'Delivery' },

  // West Bengal
  { pincode: '700001', officeName: 'Kolkata GPO', officeType: 'HO', district: 'Kolkata', state: 'West Bengal', deliveryStatus: 'Delivery' },
  { pincode: '700091', officeName: 'Salt Lake Sector V SO', officeType: 'SO', district: 'North 24 Parganas', state: 'West Bengal', deliveryStatus: 'Delivery' },
  { pincode: '711101', officeName: 'Howrah HO', officeType: 'HO', district: 'Howrah', state: 'West Bengal', deliveryStatus: 'Delivery' },
  { pincode: '734001', officeName: 'Siliguri HO', officeType: 'HO', district: 'Darjeeling', state: 'West Bengal', deliveryStatus: 'Delivery' },

  // Tamil Nadu
  { pincode: '600001', officeName: 'Chennai GPO', officeType: 'HO', district: 'Chennai', state: 'Tamil Nadu', deliveryStatus: 'Delivery' },
  { pincode: '600028', officeName: 'R.A. Puram SO', officeType: 'SO', district: 'Chennai', state: 'Tamil Nadu', deliveryStatus: 'Delivery' },
  { pincode: '641001', officeName: 'Coimbatore HO', officeType: 'HO', district: 'Coimbatore', state: 'Tamil Nadu', deliveryStatus: 'Delivery' },
  { pincode: '625001', officeName: 'Madurai HO', officeType: 'HO', district: 'Madurai', state: 'Tamil Nadu', deliveryStatus: 'Delivery' },

  // Telangana
  { pincode: '500001', officeName: 'Hyderabad GPO', officeType: 'HO', district: 'Hyderabad', state: 'Telangana', deliveryStatus: 'Delivery' },
  { pincode: '500081', officeName: 'Madhapur SO', officeType: 'SO', district: 'K.V. Rangareddy', state: 'Telangana', deliveryStatus: 'Delivery' },
  { pincode: '500032', officeName: 'Gachibowli SO', officeType: 'SO', district: 'K.V. Rangareddy', state: 'Telangana', deliveryStatus: 'Delivery' },

  // Rajasthan
  { pincode: '302001', officeName: 'Jaipur GPO', officeType: 'HO', district: 'Jaipur', state: 'Rajasthan', deliveryStatus: 'Delivery' },
  { pincode: '342001', officeName: 'Jodhpur Kutchery HO', officeType: 'HO', district: 'Jodhpur', state: 'Rajasthan', deliveryStatus: 'Delivery' },
  { pincode: '313001', officeName: 'Udaipur Shastri Circle HO', officeType: 'HO', district: 'Udaipur', state: 'Rajasthan', deliveryStatus: 'Delivery' },

  // Gujarat
  { pincode: '380001', officeName: 'Ahmedabad GPO', officeType: 'HO', district: 'Ahmedabad', state: 'Gujarat', deliveryStatus: 'Delivery' },
  { pincode: '395003', officeName: 'Surat Head Post Office', officeType: 'HO', district: 'Surat', state: 'Gujarat', deliveryStatus: 'Delivery' },
  { pincode: '390001', officeName: 'Vadodara HO', officeType: 'HO', district: 'Vadodara', state: 'Gujarat', deliveryStatus: 'Delivery' },

  // Madhya Pradesh
  { pincode: '462001', officeName: 'Bhopal GPO', officeType: 'HO', district: 'Bhopal', state: 'Madhya Pradesh', deliveryStatus: 'Delivery' },
  { pincode: '452001', officeName: 'Indore GPO', officeType: 'HO', district: 'Indore', state: 'Madhya Pradesh', deliveryStatus: 'Delivery' },

  // Punjab & Haryana
  { pincode: '160017', officeName: 'Chandigarh Sector 17 GPO', officeType: 'HO', district: 'Chandigarh', state: 'Chandigarh', deliveryStatus: 'Delivery' },
  { pincode: '122001', officeName: 'Gurugram HO', officeType: 'HO', district: 'Gurugram', state: 'Haryana', deliveryStatus: 'Delivery' },
  { pincode: '141001', officeName: 'Ludhiana HO', officeType: 'HO', district: 'Ludhiana', state: 'Punjab', deliveryStatus: 'Delivery' },
  { pincode: '143001', officeName: 'Amritsar GPO', officeType: 'HO', district: 'Amritsar', state: 'Punjab', deliveryStatus: 'Delivery' },

  // Kerala
  { pincode: '695001', officeName: 'Thiruvananthapuram GPO', officeType: 'HO', district: 'Thiruvananthapuram', state: 'Kerala', deliveryStatus: 'Delivery' },
  { pincode: '682001', officeName: 'Kochi Head Office', officeType: 'HO', district: 'Ernakulam', state: 'Kerala', deliveryStatus: 'Delivery' }
];
