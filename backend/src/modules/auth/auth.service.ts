import bcrypt from "bcryptjs";
import crypto from "crypto";
import { BrandModel, type BrandDocument } from "../../models/Brand.model";
import { CreatorModel, type CreatorDocument } from "../../models/Creator.model";
import { redisClient } from "../../config/redis";
import { publishEvent } from "../../config/rabbitmq";
import { ApiError } from "../../utils/ApiError";
import { sendOtpEmail } from "../../utils/mailer";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import type { JwtPayload, SafeBrand, SafeCreator, SafeUser, UserRole } from "../../types";
import {
  generateOtp,
  hasOtp,
  hasOtpCooldown,
  isOtpLocked,
  setOtpCooldown,
  storeOtp,
  trackAttempts,
  verifyOtp,
} from "./otp.service";
import type {
  BrandRegisterInput,
  CreatorRegisterInput,
  LoginInput,
  ResendOtpInput,
  VerifyOtpInput,
} from "./auth.validator";

const BCRYPT_SALT_ROUNDS = 12;

type AuthDocument = BrandDocument | CreatorDocument;

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const toIso = (value: Date | undefined): string | undefined => {
  return value ? value.toISOString() : undefined;
};

const toSafeUser = (user: AuthDocument): SafeUser => {
  const base = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    city: user.city,
    isEmailVerified: user.isEmailVerified,
    createdAt: toIso(user.createdAt),
    updatedAt: toIso(user.updatedAt),
  };

  if (user.role === "brand") {
    const safeBrand: SafeBrand = {
      ...base,
      role: "brand",
      brandName: user.brandName,
      brandType: user.brandType,
      instagramHandle: user.instagramHandle,
    };
    return safeBrand;
  }

  const safeCreator: SafeCreator = {
    ...base,
    role: "creator",
    instagramHandle: user.instagramHandle,
    instagramFollowers: user.instagramFollowers,
    niche: user.niche,
  };
  return safeCreator;
};

const emailExistsAcrossRoles = async (email: string): Promise<boolean> => {
  const [brand, creator] = await Promise.all([
    BrandModel.exists({ email }),
    CreatorModel.exists({ email }),
  ]);

  return Boolean(brand || creator);
};

const sendRegistrationOtp = async (
  role: UserRole,
  email: string,
): Promise<void> => {
  const otp = generateOtp();
  await storeOtp(role, email, otp);
  await sendOtpEmail(email, otp);
};

const findUserByEmail = async (
  role: UserRole,
  email: string,
): Promise<AuthDocument | null> => {
  if (role === "brand") {
    return BrandModel.findOne({ email });
  }

  return CreatorModel.findOne({ email });
};

const findUserByEmailWithSecrets = async (
  role: UserRole,
  email: string,
): Promise<AuthDocument | null> => {
  if (role === "brand") {
    return (await BrandModel.findOne({ email })
      .select("+passwordHash +refreshToken")
      .exec()) as BrandDocument | null;
  }

  return (await CreatorModel.findOne({ email })
    .select("+passwordHash +refreshToken")
    .exec()) as CreatorDocument | null;
};

const findUserByIdWithRefreshToken = async (
  role: UserRole,
  userId: string,
): Promise<AuthDocument | null> => {
  if (role === "brand") {
    return (await BrandModel.findById(userId)
      .select("+refreshToken")
      .exec()) as BrandDocument | null;
  }

  return (await CreatorModel.findById(userId)
    .select("+refreshToken")
    .exec()) as CreatorDocument | null;
};

const setStoredRefreshToken = async (
  user: AuthDocument,
  refreshToken: string,
): Promise<void> => {
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();
};

const issueTokenPair = async (user: AuthDocument): Promise<AuthResult> => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await setStoredRefreshToken(user, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: toSafeUser(user),
  };
};

export const registerBrand = async (
  input: BrandRegisterInput,
): Promise<void> => {
  const existingBrand = await findUserByEmail("brand", input.email);

  if (existingBrand) {
    if (existingBrand.isEmailVerified) {
      throw new ApiError(409, "Email already registered");
    }

    await sendRegistrationOtp("brand", existingBrand.email);
    return;
  }

  if (await emailExistsAcrossRoles(input.email)) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
  const brand = await BrandModel.create({
    role: "brand",
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    city: input.city,
    brandName: input.brandName,
    brandType: input.brandType,
    instagramHandle: input.instagramHandle,
    isEmailVerified: false,
  });

  await sendRegistrationOtp("brand", brand.email);
  publishEvent("user.registered", {
    role: "brand",
    email: brand.email,
    name: brand.fullName,
    brandName: brand.brandName,
  });
};

export const registerCreator = async (
  input: CreatorRegisterInput,
): Promise<void> => {
  const existingCreator = await findUserByEmail("creator", input.email);

  if (existingCreator) {
    if (existingCreator.isEmailVerified) {
      throw new ApiError(409, "Email already registered");
    }

    await sendRegistrationOtp("creator", existingCreator.email);
    return;
  }

  if (await emailExistsAcrossRoles(input.email)) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
  const creator = await CreatorModel.create({
    role: "creator",
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    city: input.city,
    instagramHandle: input.instagramHandle,
    instagramFollowers: input.instagramFollowers,
    niche: input.niche,
    isEmailVerified: false,
  });

  await sendRegistrationOtp("creator", creator.email);
  publishEvent("user.registered", {
    role: "creator",
    email: creator.email,
    name: creator.fullName,
  });
};

export const verifyEmailOtp = async (
  input: VerifyOtpInput,
): Promise<AuthResult> => {
  const user = await findUserByEmail(input.role, input.email);

  if (!user) {
    throw new ApiError(400, "OTP expired or invalid");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  if (await isOtpLocked(input.role, input.email)) {
    throw new ApiError(400, "OTP expired or invalid");
  }

  if (!(await hasOtp(input.role, input.email))) {
    throw new ApiError(400, "OTP expired or invalid");
  }

  const isValidOtp = await verifyOtp(input.role, input.email, input.otp);

  if (!isValidOtp) {
    const attempts = await trackAttempts(input.role, input.email);

    if (attempts >= 3) {
      throw new ApiError(400, "OTP expired or invalid");
    }

    throw new ApiError(400, "Invalid OTP");
  }

  user.isEmailVerified = true;
  await user.save();

  return issueTokenPair(user);
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await findUserByEmailWithSecrets(input.role, input.email);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Email not verified");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  return issueTokenPair(user);
};

export const refresh = async (refreshToken: string): Promise<RefreshResult> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await findUserByIdWithRefreshToken(payload.role, payload.userId);

  if (!user || user.email !== payload.email) {
    throw new ApiError(401, "Unauthorized");
  }

  // [HIGH] Token family invalidation: if the stored hash doesn't match, a stolen token
  // may be in use. Clear the stored token so the legitimate session is also forced to re-login.
  if (!user.refreshToken || hashRefreshToken(refreshToken) !== user.refreshToken) {
    if (user.refreshToken) {
      user.refreshToken = null;
      await user.save();
    }
    throw new ApiError(401, "Unauthorized");
  }

  const nextPayload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  const accessToken = signAccessToken(nextPayload);
  const nextRefreshToken = signRefreshToken(nextPayload);
  await setStoredRefreshToken(user, nextRefreshToken);

  return {
    accessToken,
    refreshToken: nextRefreshToken,
  };
};

export const logout = async (payload: JwtPayload): Promise<void> => {
  const update = { refreshToken: null };
  const user =
    payload.role === "brand"
      ? await BrandModel.findByIdAndUpdate(payload.userId, update)
      : await CreatorModel.findByIdAndUpdate(payload.userId, update);

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  // [HIGH] Blacklist the access token by jti so it cannot be reused within its remaining TTL.
  if (payload.jti) {
    const ttl = payload.exp
      ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
      : 900; // fallback: access token max lifetime (15 min)
    await redisClient.set(`blacklist:at:${payload.jti}`, "1", "EX", ttl);
  }
};

export const resendOtp = async (input: ResendOtpInput): Promise<void> => {
  const user = await findUserByEmail(input.role, input.email);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }

  if (await hasOtpCooldown(input.role, input.email)) {
    throw new ApiError(429, "Please wait before requesting another OTP");
  }

  const otp = generateOtp();
  await storeOtp(input.role, input.email, otp);
  await setOtpCooldown(input.role, input.email);
  await sendOtpEmail(input.email, otp);
};
