const OBJECT_ID = { type: "string", pattern: "^[a-f\\d]{24}$", example: "64b1f2c3d4e5f6a7b8c9d0e1" };
const ISO_DATE = { type: "string", format: "date-time", example: "2025-01-15T10:30:00.000Z" };
const NULLABLE_DATE = { oneOf: [{ type: "string", format: "date-time" }, { type: "null" }] };
const NULLABLE_STRING = { oneOf: [{ type: "string" }, { type: "null" }] };

const pagination = {
  type: "object",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 20 },
    total: { type: "integer", example: 42 },
    totalPages: { type: "integer", example: 3 },
    hasNext: { type: "boolean" },
    hasPrev: { type: "boolean" },
  },
};

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "CreatorLane API",
    version: "1.0.0",
    description:
      "REST API for CreatorLane — an Indian influencer-marketing platform. Brands post campaigns; creators bid and collaborate.\n\n" +
      "**Authentication:** Most endpoints require a JWT access token via `Authorization: Bearer <token>`. Obtain the token from the `/auth/login` response.\n\n" +
      "**Roles:** Endpoints are guarded by role (`brand` or `creator`). The role is embedded in the JWT and cannot be changed after registration.",
    contact: { name: "CreatorLane Team", email: "pronit556@gmail.com" },
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "15-minute access token returned by /auth/login or /auth/refresh",
      },
    },
    schemas: {
      // ── Common ─────────────────────────────────────────────────────────────
      Pagination: pagination,

      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials" },
          code: { type: "string", example: "AUTH_ERROR", nullable: true },
          errors: { type: "array", items: { type: "object" }, nullable: true },
        },
      },

      // ── Auth ───────────────────────────────────────────────────────────────
      SafeBrand: {
        type: "object",
        properties: {
          id: OBJECT_ID,
          role: { type: "string", enum: ["brand"] },
          fullName: { type: "string", example: "Riya Kapoor" },
          email: { type: "string", format: "email", example: "riya@brandco.in" },
          city: { type: "string", example: "Mumbai" },
          isEmailVerified: { type: "boolean" },
          authProvider: { type: "string", enum: ["email", "google", "both"] },
          brandName: { type: "string", example: "BrandCo" },
          brandType: { type: "string", example: "Fashion" },
          instagramHandle: { type: "string", example: "@brandco", nullable: true },
          profilePhotoUrl: { type: "string", nullable: true },
          googleConnected: { type: "boolean" },
          isProfileComplete: { type: "boolean" },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      SafeCreator: {
        type: "object",
        properties: {
          id: OBJECT_ID,
          role: { type: "string", enum: ["creator"] },
          fullName: { type: "string", example: "Arjun Mehta" },
          email: { type: "string", format: "email", example: "arjun@creator.in" },
          city: { type: "string", example: "Delhi" },
          isEmailVerified: { type: "boolean" },
          authProvider: { type: "string", enum: ["email", "instagram", "both"] },
          instagramHandle: { type: "string", example: "@arjun_creates" },
          instagramFollowers: { type: "integer", example: 25000 },
          niche: { type: "array", items: { type: "string" }, example: ["fashion", "lifestyle"] },
          instagramProfilePicUrl: { type: "string", nullable: true },
          instagramConnected: { type: "boolean" },
          instagramVerified: { type: "boolean" },
          instagramDataLastRefreshedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      AuthResult: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: {
            oneOf: [
              { $ref: "#/components/schemas/SafeBrand" },
              { $ref: "#/components/schemas/SafeCreator" },
            ],
          },
        },
      },

      // ── Campaign ──────────────────────────────────────────────────────────
      GeoPoint: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["Point"] },
          coordinates: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            description: "[longitude, latitude]",
            example: [72.8777, 19.076],
          },
        },
        required: ["type", "coordinates"],
      },

      ShootingLocation: {
        type: "object",
        properties: {
          geo: { $ref: "#/components/schemas/GeoPoint" },
          radiusKm: { type: "integer", minimum: 0, maximum: 500, example: 10 },
        },
        required: ["geo"],
      },

      InstagramRequirements: {
        type: "object",
        properties: {
          minFollowers: { type: "integer", minimum: 0, example: 5000 },
          maxFollowers: { type: "integer", minimum: 0, example: 500000 },
          minAvgReelViews: { type: "integer", minimum: 0 },
          minAvgPostLikes: { type: "integer", minimum: 0 },
          minEngagementRate: { type: "number", minimum: 0, maximum: 100, example: 3.5 },
          minPostsPerMonth: { type: "integer", minimum: 0 },
        },
      },

      YouTubeRequirements: {
        type: "object",
        properties: {
          minSubscribers: { type: "integer", minimum: 0 },
          maxSubscribers: { type: "integer", minimum: 0 },
          minAvgVideoViews: { type: "integer", minimum: 0 },
          minAvgLikes: { type: "integer", minimum: 0 },
          minVideosPerMonth: { type: "integer", minimum: 0 },
        },
      },

      CreatorRequirements: {
        type: "object",
        properties: {
          instagram: { $ref: "#/components/schemas/InstagramRequirements" },
          youtube: { $ref: "#/components/schemas/YouTubeRequirements" },
          minAge: { type: "integer", minimum: 13, maximum: 65 },
          maxAge: { type: "integer", minimum: 13, maximum: 65 },
          gender: { type: "string", enum: ["male", "female", "any"] },
          languages: { type: "array", items: { type: "string" }, example: ["Hindi", "English"] },
        },
      },

      Campaign: {
        type: "object",
        properties: {
          _id: OBJECT_ID,
          brandId: OBJECT_ID,
          title: { type: "string", example: "Summer Fashion Collab" },
          slug: { type: "string", example: "summer-fashion-collab-abc123" },
          platform: { type: "string", enum: ["instagram", "youtube", "both"] },
          niche: { type: "array", items: { type: "string" }, example: ["fashion", "lifestyle"] },
          targetLocation: { type: "string", example: "Mumbai" },
          targetAgeMin: { type: "integer", example: 18 },
          targetAgeMax: { type: "integer", example: 35 },
          targetGender: { type: "string", enum: ["male", "female", "any"] },
          budgetAmount: { type: "integer", description: "In INR", example: 15000 },
          deadline: { ...ISO_DATE },
          contentBrief: { type: "string", example: "Create a 30-second Instagram reel showcasing our summer collection..." },
          revisionRounds: { type: "integer", enum: [1, 2] },
          deliveryType: { type: "string", enum: ["onsite", "remote"] },
          shootingLocation: { $ref: "#/components/schemas/ShootingLocation" },
          creatorRequirements: { $ref: "#/components/schemas/CreatorRequirements" },
          status: { type: "string", enum: ["draft", "active", "closed", "in_progress", "completed"] },
          publishedAt: { ...NULLABLE_DATE },
          closedAt: { ...NULLABLE_DATE },
          totalBids: { type: "integer", example: 12 },
          viewCount: { type: "integer", example: 340 },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      CampaignWithMatchScore: {
        allOf: [
          { $ref: "#/components/schemas/Campaign" },
          {
            type: "object",
            properties: {
              matchScore: { type: "number", minimum: 0, maximum: 100, example: 78.5 },
            },
          },
        ],
      },

      PublicCampaignPreview: {
        type: "object",
        properties: {
          id: OBJECT_ID,
          title: { type: "string", example: "Summer Fashion Collab" },
          platform: { type: "string", enum: ["instagram", "youtube", "both"] },
          niche: { type: "array", items: { type: "string" }, example: ["fashion", "lifestyle"] },
          budgetAmount: { type: "integer", example: 15000 },
          deadline: { ...ISO_DATE },
          brandName: { type: "string", example: "BrandCo" },
        },
      },

      CreateCampaignBody: {
        type: "object",
        required: [
          "title", "platform", "niche", "targetLocation",
          "targetAgeMin", "targetAgeMax", "targetGender",
          "budgetAmount", "deadline", "contentBrief", "revisionRounds", "deliveryType",
        ],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100, example: "Summer Fashion Collab" },
          platform: { type: "string", enum: ["instagram", "youtube", "both"] },
          niche: {
            type: "array",
            items: { type: "string", maxLength: 30 },
            minItems: 1,
            maxItems: 5,
            example: ["fashion", "lifestyle"],
          },
          targetLocation: { type: "string", minLength: 2, maxLength: 100, example: "Mumbai" },
          targetAgeMin: { type: "integer", minimum: 13, maximum: 65, example: 18 },
          targetAgeMax: { type: "integer", minimum: 13, maximum: 65, example: 35 },
          targetGender: { type: "string", enum: ["male", "female", "any"] },
          budgetAmount: { type: "integer", minimum: 500, maximum: 10000000, example: 15000 },
          deadline: { type: "string", format: "date-time", description: "Must be at least 3 days from now" },
          contentBrief: { type: "string", minLength: 50, maxLength: 2000 },
          revisionRounds: { type: "integer", enum: [1, 2] },
          deliveryType: { type: "string", enum: ["onsite", "remote"] },
          shootingLocation: { $ref: "#/components/schemas/ShootingLocation" },
          creatorRequirements: { $ref: "#/components/schemas/CreatorRequirements" },
        },
      },

      // ── Bid ───────────────────────────────────────────────────────────────
      BidCreatorProfile: {
        type: "object",
        properties: {
          id: OBJECT_ID,
          fullName: { type: "string", example: "Arjun Mehta" },
          instagramHandle: { type: "string", example: "@arjun_creates" },
          instagramFollowers: { type: "integer", example: 25000 },
          niche: { type: "array", items: { type: "string" }, example: ["fashion"] },
          city: { type: "string", example: "Delhi" },
          instagramProfilePicUrl: { type: "string", nullable: true },
          matchScore: { type: "number", nullable: true, example: 78.5 },
        },
      },

      BidWithCreator: {
        type: "object",
        description: "Bid as seen by a brand — includes creator profile snapshot",
        properties: {
          _id: OBJECT_ID,
          campaignId: OBJECT_ID,
          brandId: OBJECT_ID,
          proposedAmount: { type: "integer", description: "In INR", example: 12000 },
          pitch: { type: "string", example: "I have a highly engaged fashion audience in Delhi..." },
          attachmentUrl: { ...NULLABLE_STRING },
          proposedTimeline: { type: "integer", description: "Days to deliver", example: 10 },
          status: { type: "string", enum: ["submitted", "shortlisted", "accepted", "declined", "withdrawn"] },
          declineReason: { ...NULLABLE_STRING },
          autoDeclined: { type: "boolean" },
          shortlistedAt: { ...NULLABLE_DATE },
          acceptedAt: { ...NULLABLE_DATE },
          declinedAt: { ...NULLABLE_DATE },
          campaignBudgetAtBid: { type: "integer", example: 15000 },
          campaignDeadlineAtBid: { ...ISO_DATE },
          campaignTitleAtBid: { type: "string", example: "Summer Fashion Collab" },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
          creator: { $ref: "#/components/schemas/BidCreatorProfile" },
        },
      },

      BidWithCampaign: {
        type: "object",
        description: "Bid as seen by a creator — includes campaign context",
        properties: {
          _id: OBJECT_ID,
          campaignId: OBJECT_ID,
          brandId: OBJECT_ID,
          proposedAmount: { type: "integer", example: 12000 },
          pitch: { type: "string" },
          attachmentUrl: { ...NULLABLE_STRING },
          proposedTimeline: { type: "integer", example: 10 },
          status: { type: "string", enum: ["submitted", "shortlisted", "accepted", "declined", "withdrawn"] },
          declineReason: { ...NULLABLE_STRING },
          withdrawReason: { ...NULLABLE_STRING },
          autoDeclined: { type: "boolean" },
          shortlistedAt: { ...NULLABLE_DATE },
          acceptedAt: { ...NULLABLE_DATE },
          declinedAt: { ...NULLABLE_DATE },
          withdrawnAt: { ...NULLABLE_DATE },
          campaignBudgetAtBid: { type: "integer" },
          campaignDeadlineAtBid: { ...ISO_DATE },
          campaignTitleAtBid: { type: "string" },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
          campaignTitle: { type: "string", example: "Summer Fashion Collab" },
          campaignPlatform: { type: "string", example: "instagram" },
          brandName: { type: "string", example: "BrandCo" },
        },
      },

      AcceptBidResult: {
        type: "object",
        properties: {
          acceptedBid: {
            type: "object",
            properties: {
              _id: OBJECT_ID,
              campaignId: OBJECT_ID,
              creatorId: OBJECT_ID,
              brandId: OBJECT_ID,
              proposedAmount: { type: "integer" },
              proposedTimeline: { type: "integer" },
              status: { type: "string", enum: ["accepted"] },
              acceptedAt: { ...NULLABLE_DATE },
            },
          },
          declinedCount: { type: "integer", description: "Other bids auto-declined", example: 3 },
          campaignStatus: { type: "string", enum: ["in_progress"] },
        },
      },

      SubmitBidBody: {
        type: "object",
        required: ["campaignId", "proposedAmount", "pitch", "proposedTimeline"],
        properties: {
          campaignId: { ...OBJECT_ID },
          proposedAmount: { type: "integer", minimum: 1, maximum: 10000000, example: 12000 },
          pitch: { type: "string", minLength: 100, maxLength: 1000 },
          attachmentUrl: { type: "string", maxLength: 500, nullable: true },
          proposedTimeline: { type: "integer", minimum: 3, maximum: 60, example: 10 },
        },
      },

      // ── Escrow ────────────────────────────────────────────────────────────
      EscrowBrandView: {
        type: "object",
        description: "Escrow details as seen by a brand",
        properties: {
          _id: OBJECT_ID,
          bidId: OBJECT_ID,
          campaignId: OBJECT_ID,
          brandId: OBJECT_ID,
          creatorId: OBJECT_ID,
          agreedAmount: { type: "integer", description: "In paise", example: 1200000 },
          platformFeeAmount: { type: "integer", description: "In paise", example: 120000 },
          totalChargedAmount: { type: "integer", description: "In paise", example: 1320000 },
          creatorReceivableAmount: { type: "integer", description: "In paise", example: 1080000 },
          razorpayOrderId: { type: "string", example: "order_QbXY9Z1234" },
          razorpayPaymentId: { ...NULLABLE_STRING },
          razorpayRefundId: { ...NULLABLE_STRING },
          status: {
            type: "string",
            enum: ["awaiting_payment", "funded", "released", "refunded", "cancelled", "disputed"],
          },
          paymentInitiatedAt: { ...ISO_DATE },
          paymentCapturedAt: { ...NULLABLE_DATE },
          fundedAt: { ...NULLABLE_DATE },
          releasedAt: { ...NULLABLE_DATE },
          refundedAt: { ...NULLABLE_DATE },
          cancelledAt: { ...NULLABLE_DATE },
          paymentDeadline: { ...ISO_DATE },
          collabDeadline: { ...ISO_DATE },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      EscrowCreatorView: {
        type: "object",
        description: "Escrow details as seen by a creator (no financial internals)",
        properties: {
          _id: OBJECT_ID,
          bidId: OBJECT_ID,
          campaignId: OBJECT_ID,
          brandId: OBJECT_ID,
          creatorId: OBJECT_ID,
          agreedAmount: { type: "integer", description: "In paise" },
          creatorReceivableAmount: { type: "integer", description: "In paise" },
          status: {
            type: "string",
            enum: ["awaiting_payment", "funded", "released", "refunded", "cancelled", "disputed"],
          },
          fundedAt: { ...NULLABLE_DATE },
          releasedAt: { ...NULLABLE_DATE },
          refundedAt: { ...NULLABLE_DATE },
          cancelledAt: { ...NULLABLE_DATE },
          paymentDeadline: { ...ISO_DATE },
          collabDeadline: { ...ISO_DATE },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      // ── Collab ────────────────────────────────────────────────────────────
      CollabRoomView: {
        type: "object",
        properties: {
          _id: OBJECT_ID,
          escrowId: OBJECT_ID,
          bidId: OBJECT_ID,
          campaignId: OBJECT_ID,
          brandId: OBJECT_ID,
          creatorId: OBJECT_ID,
          status: {
            type: "string",
            enum: [
              "pending_chat", "active", "content_submitted",
              "under_review", "revision_requested", "approved", "completed", "disputed",
            ],
          },
          maxRevisions: { type: "integer", minimum: 1, maximum: 2 },
          revisionCount: { type: "integer", minimum: 0 },
          collabDeadline: { ...ISO_DATE },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },

      // ── Notification ──────────────────────────────────────────────────────
      Notification: {
        type: "object",
        properties: {
          _id: OBJECT_ID,
          recipientId: OBJECT_ID,
          recipientRole: { type: "string", enum: ["brand", "creator"] },
          type: {
            type: "string",
            enum: [
              "bid.submitted", "bid.shortlisted", "bid.declined", "bid.withdrawn", "bid.accepted",
              "escrow.payment_required", "escrow.payment_failed", "escrow.funded", "escrow.cancelled",
              "collab.room_ready",
            ],
          },
          title: { type: "string", example: "Your bid was shortlisted!" },
          body: { type: "string", example: "BrandCo has shortlisted your bid for Summer Fashion Collab." },
          isRead: { type: "boolean" },
          readAt: { ...NULLABLE_DATE },
          meta: { type: "object", additionalProperties: true },
          createdAt: { ...ISO_DATE },
          updatedAt: { ...ISO_DATE },
        },
      },
    },
  },

  tags: [
    { name: "Health", description: "Service health check" },
    { name: "Auth", description: "Registration, OTP verification, login, token refresh, logout" },
    { name: "Campaigns", description: "Brand campaign lifecycle and creator discovery feed" },
    { name: "Bids", description: "Creator bidding and brand bid management" },
    { name: "Notifications", description: "In-app notification inbox" },
    { name: "Escrow", description: "Razorpay-backed payment escrow" },
    { name: "Collab", description: "Active collaboration rooms" },
    { name: "Webhooks", description: "Razorpay webhook receiver (internal, not for frontend)" },
  ],

  paths: {
    // ── Health ─────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Service is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "OK" },
                    data: {
                      type: "object",
                      properties: { service: { type: "string", example: "creatorlane-backend" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ───────────────────────────────────────────────────────────────
    "/api/v1/auth/brand/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a brand account",
        operationId: "registerBrand",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "city", "brandName", "brandType"],
                properties: {
                  fullName: { type: "string", example: "Riya Kapoor" },
                  email: { type: "string", format: "email", example: "riya@brandco.in" },
                  password: {
                    type: "string",
                    minLength: 8,
                    description: "Must contain uppercase, lowercase, number, and special character",
                    example: "MyPass@123",
                  },
                  city: { type: "string", example: "Mumbai" },
                  brandName: { type: "string", example: "BrandCo" },
                  brandType: { type: "string", example: "Fashion" },
                  instagramHandle: { type: "string", example: "@brandco", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Brand registered — OTP sent to email",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Registration successful. Please verify your email." },
                    data: {
                      type: "object",
                      properties: { email: { type: "string", example: "riya@brandco.in" } },
                    },
                  },
                },
              },
            },
          },
          "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "429": { description: "Too many requests", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/creator/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a creator account",
        operationId: "registerCreator",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password", "city", "instagramHandle", "instagramFollowers", "niche"],
                properties: {
                  fullName: { type: "string", example: "Arjun Mehta" },
                  email: { type: "string", format: "email", example: "arjun@creator.in" },
                  password: { type: "string", minLength: 8, example: "MyPass@123" },
                  city: { type: "string", example: "Delhi" },
                  instagramHandle: { type: "string", example: "@arjun_creates" },
                  instagramFollowers: { type: "integer", minimum: 0, example: 25000 },
                  niche: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    example: ["fashion", "lifestyle"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Creator registered — OTP sent to email",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Registration successful. Please verify your email." },
                    data: { type: "object", properties: { email: { type: "string" } } },
                  },
                },
              },
            },
          },
          "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "429": { description: "Too many requests", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with OTP",
        operationId: "verifyOtp",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp", "role"],
                properties: {
                  email: { type: "string", format: "email", example: "arjun@creator.in" },
                  otp: { type: "string", pattern: "^\\d{6}$", example: "482931" },
                  role: { type: "string", enum: ["brand", "creator"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Email verified — tokens issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Email verified successfully" },
                    data: { $ref: "#/components/schemas/AuthResult" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid or expired OTP", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "429": { description: "Too many OTP attempts", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        operationId: "login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "role"],
                properties: {
                  email: { type: "string", format: "email", example: "arjun@creator.in" },
                  password: { type: "string", example: "MyPass@123" },
                  role: { type: "string", enum: ["brand", "creator"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful — refresh token set as httpOnly cookie",
            headers: {
              "Set-Cookie": {
                description: "refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logged in successfully" },
                    data: { $ref: "#/components/schemas/AuthResult" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "429": { description: "Too many requests", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Reads the `refreshToken` httpOnly cookie. Rotates the refresh token on every call.",
        operationId: "refreshToken",
        responses: {
          "200": {
            description: "New access token issued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Token refreshed" },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        user: { $ref: "#/components/schemas/SafeBrand" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Missing, invalid, or expired refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Blacklists the access token and clears the refresh token cookie.",
        operationId: "logout",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logged out successfully" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/auth/resend-otp": {
      post: {
        tags: ["Auth"],
        summary: "Resend OTP",
        operationId: "resendOtp",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "role"],
                properties: {
                  email: { type: "string", format: "email", example: "arjun@creator.in" },
                  role: { type: "string", enum: ["brand", "creator"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OTP resent", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } } },
          "429": { description: "Resend cooldown active", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ── Campaigns ──────────────────────────────────────────────────────────
    "/api/v1/campaigns/public/{slug}": {
      get: {
        tags: ["Campaigns"],
        summary: "Get public campaign preview (no auth)",
        operationId: "getPublicCampaignPreview",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" }, example: "summer-fashion-collab-abc123" },
        ],
        responses: {
          "200": {
            description: "Campaign preview",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/PublicCampaignPreview" },
                  },
                },
              },
            },
          },
          "404": { description: "Campaign not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/browse": {
      get: {
        tags: ["Campaigns"],
        summary: "Browse active campaigns (creator)",
        operationId: "browseCampaigns",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "platform", in: "query", schema: { type: "string", enum: ["instagram", "youtube", "both"] } },
          { name: "niche", in: "query", schema: { type: "string" }, description: "Comma-separated or repeated: niche=fashion&niche=lifestyle" },
          { name: "budgetMin", in: "query", schema: { type: "integer", minimum: 0 } },
          { name: "budgetMax", in: "query", schema: { type: "integer", minimum: 0 } },
          { name: "deliveryType", in: "query", schema: { type: "string", enum: ["onsite", "remote"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated campaigns sorted by match score",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/CampaignWithMatchScore" } },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Creator role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/browse/{slug}": {
      get: {
        tags: ["Campaigns"],
        summary: "Get campaign detail for creator",
        operationId: "getCampaignDetailForCreator",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Full campaign with match score",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/CampaignWithMatchScore" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Creator role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "404": { description: "Campaign not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns": {
      post: {
        tags: ["Campaigns"],
        summary: "Create campaign draft (brand)",
        operationId: "createDraft",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCampaignBody" },
            },
          },
        },
        responses: {
          "201": {
            description: "Draft created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Campaign" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Brand role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
      get: {
        tags: ["Campaigns"],
        summary: "List brand's own campaigns",
        operationId: "getBrandCampaigns",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["draft", "active", "closed", "in_progress", "completed"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated campaign list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        items: { type: "array", items: { $ref: "#/components/schemas/Campaign" } },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Brand role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/{campaignId}": {
      get: {
        tags: ["Campaigns"],
        summary: "Get campaign detail (brand)",
        operationId: "getCampaignDetail",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": {
            description: "Campaign detail",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Campaign" } } } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Brand role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "404": { description: "Campaign not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
      patch: {
        tags: ["Campaigns"],
        summary: "Update campaign draft (brand)",
        operationId: "updateDraft",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/CreateCampaignBody" }],
                description: "All fields optional — only draft campaigns can be updated",
              },
            },
          },
        },
        responses: {
          "200": { description: "Draft updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Campaign" } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Not the campaign owner or wrong role", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "404": { description: "Campaign not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Campaign is not in draft status", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/{campaignId}/publish": {
      post: {
        tags: ["Campaigns"],
        summary: "Publish a draft campaign (brand)",
        operationId: "publishCampaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Campaign published", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Campaign" } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Not the campaign owner or wrong role", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Campaign missing required fields or not in draft", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/{campaignId}/unpublish": {
      post: {
        tags: ["Campaigns"],
        summary: "Unpublish an active campaign (brand)",
        operationId: "unpublishCampaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Campaign unpublished — reverts to draft", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Campaign" } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Campaign not in active status", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/campaigns/{campaignId}/close": {
      post: {
        tags: ["Campaigns"],
        summary: "Close a campaign (brand)",
        operationId: "closeCampaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Campaign closed — pending bids auto-declined", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Campaign" } } } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Campaign not in active status", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ── Bids ───────────────────────────────────────────────────────────────
    "/api/v1/bids": {
      post: {
        tags: ["Bids"],
        summary: "Submit a bid (creator)",
        operationId: "submitBid",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SubmitBidBody" } } },
        },
        responses: {
          "201": {
            description: "Bid submitted",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCampaign" } } } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "403": { description: "Creator role required", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "409": { description: "Already bid on this campaign", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Campaign not accepting bids", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/my": {
      get: {
        tags: ["Bids"],
        summary: "Get creator's own bids",
        operationId: "getCreatorBids",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["submitted", "shortlisted", "accepted", "declined", "withdrawn"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated creator bids",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/BidWithCampaign" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/my/campaign/{campaignId}": {
      get: {
        tags: ["Bids"],
        summary: "Get creator's bid for a specific campaign",
        operationId: "getCreatorBidForCampaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Bid found", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCampaign" } } } } } },
          "404": { description: "No bid on this campaign", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/{bidId}/withdraw": {
      delete: {
        tags: ["Bids"],
        summary: "Withdraw a bid (creator)",
        operationId: "withdrawBid",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bidId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  withdrawReason: { type: "string", maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Bid withdrawn", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCampaign" } } } } } },
          "403": { description: "Not your bid", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Bid cannot be withdrawn", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/campaign/{campaignId}": {
      get: {
        tags: ["Bids"],
        summary: "Get bids for a campaign (brand)",
        operationId: "getBidsForCampaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "campaignId", in: "path", required: true, schema: { ...OBJECT_ID } },
          { name: "status", in: "query", schema: { type: "string", enum: ["submitted", "shortlisted", "accepted", "declined", "withdrawn"] } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["amount_asc", "amount_desc", "match_score_desc", "submitted_at_desc"], default: "submitted_at_desc" } },
          { name: "bidIds", in: "query", description: "Comma-separated IDs to compare up to 5 bids side-by-side", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated bids with creator snapshots",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/BidWithCreator" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } } } },
          },
          "403": { description: "Brand role required or not the campaign owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/{bidId}/shortlist": {
      post: {
        tags: ["Bids"],
        summary: "Shortlist a bid (brand)",
        operationId: "shortlistBid",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bidId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Bid shortlisted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCreator" } } } } } },
          "403": { description: "Not the campaign owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Bid cannot be shortlisted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
      delete: {
        tags: ["Bids"],
        summary: "Remove from shortlist (brand)",
        operationId: "unshortlistBid",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bidId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Bid removed from shortlist", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCreator" } } } } } },
          "422": { description: "Bid is not shortlisted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/{bidId}/decline": {
      post: {
        tags: ["Bids"],
        summary: "Decline a bid (brand)",
        operationId: "declineBid",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bidId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { declineReason: { type: "string", maxLength: 500 } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Bid declined", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/BidWithCreator" } } } } } },
          "422": { description: "Bid cannot be declined", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/bids/{bidId}/accept": {
      post: {
        tags: ["Bids"],
        summary: "Accept a bid and initiate escrow (brand)",
        description: "Accepts the bid, auto-declines all other submitted/shortlisted bids for the campaign, and triggers Razorpay payment link creation.",
        operationId: "acceptBid",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "bidId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Bid accepted — escrow initiated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/AcceptBidResult" } } } } } },
          "403": { description: "Not the campaign owner", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "409": { description: "Campaign already has an accepted bid", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Bid cannot be accepted in its current state", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ── Notifications ──────────────────────────────────────────────────────
    "/api/v1/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get notifications for authenticated user",
        operationId: "getNotifications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated notifications",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/Notification" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Get unread notification count",
        operationId: "getUnreadCount",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Unread count",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object", properties: { unreadCount: { type: "integer", example: 5 } } },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/notifications/{notificationId}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark a notification as read",
        operationId: "markAsRead",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "notificationId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Notification marked as read", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/Notification" } } } } } },
          "404": { description: "Notification not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        operationId: "markAllAsRead",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "All notifications marked as read",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { type: "object", properties: { modifiedCount: { type: "integer", example: 4 } } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Escrow ────────────────────────────────────────────────────────────
    "/api/v1/escrow": {
      get: {
        tags: ["Escrow"],
        summary: "List escrows for authenticated user",
        description: "Returns `EscrowBrandView[]` for brands, `EscrowCreatorView[]` for creators.",
        operationId: "listEscrows",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 20, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated escrows",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: {
                            oneOf: [
                              { $ref: "#/components/schemas/EscrowBrandView" },
                              { $ref: "#/components/schemas/EscrowCreatorView" },
                            ],
                          },
                        },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/escrow/{escrowId}": {
      get: {
        tags: ["Escrow"],
        summary: "Get escrow detail",
        description: "Returns `EscrowBrandView` for brands, `EscrowCreatorView` for creators.",
        operationId: "getEscrow",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "escrowId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": {
            description: "Escrow detail",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      oneOf: [
                        { $ref: "#/components/schemas/EscrowBrandView" },
                        { $ref: "#/components/schemas/EscrowCreatorView" },
                      ],
                    },
                  },
                },
              },
            },
          },
          "403": { description: "Not a party to this escrow", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "404": { description: "Escrow not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/escrow/{escrowId}/cancel": {
      post: {
        tags: ["Escrow"],
        summary: "Cancel escrow (brand)",
        description: "Only possible when status is `awaiting_payment`. Initiates refund if payment was already captured.",
        operationId: "cancelEscrow",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "escrowId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Escrow cancelled", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/EscrowBrandView" } } } } } },
          "403": { description: "Not the brand for this escrow", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "422": { description: "Cannot cancel in current status", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/escrow/{escrowId}/refresh-link": {
      post: {
        tags: ["Escrow"],
        summary: "Refresh Razorpay payment link (brand)",
        description: "Generates a new Razorpay order when the previous payment link expired.",
        operationId: "refreshPaymentLink",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "escrowId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": {
            description: "New payment link generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        razorpayOrderId: { type: "string", example: "order_QbXY9Z1234" },
                        totalChargedAmount: { type: "integer", description: "In paise" },
                      },
                    },
                  },
                },
              },
            },
          },
          "422": { description: "Escrow is not in awaiting_payment status", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ── Collab ────────────────────────────────────────────────────────────
    "/api/v1/collab": {
      get: {
        tags: ["Collab"],
        summary: "List my collab rooms",
        operationId: "getMyCollabRooms",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending_chat", "active", "content_submitted", "under_review", "revision_requested", "approved", "completed", "disputed"],
            },
          },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 20, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated collab rooms",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { type: "object", properties: { items: { type: "array", items: { $ref: "#/components/schemas/CollabRoomView" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    "/api/v1/collab/{collabRoomId}": {
      get: {
        tags: ["Collab"],
        summary: "Get collab room detail",
        operationId: "getCollabRoom",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "collabRoomId", in: "path", required: true, schema: { ...OBJECT_ID } },
        ],
        responses: {
          "200": { description: "Collab room detail", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" }, data: { $ref: "#/components/schemas/CollabRoomView" } } } } } },
          "403": { description: "Not a party to this room", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "404": { description: "Collab room not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },

    // ── Webhooks ──────────────────────────────────────────────────────────
    "/api/v1/webhooks/razorpay": {
      post: {
        tags: ["Webhooks"],
        summary: "Razorpay webhook receiver (internal)",
        description: "Called by Razorpay to notify payment events. Verified via HMAC-SHA256 signature. Not meant for frontend use.",
        operationId: "handleRazorpayWebhook",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                description: "Raw Razorpay webhook payload",
                properties: {
                  event: { type: "string", example: "payment.captured" },
                  payload: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Webhook processed" },
          "400": { description: "Invalid signature" },
        },
      },
    },
  },
};
