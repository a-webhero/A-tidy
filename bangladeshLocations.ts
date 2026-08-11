import { LocationDivision } from '../types';

export const BANGLADESH_LOCATIONS: LocationDivision[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    districts: [
      {
        id: 'dhaka-city',
        name: 'Dhaka City',
        isDhakaCity: true,
        thanas: [
          { id: 'gulshan', name: 'Gulshan' },
          { id: 'banani', name: 'Banani' },
          { id: 'dhanmondi', name: 'Dhanmondi' },
          { id: 'mirpur', name: 'Mirpur' },
          { id: 'uttara', name: 'Uttara' },
          { id: 'mohammadpur', name: 'Mohammadpur' },
          { id: 'motijheel', name: 'Motijheel' },
          { id: 'ramna', name: 'Ramna' },
          { id: 'tejgaon', name: 'Tejgaon' },
          { id: 'badda', name: 'Badda' },
          { id: 'khilgaon', name: 'Khilgaon' },
          { id: 'lalbagh', name: 'Lalbagh' },
          { id: 'bashundhara', name: 'Bashundhara R/A' }
        ]
      },
      {
        id: 'gazipur',
        name: 'Gazipur',
        thanas: [
          { id: 'gazipur-sadar', name: 'Gazipur Sadar' },
          { id: 'kaliakair', name: 'Kaliakair' },
          { id: 'kapasia', name: 'Kapasia' },
          { id: 'sreepur', name: 'Sreepur' },
          { id: 'kaliganj-gazipur', name: 'Kaliganj (Remote)', isRemote: true }
        ]
      },
      {
        id: 'narayanganj',
        name: 'Narayanganj',
        thanas: [
          { id: 'narayanganj-sadar', name: 'Narayanganj Sadar' },
          { id: 'siddhirganj', name: 'Siddhirganj' },
          { id: 'fatullah', name: 'Fatullah' },
          { id: 'rupganj', name: 'Rupganj' },
          { id: 'araihazar', name: 'Araihazar (Remote)', isRemote: true }
        ]
      },
      {
        id: 'savardhaka',
        name: 'Dhaka Suburbs (Savar / Dhamrai)',
        thanas: [
          { id: 'savarthana', name: 'Savar Thana' },
          { id: 'dhamrai', name: 'Dhamrai (Remote)', isRemote: true },
          { id: 'keraniganj', name: 'Keraniganj' }
        ]
      },
      {
        id: 'faridpur',
        name: 'Faridpur',
        thanas: [
          { id: 'faridpur-sadar', name: 'Faridpur Sadar' },
          { id: 'bhanga', name: 'Bhanga' },
          { id: 'boalmari', name: 'Boalmari (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'chittagong',
    name: 'Chittagong (Chattogram)',
    districts: [
      {
        id: 'chittagong-city',
        name: 'Chittagong Sadar & Metro',
        thanas: [
          { id: 'kotwali-ctg', name: 'Kotwali' },
          { id: 'panchlaish', name: 'Panchlaish' },
          { id: 'halishahar', name: 'Halishahar' },
          { id: 'agrabad', name: 'Agrabad' },
          { id: 'khulshi', name: 'Khulshi' },
          { id: 'hathazari', name: 'Hathazari' }
        ]
      },
      {
        id: 'coxsbazar',
        name: "Cox's Bazar",
        thanas: [
          { id: 'coxsbazar-sadar', name: "Cox's Bazar Sadar" },
          { id: 'ramu', name: 'Ramu' },
          { id: 'teknaf', name: 'Teknaf (Remote)', isRemote: true },
          { id: 'ukhiya', name: 'Ukhiya (Remote)', isRemote: true }
        ]
      },
      {
        id: 'comilla',
        name: 'Cumilla',
        thanas: [
          { id: 'comilla-sadar', name: 'Cumilla Sadar' },
          { id: 'daudkandi', name: 'Daudkandi' },
          { id: 'laksham', name: 'Laksham (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    districts: [
      {
        id: 'sylhet-sadar-dist',
        name: 'Sylhet',
        thanas: [
          { id: 'sylhet-sadar', name: 'Sylhet Sadar' },
          { id: 'zindabazar', name: 'Zindabazar' },
          { id: 'amberkhana', name: 'Amberkhana' },
          { id: 'jaflong', name: 'Gowainghat/Jaflong (Remote)', isRemote: true }
        ]
      },
      {
        id: 'moulvibazar',
        name: 'Moulvibazar',
        thanas: [
          { id: 'moulvibazar-sadar', name: 'Moulvibazar Sadar' },
          { id: 'sreemangal', name: 'Sreemangal' },
          { id: 'kulaura', name: 'Kulaura (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    districts: [
      {
        id: 'rajshahi-city',
        name: 'Rajshahi',
        thanas: [
          { id: 'boalia', name: 'Boalia' },
          { id: 'motihar', name: 'Motihar' },
          { id: 'godagari', name: 'Godagari (Remote)', isRemote: true }
        ]
      },
      {
        id: 'bogra',
        name: 'Bogra (Bogura)',
        thanas: [
          { id: 'bogra-sadar', name: 'Bogra Sadar' },
          { id: 'sherpur-bogra', name: 'Sherpur' },
          { id: 'shibganj', name: 'Shibganj (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    districts: [
      {
        id: 'khulna-city',
        name: 'Khulna',
        thanas: [
          { id: 'khulna-sadar', name: 'Khulna Sadar' },
          { id: 'sonadanga', name: 'Sonadanga' },
          { id: 'paikgachha', name: 'Paikgachha (Remote)', isRemote: true }
        ]
      },
      {
        id: 'jessore',
        name: 'Jashore',
        thanas: [
          { id: 'jessore-sadar', name: 'Jashore Sadar' },
          { id: 'benapole', name: 'Benapole Port' }
        ]
      }
    ]
  },
  {
    id: 'barisal',
    name: 'Barishal',
    districts: [
      {
        id: 'barisal-sadar-dist',
        name: 'Barishal',
        thanas: [
          { id: 'barisal-sadar', name: 'Barishal Sadar' },
          { id: 'kuakata', name: 'Kalapara/Kuakata (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    districts: [
      {
        id: 'rangpur-sadar-dist',
        name: 'Rangpur',
        thanas: [
          { id: 'rangpur-sadar', name: 'Rangpur Sadar' },
          { id: 'pirganj', name: 'Pirganj (Remote)', isRemote: true }
        ]
      }
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    districts: [
      {
        id: 'mymensingh-sadar-dist',
        name: 'Mymensingh',
        thanas: [
          { id: 'mymensingh-sadar', name: 'Mymensingh Sadar' },
          { id: 'bhaluka', name: 'Bhaluka' }
        ]
      }
    ]
  }
];

export function calculateDeliveryFee(
  districtId: string,
  thanaId: string
): { fee: number; zone: 'Dhaka City' | 'Outside Dhaka' | 'Remote Area'; desc: string } {
  // Check if Dhaka City
  if (districtId === 'dhaka-city') {
    return {
      fee: 60,
      zone: 'Dhaka City',
      desc: 'Inside Dhaka City standard express delivery (৳60)'
    };
  }

  // Find location details
  let isThanaRemote = false;
  for (const div of BANGLADESH_LOCATIONS) {
    for (const dist of div.districts) {
      if (dist.id === districtId) {
        const foundThana = dist.thanas.find((t) => t.id === thanaId);
        if (foundThana?.isRemote) {
          isThanaRemote = true;
        }
      }
    }
  }

  if (isThanaRemote) {
    return {
      fee: 150,
      zone: 'Remote Area',
      desc: 'Sub-area / Remote Thana express delivery (৳150)'
    };
  }

  return {
    fee: 120,
    zone: 'Outside Dhaka',
    desc: 'Outside Dhaka District level delivery (৳120)'
  };
}
