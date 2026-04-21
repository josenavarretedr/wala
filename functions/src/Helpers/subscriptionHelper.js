/* eslint-disable */

const VALID_PLANS = ['free', 'pro', 'max', 'premium'];

const PLAN_FEATURES = {
  max: {
    maxEmployees: 999999,
    maxProducts: 999999,
    advancedReports: true,
    multiLocation: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    aiClassification: true,
    exportData: true,
    shareLimit: 999999,
    groupSessions: true,
    localFairs: true,
  },
  premium: {
    maxEmployees: 999999,
    maxProducts: 999999,
    advancedReports: true,
    multiLocation: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    aiClassification: true,
    exportData: true,
    shareLimit: 999999,
    groupSessions: true,
    localFairs: true,
  },
  pro: {
    maxEmployees: 999999,
    maxProducts: 999999,
    advancedReports: true,
    multiLocation: false,
    apiAccess: false,
    prioritySupport: false,
    customBranding: true,
    aiClassification: false,
    exportData: true,
    shareLimit: 999999,
    groupSessions: false,
    localFairs: false,
  },
  free: {
    maxEmployees: 3,
    maxProducts: 999999,
    advancedReports: false,
    multiLocation: false,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    aiClassification: false,
    exportData: false,
    shareLimit: 20,
    groupSessions: false,
    localFairs: false,
  },
};

function normalizePlan(plan) {
  if (typeof plan !== 'string') return 'free';
  return VALID_PLANS.includes(plan) ? plan : 'free';
}

function isPaidPlan(plan) {
  const normalized = normalizePlan(plan);
  return normalized === 'pro' || normalized === 'max' || normalized === 'premium';
}

function getPlanBillingFields(plan) {
  const normalized = normalizePlan(plan);

  if (normalized === 'free') {
    return { planType: null, planVariant: null };
  }

  if (normalized === 'pro') {
    return { planType: 'pro_monthly', planVariant: 'pro_monthly' };
  }

  return {
    planType: `${normalized}_monthly`,
    planVariant: `${normalized}_monthly`,
  };
}

function getFeaturesForPlan(plan) {
  const normalized = normalizePlan(plan);
  return PLAN_FEATURES[normalized] || PLAN_FEATURES.free;
}

function buildSubscriptionPayload({
  existingSubscription = {},
  targetPlan,
  status = 'active',
  endDate = null,
  nowTimestamp,
  updatedBy = null,
}) {
  const normalizedPlan = normalizePlan(targetPlan);
  const { planType, planVariant } = getPlanBillingFields(normalizedPlan);

  const payload = {
    ...existingSubscription,
    plan: normalizedPlan,
    status,
    planType,
    planVariant,
    endDate: normalizedPlan === 'free' ? null : endDate,
    updatedAt: nowTimestamp,
  };

  if (!existingSubscription?.startDate) {
    payload.startDate = nowTimestamp;
  }

  if (updatedBy) {
    payload.updatedBy = updatedBy;
  }

  return payload;
}

module.exports = {
  VALID_PLANS,
  normalizePlan,
  isPaidPlan,
  getFeaturesForPlan,
  buildSubscriptionPayload,
};
