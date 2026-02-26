import User from '../models/User.js';

// 🩸 1. The Blood Donor Radar (Existing)
export const getBloodDonors = async (req, res) => {
  try {
    let searchGroup = req.params.bloodGroup.replace(' ', '+');
    const { lat, lng, radius } = req.query; 
    let query = { isDonor: true, bloodGroup: searchGroup };

    if (lat && lng) {
      const maxDistMeters = (parseInt(radius) || 10) * 1000; 
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistMeters
        }
      };
    }
    const donors = await User.find(query).select('name phone bloodGroup');
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby donors" });
  }
};

// 🏥 2. The NEW Clinic Radar!
export const getNearbyClinics = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query; 
    console.log(`\n🏥 [CLINIC RADAR] Scanning for pharmacies...`);

    let query = { role: 'clinic' }; // 🌟 Only look for verified Pharmacies!

    if (lat && lng) {
      const maxDistMeters = (parseInt(radius) || 10) * 1000; 
      console.log(`📍 [CLINIC RADAR] Active: ${radius}km around [${lat}, ${lng}]`);
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistMeters
        }
      };
    }

    // We select the shopId so patients know the exact MedGuard ID to give the pharmacist!
    const clinics = await User.find(query).select('name phone shopId location');
    console.log(`✅ [CLINIC RADAR] Found ${clinics.length} nearby clinics!`);

    res.status(200).json(clinics);
  } catch (error) {
    console.error("Clinic search error:", error);
    res.status(500).json({ error: "Failed to fetch nearby clinics" });
  }
};