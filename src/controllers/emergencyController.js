import emergency from '../models/emergency.js';
import clinic from '../models/clinic.js';
import ErrorResponse from '../utils/errorResponse.js';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// @desc    Trigger emergency alert
// @route   POST /api/v1/emergency
// @access  Private
export const triggerEmergency = async (req, res, next) => {
  try {
    const { coordinates, emergencyType, additionalInfo } = req.body;
    
    // 1. Create emergency record
    const emergency = await emergency.create({
      user: req.user.id,
      location: {
        type: 'Point',
        coordinates
      },
      emergencyType,
      additionalInfo
    });

    // 2. Find nearest clinics (within 5km)
    const clinics = await clinic.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates
          },
          $maxDistance: 5000
        }
      },
      services: { $in: ['Emergency'] }
    }).limit(3);

    // 3. Notify clinics via SMS and save responders
    const responderUpdates = clinics.map(clinic => {
      // Send SMS via Twilio
      twilioClient.messages.create({
        body: `🚨 EMERGENCY ALERT! Type: ${emergencyType}\nLocation: ${coordinates}\nAdditional Info: ${additionalInfo || 'None'}`,
        from: process.env.TWILIO_PHONE,
        to: clinic.phone
      });

      return {
        clinic: clinic._id,
        status: 'notified'
      };
    });

    emergency.responders = responderUpdates;
    await emergency.save();

    // 4. Notify emergency contacts (if any)
    if (req.user.emergencyContacts?.length > 0) {
      req.user.emergencyContacts.forEach(contact => {
        twilioClient.calls.create({
          url: 'https://your-server.com/emergency-voice.xml', // TwiML for voice message
          to: contact.phone,
          from: process.env.TWILIO_PHONE
        });
      });
    }

    res.status(201).json({
      success: true,
      data: emergency
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update emergency status
// @route   PUT /api/v1/emergency/:id
// @access  Private/Admin/Clinic
export const updateEmergency = async (req, res, next) => {
  try {
    const { status, clinicId } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return next(new ErrorResponse('Emergency not found', 404));
    }

    // Update clinic responder status
    if (clinicId) {
      const responder = emergency.responders.find(r => r.clinic.equals(clinicId));
      if (responder) responder.status = status;
    } else {
      emergency.status = status;
      if (status === 'completed') emergency.resolvedAt = new Date();
    }

    await emergency.save();

    res.status(200).json({
      success: true,
      data: emergency
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get emergency history
// @route   GET /api/v1/emergency
// @access  Private
export const getEmergencies = async (req, res, next) => {
  try {
    let query = { user: req.user.id };
    
    // Admin/clinics can see all emergencies
    if (req.user.role !== 'user') {
      query = {};
      if (req.user.role === 'clinic') {
        query['responders.clinic'] = req.user.clinic;
      }
    }

    const emergencies = await Emergency.find(query)
      .sort('-createdAt')
      .populate('user', 'name phone')
      .populate('responders.clinic', 'name phone');

    res.status(200).json({
      success: true,
      data: emergencies
    });
  } catch (err) {
    next(err);
  }
};