const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  athleteId: {
    type: String,
    required: [true, 'Athlete ID is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  totalPoints: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'selector', 'coach', 'athlete'],
    default: 'athlete'
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  fatherName: {
    type: String,
    required: [true, 'Father\'s name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  phone: {
    type: String,
    trim: true
  },
  sport: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true   // adds createdAt and updatedAt
});

// --------------- Hash password before saving ---------------
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --------------- Compare password method ---------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
