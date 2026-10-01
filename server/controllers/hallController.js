const Hall = require("../model/hallSchema");


const createHall = async (req, res, next) => {
  try {
    const {
      name,
      location,
      capacity,
      amenities,
      description,
    } = req.body;


    if (
      !name ||
      !location ||
      !capacity ||
      !amenities ||
      !description
    ) {
      return res.status(422).json({
        error: "Please fill all details.",
      });
    }


    if (Number(capacity) <= 0) {
      return res.status(422).json({
        error: "Capacity must be greater than zero.",
      });
    }


    // IMPORTANT:
    // Owner is taken from authenticated user.
    // Never trust hallCreater from frontend.
    const hall = new Hall({
      name: name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      amenities: amenities.trim(),
      description: description.trim(),
      hallCreater: req.rootUser.email,
    });


    await hall.save();


    return res.status(201).json({
      message: "Property listing created successfully.",
      hall,
    });

  } catch (error) {
    next(error);
  }
};



const getHalls = async (req, res, next) => {
  try {
    const {
      search,
      minCapacity,
      maxCapacity,
    } = req.query;


    const filter = {};


    if (search && search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          location: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }


    if (minCapacity || maxCapacity) {
      filter.capacity = {};

      if (minCapacity) {
        filter.capacity.$gte = Number(minCapacity);
      }

      if (maxCapacity) {
        filter.capacity.$lte = Number(maxCapacity);
      }
    }


    const halls = await Hall.find(filter)
      .sort({ _id: -1 });


    return res.status(200).json({
      halls,
    });

  } catch (error) {
    next(error);
  }
};



const getHallById = async (req, res, next) => {
  try {
    const { hallId } = req.params;

    const hall = await Hall.findById(hallId);


    if (!hall) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }


    return res.status(200).json({
      hall,
    });

  } catch (error) {
    next(error);
  }
};



const updateHall = async (req, res, next) => {
  try {
    const { hallId } = req.params;

    const {
      name,
      location,
      capacity,
      amenities,
      description,
    } = req.body;


    const hall = await Hall.findById(hallId);


    if (!hall) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }


    const isOwner =
      hall.hallCreater === req.rootUser.email;

    const isAdmin =
      req.rootUser.userType === "admin";


    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You can only modify your own property listings.",
      });
    }


    if (
      !name ||
      !location ||
      !capacity ||
      !amenities ||
      !description
    ) {
      return res.status(422).json({
        error: "Please fill all details.",
      });
    }


    if (Number(capacity) <= 0) {
      return res.status(422).json({
        error: "Capacity must be greater than zero.",
      });
    }


    const updatedHall = await Hall.findByIdAndUpdate(
      hallId,
      {
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        amenities: amenities.trim(),
        description: description.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );


    return res.status(200).json({
      message: "Property updated successfully.",
      hall: updatedHall,
    });

  } catch (error) {
    next(error);
  }
};



const deleteHall = async (req, res, next) => {
  try {
    const { hallId } = req.params;


    const hall = await Hall.findById(hallId);


    if (!hall) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }


    const isOwner =
      hall.hallCreater === req.rootUser.email;

    const isAdmin =
      req.rootUser.userType === "admin";


    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You can only delete your own property listings.",
      });
    }


    await Hall.findByIdAndDelete(hallId);


    return res.status(200).json({
      message: "Property deleted successfully.",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
};