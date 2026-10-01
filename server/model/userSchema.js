const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // UrbanNest roles:
    // buyer | seller | admin
    userType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    institution: {
      type: String,
      default: "N/A",
    },

    department: {
      type: String,
      default: "N/A",
    },

    adminKey: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      required: true,
    },

    // UrbanNest buyer favorites
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],

    date: {
      type: Date,
      default: Date.now,
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],

    verifyToken: {
      type: String,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Password hashing
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Generate JWT
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, {
    expiresIn: "2d",
  });

  this.tokens = this.tokens.concat({ token });

  await this.save();

  return token;
};

// Never expose sensitive fields to frontend
userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.tokens;
  delete user.verifyToken;
  delete user.adminKey;

  return user;
};

const User = mongoose.model("USER", userSchema);

module.exports = User;
