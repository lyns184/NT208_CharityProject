const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  avatar: { type: String },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'], default: 'UNKNOWN' },
  dob: { type: Date },
  phone: { type: String },
  bio: { type: String, maxlength: 255 },
  address: { type: String },
  socialLinks: { facebook: String, youtube: String, tiktok: String },
  accountType: { type: String, enum: ['INDIVIDUAL', 'ORGANIZATION'], default: 'INDIVIDUAL' },
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  rejectionReason: { type: String },
  idCardFront: String,
  idCardBack: String,
  portrait: String,
  businessLicense: String,
  authLetter: String,
  repIdCard: String,
  tokenBlacklist: [{ type: String }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
});

// Compare password method
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Generate tokens
userSchema.methods.generateTokens = function() {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET;
  const accessToken = jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: this._id },
    refreshTokenSecret,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Convert to JSON (remove sensitive fields)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokenBlacklist;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
