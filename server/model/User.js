import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 320,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
      match: [/^\+?[0-9\s\-()]*$/, 'Please use a valid phone number.'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
        'Password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, one digit, and one special character',
      ],
    },
    bannerPic: {
      type: String,
      default: null,
    },
    bannerPublicId: {
      type: String,
      default: 'null',
    },
    profilePic: {
      type: String,
      default: null,
    },
    profilePublicId: {
      type: String,
      default: 'null',
    },
    address: {
      street: {
        type: String,
        required: true,
        maxlength: 150,
      },
      city: {
        type: String,
        required: true,
        maxlength: 100,
      },
      state: {
        type: String,
        required: true,
        maxlength: 50,
      },
      postalCode: {
        type: String,
        required: false,
        maxlength: 20,
        match: [/^[A-Za-z0-9\s\-]{3,10}$/, 'Please use a valid postal code.'],
      },
      country: {
        type: String,
        required: true,
        maxlength: 50,
      },
    },

    refreshToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparepassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;
};

const User = mongoose.model('User', userSchema);

export default User;
